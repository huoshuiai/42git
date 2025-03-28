import asyncio
from microservices.repo_structure.async_repo_processor import RepoProcessor


async def main():
    print("Starting repo structure service")
    processor = RepoProcessor()
    await processor.consume_repo()



if __name__ == "__main__":
   asyncio.run(main())