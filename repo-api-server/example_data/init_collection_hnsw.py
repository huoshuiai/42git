import pandas as pd
from pathlib import Path
from typing import List
from tqdm import tqdm
from qdrant_client import QdrantClient, models

from utils.config import   QDRANT_URL, QDRANT_COLLECTION, EMBEDDINGS_MODEL, QDRANT_KEY



def load_csv(csv_name: str):
    # 獲取當前專案的根目錄路徑
    root_path = Path(__file__).parent.parent

    # 構建csv的絕對路徑
    file_name = csv_name+'.csv'
    csv_file_path = root_path / 'example_data' / file_name

    try:
        data = pd.read_csv(csv_file_path)
        return data
    except Exception as e:
        print(f"--error occur while loading csv: {e}")
        return None
    


def init_data():
    """
    這邊是要等服務起起來之後，直接load資料到db裡面；
    所以最好是本地embedding後、再把資料load 到遠端的qdrant中
    所以，應該直接跑本地的fast-embedding
    然後再連qdrant
    """
    qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_KEY,prefer_grpc=True)

    qdrant_client.set_model(EMBEDDINGS_MODEL)

    data = load_csv('[all]github_projects_core_clean02')
    payload = []
    documents = []
    for _, row in data.iterrows():
        desc = f"{row['about']}. In the field of {row['category']}, related with {row['item']}"
        author = row['project_repo'].split("/")[0]
        title = row['project_repo'].split("/")[1]

        link = f"https://github.com/{row['project_repo']}"

        documents.append(desc)
       
        payload.append({ 
            "title": title,
            "link": link,
            "about": str(row['about']),
            "stars": row['stars'],
            "author":author,
            "created_at": row['created_at'],
            "updated_at":row['updated_at'],
            "from_awesome_list": row['list_repo'],
        })

    qdrant_client.recreate_collection(
        collection_name="42git-hnsw",
        vectors_config=qdrant_client.get_fastembed_vector_params(on_disk=True),
        # Quantization is optional, but it can significantly reduce the memory usage
        hnsw_config=models.HnswConfigDiff(
            m=16, # 每個節點的邊數。數值越大 - 搜尋越準確，需要更多空間。
            ef_construct=100, # 考慮的鄰近node數量
            on_disk=True
        ),
    )

    qdrant_client.add(
        collection_name="42git-hnsw",
        documents=documents,
        metadata=payload,
        ids=tqdm(range(len(payload))),
        parallel=0,
    )
        
if __name__ == '__main__':
    init_data()

"""
目前看起來，qdrant在建立collection時
優化器有分為 hnsw_config 和 quantization_config
hnsw_config 就是以圖搜索優化為主
而quantization_config有三種優化方式：Scalar、Product、Binary；
這樣要如何選擇？
以 quantization_config 來說
- Scalar 準確性最高
- Binary 速度最快
- Product 最好的「壓縮比」，但準確性和速度都最低
"""