import asyncio
import json
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from sqlalchemy.future import select

from common.config import KAFKA_SERVER_URL
from microservices.repo_structure.async_repo_structure import RepositoryStructureAsyncGenerator
from common.db import  AsyncLocalSession, Repository

class RepoProcessor:
    def __init__(self):
        self.name = "RepoProcessor"
        self.kafka_consumer = AIOKafkaConsumer(
            "repo_queue_dev",
            bootstrap_servers=[KAFKA_SERVER_URL],
            group_id="sample-group",
            auto_offset_reset='earliest',
            enable_auto_commit=False  # 關閉自動提交
        )
        self.kafka_embedding_producer = AIOKafkaProducer(
            bootstrap_servers=[KAFKA_SERVER_URL],
        )

    async def consume_repo(self):
        await self.kafka_consumer.start()
        await self.kafka_embedding_producer.start()
        try:
            async for msg in self.kafka_consumer:
                repo_id = int(msg.value.decode("utf-8"))
                await self.process_repo(repo_id)
                print(f"---complete repo id {repo_id} process")
                await self.kafka_consumer.commit()  # 手動提交偏移量
        finally:
            print(f"---consumer finaly stop")
            await self.kafka_consumer.stop()
            await self.kafka_embedding_producer.stop()

    async def process_repo(self, repo_id):
        print(f"in RepoProcessor, repo_id:{repo_id}")
        try:
            
            repo = await self.get_repo_from_id(repo_id)  
            print(f"---found repo: {repo}")   
            if not repo:
                raise Exception(f"not found repo_id name :{repo_id}")
            
            repo_git_name = repo.html_url.replace("https://github.com/", "")
            repo_structure_executor = RepositoryStructureAsyncGenerator(repo_git_name)
            
            # timeout setting, in case `git clone` take too much time
            yaml_str = await asyncio.wait_for(repo_structure_executor.generate(), timeout=30)


            await self.save_structure_to_db(repo_id, yaml_str)  # 假設這是一個將結構保存到數據庫的異步方法
            
            repo_llm_conclusion = repo.llm_conclusion

            # Produce
            if not repo_llm_conclusion:
                print(f"---push repo id {repo_id} in kafka_embedding_producer")
                await self.kafka_embedding_producer.send_and_wait("repo_embedding_dev", value=str(repo_id).encode(encoding='UTF-8'))
              
        except asyncio.TimeoutError:
                print(f"Processing repo_id {repo_id} timed out, requeueing")
              
        except Exception as e:
            print(f"Error processing repo_id {repo_id}: {e}")
      
    
    async def get_repo_from_id(self, repo_id):
        # 這裡應該包含從 repo_id 獲取 repo 名稱的邏輯
        # 這是一個占位函數，實際實現應該根據具體需求來編寫
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
    
    async def save_structure_to_db(self, repo_id, yaml_str):
       
        async with AsyncLocalSession() as db_session:
            try:
                stmt = select(Repository).filter_by(id=repo_id)
                result = await db_session.execute(stmt)
                repo = result.scalar_one_or_none()
                if repo:
                    # 更新记录的属性
                    repo.repo_structure = yaml_str
                    # 顯式更新
                    db_session.add(repo)
                    await db_session.commit()
                    print(f"Updated repo_id {repo_id} with new yaml_str")
                else:
                    print(f"Repository with id {repo_id} not found")
            except Exception as e:
                print(f"Error saving structure to db for repo_id {repo_id}: {e}")
            finally:
                await db_session.close()

