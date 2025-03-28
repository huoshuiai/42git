import re
import aiohttp
from aiokafka import AIOKafkaConsumer
from openai import OpenAI
import asyncio
from sqlalchemy.future import select
from sqlalchemy import MetaData, Table, update
import base64
from fastembed import TextEmbedding
from qdrant_client import AsyncQdrantClient, QdrantClient, models
from qdrant_client.models import PointStruct
from termcolor import colored

from common.config import EMBEDDINGS_MODEL, KAFKA_SERVER_URL, QDRANT_KEY, QDRANT_URL, github_header, DEEPSEEK_API_KEY
from common.db import  AsyncLocalSession, Repository


SYS_PROMPT_TEMPLATE = """
You are a senior software engineer assistant, could to 
create a comprehensive and concise conclusion for GitHub repositories. 
You review the provided README content and crafts a description, 
summary, and brief introduction about the repository. 
You will include the purpose of the repository, the languages used, 
and the issues it addresses. 
You should ensure the information is clear, 
detailed, and accurately reflects the repository's content and objectives. 
You should avoid technical jargon unless necessary and prioritize clarity 
and usefulness for all potential users.
"""



def get_author_from_url(github_url:str):
    pattern = r'https://github\.com/([^/]+)/([^/]+)'
    match = re.match(pattern, github_url)
    author = match.group(1)
    return author

class LlmProcessor:
    def __init__(self):
        # using deepseak llm through openai sdk
        self.llm = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com") # key
        self.embedding_model = TextEmbedding(model_name=EMBEDDINGS_MODEL)
        self.queue = asyncio.Queue()
        self.batch_size = 5
        self.batch_interval = 30  # seconds
        self._batch_event = asyncio.Event()
        asyncio.create_task(self._batch_processor())
        asyncio.create_task(self._batch_timer())
        self.qdrant_client = AsyncQdrantClient(url=QDRANT_URL, api_key=QDRANT_KEY,prefer_grpc=True)

        self.kafka_consumer = AIOKafkaConsumer(
            "repo_embedding_dev",
            bootstrap_servers=[KAFKA_SERVER_URL],
            group_id="sample-group-01",
            auto_offset_reset='earliest',
            enable_auto_commit=False,  # 關閉自動提交
            max_poll_interval_ms=1900000,  # 增加poll間隔時間
            session_timeout_ms=120000,  # Set to 1 minute
            max_poll_records=5  # 減少每次poll返回的記錄數
        )

    async def consume_embedding(self):
        await self.kafka_consumer.start()
        try:
            async for msg in self.kafka_consumer:
                repo_id = int(msg.value.decode("utf-8"))
                await self.process_repo(repo_id)
                print(f"---complete repo id {repo_id} process")
                await self.kafka_consumer.commit()  # 手動提交偏移量
        finally:
            print(f"---consumer finaly stop")
            await self.kafka_consumer.stop()


    async def process_repo(self, repo_id):
        try:
            print(f"---enter embedding processor")
            repo = await self._get_repo_from_id(repo_id)
            if not repo:
                raise Exception(f"not found repo_id name :{repo_id}")
            repo_name = repo.html_url.replace("https://github.com/","")
            readme_content = await self._get_repo_readme_content(repo_name)
            print(f"---get readme_content")
            repo_conclusion = await self._get_repo_conclusion(repo_name, readme_content)
            print(f"---get repo_conclusion")
            await self._save_conclusion(repo_id, repo_conclusion)
            print(f"---get repo_conclusion")
            # TODO: 如果因為沒辦法獲取conclusion（可能超過max token，先返回、不進入embedding queue）
            if repo_conclusion == "CANNOT GET CONCLUSION":
                return 

            # 整理完payload後，放到queue裡面
            repo_payload = {
                "id": repo.id,
                "payload":{
                    "title": repo.name,
                    "link": repo.html_url,
                    "about": repo.description,
                    "stars": repo.stars,
                    "forks": repo.forks,
                    "author": get_author_from_url(repo.html_url),
                    "created_at": repo.created_at,
                    "updated_at": repo.updated_at,
                }
            }

            # push to queue, batch handler for qdrant
            await self.queue.put((repo_id, repo_payload, repo_conclusion))

            # 如果達到批量大小，觸發批量事件
            if self.queue.qsize() >= self.batch_size:
                self._batch_event.set()
           

        except Exception as e:
            print(f"Error processing repo_id {repo_id}: {e}")
            #print(f"Error processing repo_id {repo_name}: {e}")
    
    async def _batch_processor(self):
        print(f"---enter embedding _batch_processor")
        while True:
            await self._batch_event.wait()  # 等待事件觸發
            batch = []
            while not self.queue.empty() and len(batch) < self.batch_size:
                batch.append(await self.queue.get())
            
            if batch:
                await self._process_batch(batch)
            
            # 重置事件
            self._batch_event.clear()

    async def _batch_timer(self):
        while True:
            await asyncio.sleep(self.batch_interval)
            self._batch_event.set()  # 每10秒觸發一次批量事件

    async def _process_batch(self, batch):
        repo_ids, repo_payloads, repo_conclusions = zip(*batch)
        vectors = self._embedding_text(repo_conclusions)
        print(f"---batch vectors, len of batch :{len(batch)}")
        await self._upsert_qdrant(repo_ids, repo_payloads, vectors)


    async def _upsert_qdrant(self, ids, payloads, vectors):
        try:
            points = [
                PointStruct(
                    id=_id,
                    vector=vector,
                    payload=payload
                )
                for _id, payload, vector in zip(ids, payloads, vectors)
            ]
            await self.qdrant_client.upsert(
                collection_name="42git-hnsw-local",
                points=points
            )
        except Exception as e:
            print(e)

    
    async def _get_repo_readme_content(self, repo_name:str):
        url = f"https://api.github.com/repos/{repo_name}/contents/README.md"
        async with aiohttp.ClientSession() as fetch_session:
            async with fetch_session.get(url, headers=github_header) as response:
                res_json = await response.json()
 
                data = res_json.get('content')
                readme_content = base64.b64decode(data)
                return readme_content


    async def _get_repo_from_id(self, repo_id):
         async with AsyncLocalSession() as db_session:
            try:
                result = await db_session.execute(select(Repository).where(Repository.id == repo_id))
                repo = result.scalar_one_or_none()
                if repo:
                    return repo
                else:
                    raise ValueError(f"Repository with id {repo_id} not found")
            except Exception as e:
                print(f"Error fetching repo name for repo_id {repo_id}: {e}")
                return None
            finally:
                await db_session.close()
    
    
    async def _get_repo_conclusion(self, repo_name:str, readme_content:str):
        try:
            response = self.llm.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": SYS_PROMPT_TEMPLATE},
                    {"role": "user", "content": f"please check the repo {repo_name}, and following the readme content: \n {readme_content}"},
                ],
                max_tokens=4096,
                temperature=0.2,
                stream=False
            )
            # should be json format
        except Exception as e:
            print(colored(f"get_repo_conclusion error:\n{e}", "red"))
            return "CANNOT GET CONCLUSION"
        return response.choices[0].message.content


    async def _save_conclusion(self, repo_id, conclusion):
        async with AsyncLocalSession() as db_session:
            try:
                # 更新屬性值 (只需要更新屬性、不需要訪問的話，用update語句比較有效率)
                stmt = (
                    update(Repository)
                    .filter_by(id=repo_id)
                    .values(llm_conclusion=conclusion)  
                    .execution_options(synchronize_session="fetch")
                )
                await db_session.execute(stmt)
                await db_session.commit()
            except Exception as e:
                print(f"Error fetching repo name for repo_id {repo_id}: {e}")
                return None
            finally:
                await db_session.close()

    def _embedding_text(self, llm_conclusion):
        vectors = list(self.embedding_model.embed(llm_conclusion))
        return vectors


if __name__ == "__main__":
    processor = LlmProcessor()
    asyncio.run(processor.process_repo(353561))