from pydantic import Field
from qdrant_client import QdrantClient, AsyncQdrantClient
from fastapi import HTTPException
from qdrant_client.http.models.models import Filter, FieldCondition, MatchValue

import typing as t


from utils.config import  QDRANT_URL, QDRANT_COLLECTION, EMBEDDINGS_MODEL, QDRANT_KEY

"""
這邊是不是在這裡，不需要創建collection；
而是在 `init_collection`之類的python script中
創建collection以及把資料導入進入
"""
class QdrantConnection:
    def __init__(self, collection_name:str):
        self.client = AsyncQdrantClient(url=QDRANT_URL, api_key=QDRANT_KEY,prefer_grpc=True)
        self.client.set_model(EMBEDDINGS_MODEL)

        self.collection = collection_name
     


    def upload_and_embedding(self, payload):
        """
        payload should be repos' id, llm_conclusion,
        """
        print("payload")

    async def get_report_by_id(self, id:str):
        try:
            result = await self.client.retrieve(
                collection_name= self.collection ,
                ids=[int(id)],
            )
            data = result[0]
            return {
                "id": data.id,
                'data': data.payload
            }
        except Exception as e:
            print(f"Error happen while get_report_by_id, error:{e}")
            raise HTTPException(status_code=500, detail=f"Error happen while searchinb by id, error:{e}")
        
    async def search_similar(self, search_query:str, search_limit: int):
        try:
            result = []
            hits = await self.client.query(
                collection_name=self.collection,
                query_text=search_query,
                limit = search_limit
            )
            for hit in hits:
                print(hit)
                result.append({
                    "id": hit.id,
                    "data":hit.metadata
                })
            
            return result
        except Exception as e:
            print(f"Error happen while search similar query, error:{e}")
            raise HTTPException(status_code=500, detail=f"Error happen while search similar query, error:{e}")
        
    async def search_similar_with_exclude(self, query:str, previous_desc,search_limit: int):
        try:
            result = []
            filer_id_condition = [FieldCondition(key="about", match=MatchValue(value=desc)) for desc in previous_desc]
            hits =  await self.client.query(
                collection_name=self.collection,
                query_text=query,
                query_filter=Filter(must_not=filer_id_condition),
                limit = search_limit
            )
            for hit in hits:
                print(hit)
                result.append({
                    "id": hit.id,
                    "data":hit.metadata
                })
            
            return result
        except Exception as e:
            print(f"Error happen while search similar query, error:{e}")
            raise HTTPException(status_code=500, detail=f"Error happen while search similar query, error:{e}")