import re
import sys
import aiohttp
from aiokafka import AIOKafkaConsumer
from openai import OpenAI
import asyncio
from sqlalchemy.future import select
from sqlalchemy import text, update
import base64
from termcolor import colored
from asyncio import Lock


from common.config import github_header, DEEPSEEK_API_KEY
from common.db import  AsyncLocalSession, Repository
from microservices.repo_llm_conclusion_init.utils import clean_readme_content


SYS_PROMPT_TEMPLATE = """
You are a senior software engineer assistant, could to 
create a comprehensive and concise conclusion for GitHub repositories. 
You review the provided README content(without markdown format) and crafts a description, 
summary, and brief introduction about the repository. 
You will include the purpose of the repository, the languages used, 
and the issues it addresses. 
You should ensure the information is clear, 
detailed, and accurately reflects the repository's content and objectives. 
You should avoid technical jargon unless necessary and prioritize clarity 
and usefulness for all potential users.
"""



class LlmProcessor:
    def __init__(self):
        # using deepseak llm through openai sdk
        self.llm = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com") # key
        self.max_github_api_retry = 5
        self.locks = {}

    async def start_catchup_repo(self):
        offset = 0
        limit = 20

        while True:
            if offset > 10000:
                break
            repos = await self._get_repos_from_db(offset, limit)
            if not repos:
                break
            
            # TODO: 這個寫法是什麼？連接池嗎
            tasks = [self.process_repo(repo.id, repo.html_url.replace("https://github.com/","")) for repo in repos]
            await asyncio.gather(*tasks)
            offset += limit


    async def start_catchup_repo02(self):
        limit = 20
        last_created_at = None
        while True:
            repos = await self._get_repos_from_db02(last_created_at, limit)
            if not repos:
                break
            
            tasks = [self.process_repo02(repo.id, repo.html_url.replace("https://github.com/","")) for repo in repos]
            await asyncio.gather(*tasks)
            last_created_at = repos[-1].created_at
    
    async def _get_repos_from_db02(self, last_created_at, limit):
        async with AsyncLocalSession() as db_session:
            try:
                query = (
                    select(Repository.id, Repository.html_url)
                    .where(Repository.llm_conclusion == None)
                    .order_by(text("CAST(repositories.created_at AS TIMESTAMP) ASC"))
                    .with_for_update(skip_locked=True)
                    .limit(limit)
                )

                if last_created_at:
                    query = query.where(text("CAST(repositories.created_at AS TIMESTAMP) > CAST(:last_created_at AS TIMESTAMP)")).params(last_created_at=last_created_at)
                result = await db_session.execute(query)
                repos = result.fetchall()
                return repos
            except Exception as e:
                print(f"Error fetching repos: {e}")
                return []
            finally:
                await db_session.close()

    
    async def process_repo02(self, repo_id, repo_name):
       
        try:
            readme_filename = await self._get_readme_filename(repo_name)
            if readme_filename is None:
                return  # 跳過該儲存庫的處理
            readme_content = await self._get_repo_readme_content(repo_name, readme_filename)
            if readme_content is None:
                return  # 跳過該儲存庫的處理
            readme_clean_content = clean_readme_content(readme_content)
            if readme_clean_content is None:
                return  # 跳過該儲存庫的處理
            repo_conclusion = await self._get_repo_conclusion(repo_name, readme_clean_content)
            await self._save_conclusion(repo_id, repo_conclusion)
        
        except Exception as e:
            print(f"Error processing repo_id {repo_id}: {e}")

    async def _get_repos_from_db(self, offset, limit):
        async with AsyncLocalSession() as db_session:
            try:
                result = await db_session.execute(
                    select(Repository.id, Repository.html_url)
                    .where(Repository.llm_conclusion == None)
                    .offset(offset)
                    .limit(limit)
                )
                repos = result.fetchall()
                return repos
            except Exception as e:
                print(f"Error fetching repos: {e}")
                return []
            finally:
                await db_session.close()

    async def process_repo(self, repo_id, repo_name):
        if repo_id not in self.locks:
            self.locks[repo_id] = Lock()

        # using async lock to dealwith race-condition
        async with self.locks[repo_id]:
            try:
                readme_filename = await self._get_readme_filename(repo_name)
                if readme_filename is None:
                    return  # 跳過該儲存庫的處理
                readme_content = await self._get_repo_readme_content(repo_name, readme_filename)
                if readme_content is None:
                    return  # 跳過該儲存庫的處理
                readme_clean_content = clean_readme_content(readme_content)
                if readme_clean_content is None:
                    return  # 跳過該儲存庫的處理
                repo_conclusion = await self._get_repo_conclusion(repo_name, readme_clean_content)
                await self._save_conclusion(repo_id, repo_conclusion)
            
            except Exception as e:
                print(f"Error processing repo_id {repo_id}: {e}")
    
    async def _get_repo_readme_content(self, repo_name:str, readme_file_name: str):
        url = f"https://api.github.com/repos/{repo_name}/contents/{readme_file_name}"
        retries = 0
        while retries < self.max_github_api_retry:
            async with aiohttp.ClientSession() as fetch_session:
                async with fetch_session.get(url, headers=github_header) as response:
                    if response.status == 403:
                        print("Too many requests at a period, sleeping for 10 seconds, then retrying...")
                        await asyncio.sleep(10)
                        retries += 1
                        continue
                    if response.status == 443:
                        print("Github server issue, sleeping for 10 seconds, then retrying...")
                        await asyncio.sleep(10)
                        retries += 1
                        continue
                    if response.status != 200:
                        print(f"Failed to fetch readme contents for {repo_name}, status code: {response.status}")
                        return None
                    
                    res_json = await response.json()
    
                    data = res_json.get('content')
                    if data:
                        readme_content = base64.b64decode(data).decode('utf-8')
                        return readme_content
        return None
                   
                
    async def _get_readme_filename(self, repo_name: str):
        url = f"https://api.github.com/repos/{repo_name}/contents"
        retries = 0
        while retries < self.max_github_api_retry:
            async with aiohttp.ClientSession() as fetch_session:
                async with fetch_session.get(url, headers=github_header) as response:
                    if response.status ==  403:
                        print("Too many requests at a period, sleeping for 10 seconds, then retrying...")
                        await asyncio.sleep(10)
                        retries += 1
                        continue
                    if response.status == 443:
                        print("Github server issue, sleeping for 10 seconds, then retrying...")
                        await asyncio.sleep(10)
                        retries += 1
                        continue
                    if response.status != 200:
                        print(f"Failed to fetch readme file name for {repo_name}, status code: {response.status}")
                        return None
                    res_json = await response.json()

                    # 找到 README 文件
                    readme_file = next((file for file in res_json if file['name'].lower() == 'readme.md'), None)
                    
                    return readme_file['name'] if readme_file else None
        return None


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
            return response.choices[0].message.content
        except Exception as e:
            error_message = str(e)
            if "402 - Insufficient Balance" in error_message:
                print(colored(f"Error: {error_message}, 沒錢了", "red"))
                sys.exit(1)
            else:
                print(colored(f"get_repo_conclusion error:\n{e}", "red"))
                return "CANNOT GET CONCLUSION"
            


    async def _save_conclusion(self, repo_id, conclusion):
        if conclusion is None:
            print(colored(f"No valid conclusion for repo_id {repo_id}"), 'red')
            return

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
