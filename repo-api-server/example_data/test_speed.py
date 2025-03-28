import httpx
import asyncio
import time
import pandas as pd

async def fetch(url, payload):
    async with httpx.AsyncClient() as client:
        start_time = time.time()
        response = await client.post(url, json=payload)
        duration = time.time() - start_time
        return duration

async def test_api(url, payload, n_requests):
    tasks = [fetch(url, payload) for _ in range(n_requests)]
    durations = await asyncio.gather(*tasks)
    return durations

async def main():
    base_url = "http://localhost:1234/test_api/seach_repos"
    payload = {"query": "微信"}
    n_requests = 10  # 這裡可以根據需要調整請求的次數

    # 分別測試三個API端點
    binary_durations = await test_api(f"{base_url}/binary", payload, n_requests)
    hnsw_durations = await test_api(f"{base_url}/hnsw", payload, n_requests)
    scalar_durations = await test_api(f"{base_url}/scalar", payload, n_requests)

    # 將結果存儲到DataFrame中
    df = pd.DataFrame({
        "Binary": binary_durations,
        "HNSW": hnsw_durations,
        "Scalar": scalar_durations
    })

    print(df.describe())  # 印出每個API的描述性統計數據

if __name__ == "__main__":
    asyncio.run(main())
