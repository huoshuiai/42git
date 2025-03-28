import asyncio
import aiohttp
from aiokafka import AIOKafkaProducer
from common.config import KAFKA_SERVER_URL, github_url, github_header, DATABASE_URL_ASYNC
from common.db import AsyncLocalSession


class GitHubRepoFetcher:
    def __init__(self, min_stars, step=500 , saver=None, queue_connection=None):
        self.min_stars = min_stars
        self.saver = saver
        #self.queue_connection = queue_connection
        self.step = step
        self.kafka_producer = AIOKafkaProducer(
            bootstrap_servers=[KAFKA_SERVER_URL],
        )

    async def fetch_repositories_within_star_range(self, min_stars, max_stars):
        repos = []
        page = 1
        total = None
        while True:
            params = {
                'q': f'stars:{min_stars}..{max_stars}',
                'sort': 'stars',
                'order': 'desc',
                'per_page': 100,
                'page': page
            }
            
            async with aiohttp.ClientSession() as fetch_session:
                async with fetch_session.get(github_url, headers=github_header, params=params) as response:
                    print(f"Fetching page stars from {min_stars} to {max_stars}, page: {page}")
                    
                    if response.status == 403:
                        print("Too many requests at a period, sleeping for 10 seconds, then retrying...")
                        await asyncio.sleep(10)
                        continue
                    
                    if response.status != 200:
                        print(f"Error fetching data: {response.status}")
                        break
                    
                    data = await response.json()
                    if total is None:
                        total = data.get("total_count")
                    
                    repos.extend(data.get('items', []))
                    
                    if total <= len(repos) or len(data.get('items', [])) < 100 or 'next' not in response.links:
                        break
                    
                    page += 1
                    await asyncio.sleep(3)
    
        return repos

    async def check_if_range_exceeds_limit(self, min_stars, max_stars):
        params = {
            'q': f'stars:{min_stars}..{max_stars}',
            'sort': 'stars',
            'order': 'desc',
            'per_page': 1,
            'page': 1
        }
        
        async with aiohttp.ClientSession() as check_session:
            async with check_session.get(github_url, headers=github_header, params=params) as response:
                if response.status != 200:
                    print(f"Error fetching data: {response.status}")
                    return False

                data = await response.json()
                total_count = data.get('total_count', 0)
                return total_count > 1000

    async def fetch_and_save_repositories(self):
        await self.start_kafka_producer()

        try:
            current_min_stars = self.min_stars

            while True:
                current_max_stars = current_min_stars + self.step
                fetched = await self._fetch_and_save_repositories_in_range(current_min_stars, current_max_stars)
                if not fetched:
                    self.step = self.step * 2
                    if self.step > 200000:
                        print(f"No more repositories to fetch in range {current_min_stars} to {current_max_stars}")
                        break

                current_min_stars = current_max_stars + 1
        finally:
            await self.stop_kafka_producer()

    async def _fetch_and_save_repositories_in_range(self, min_stars, max_stars):
   
        if await self.check_if_range_exceeds_limit(min_stars, max_stars):
            mid_stars = (min_stars + max_stars) // 2
            fetched1 = await self._fetch_and_save_repositories_in_range(min_stars, mid_stars)
            fetched2 = await self._fetch_and_save_repositories_in_range(mid_stars + 1, max_stars)
            return fetched1 or fetched2
        else:
            repos = await self.fetch_repositories_within_star_range(min_stars, max_stars)
            print(f"--- after fetch_repositories_within_star_range, repo:{repos}")
            if not repos:
                return False
           
            try:
                await self.saver.save_repositories_to_db(repos)
                print(f"--- afterself.saver.save_repositories_to_db")
                print(f"Finished repositories with stars from {min_stars} to {max_stars}, total {len(repos)}")
                print("---push repos into kafka")
                for repo in repos:
                   await self.kafka_producer.send_and_wait("repo_queue_dev", value=str(repo['id']).encode(encoding='UTF-8'))
            except Exception as e:
                print(f"---publishing kafka error: {e}")
           
            return True

    async def start_kafka_producer(self):
        await self.kafka_producer.start()

    async def stop_kafka_producer(self):
        await self.kafka_producer.stop()
