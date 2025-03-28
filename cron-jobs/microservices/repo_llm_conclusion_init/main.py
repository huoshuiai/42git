import asyncio
from microservices.repo_llm_conclusion_init.async_llm_conclusion import LlmProcessor


async def main():
    processor = LlmProcessor()
    await processor.start_catchup_repo()
  

if __name__ == "__main__":
   asyncio.run(main())