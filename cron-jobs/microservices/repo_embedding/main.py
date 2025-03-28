import asyncio
from microservices.repo_embedding.async_embedding import LlmProcessor


async def main():
    processor = LlmProcessor()
    await processor.consume_embedding()
  

if __name__ == "__main__":
   asyncio.run(main())