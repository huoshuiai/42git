
from datetime import datetime, timezone
from sqlalchemy import MetaData, Table
from sqlalchemy.dialects.postgresql import insert

from common.db import AsyncLocalSession, Repository



class GitHubRepoSaver:
   
    def prepare_repo_object(self, repo):
        now = datetime.now(timezone.utc)
        iso_time = now.strftime('%Y-%m-%dT%H:%M:%SZ')  # 保持与 GitHub API 返回的时间格式一致

        return {
            "id": repo['id'],
            "name": repo['name'],
            "stars": repo['stargazers_count'],
            "forks": repo['forks_count'],
            "html_url": repo['html_url'],
            "description": '' if repo.get('description') is None else repo['description'],
            "topics": repo.get('topics', []),
            "created_at": repo['created_at'],
            "updated_at": repo['updated_at'],
            "crawled_at": iso_time
        }

    async def upsert_repositories(self, repo_objects):
        async with AsyncLocalSession() as db_session:
            stmt = insert(Repository).values(repo_objects).on_conflict_do_update(
                index_elements=['id'],
                set_={c.name: getattr(insert(Repository.__table__).excluded, c.name) for c in Repository.__table__.columns if c.name != 'id'}            )
            try:
                await db_session.execute(stmt)
                await db_session.commit()
            except Exception as e:
                await db_session.rollback()
                print(f"Error occurred: {e}")
            finally:
                await db_session.close()

    async def save_repositories_to_db(self, repositories): 
        repo_objects = []
        for repo in repositories:
            repo_obj = self.prepare_repo_object(repo)
            repo_objects.append(repo_obj)
      
        await self.upsert_repositories(repo_objects)

 
