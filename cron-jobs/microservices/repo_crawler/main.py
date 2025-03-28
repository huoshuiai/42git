import asyncio
from microservices.repo_crawler.async_crawler import GitHubRepoFetcher
from microservices.repo_crawler.async_repo_saver import GitHubRepoSaver
from common.db import async_init_db
from common.config import GITHUB_MIN_STARS

async def main():
    print("Starting repo crawler service")
    await async_init_db()
    repo_saver = GitHubRepoSaver()
    repo_fetcher = GitHubRepoFetcher(min_stars=GITHUB_MIN_STARS, step=500, saver=repo_saver)
    await repo_fetcher.fetch_and_save_repositories()
    print("Completed fetching and saving repositories with stars > 1000")

if __name__ == "__main__":
    asyncio.run(main())
