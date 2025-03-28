import asyncio
from typing import List
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json

from utils.repo_structure import RepositoryStructureAsyncGenerator
from .router import router
from db.qdrant_db import QdrantConnection
from utils.config import  QDRANT_COLLECTION


class SearchQuery(BaseModel):
    query:str

class RepoNameQuery(BaseModel):
    reponame:str

class SearchSimialrQuery(BaseModel):
    query:str
    previous_queries: List[str]

class RepoIdQuery(BaseModel):
    repo_id:str

qdrant_client = QdrantConnection(QDRANT_COLLECTION)

@router.get('/')
def init():
    return JSONResponse(status_code=200, content="init fastapi success")

@router.get("/api/v1/repo")
async def get_repo_by_id(id):
    try:
        data = await qdrant_client.get_report_by_id(id)
        return JSONResponse(status_code=200, content=data)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error while search repo by id:{id}, reason:{e}"})



@router.post("/api/v1/seach_repos")
async def search_repo(payload:SearchQuery ):
    try:
        data = await qdrant_client.search_similar(payload.query, 12)
        return JSONResponse(status_code=200, content=data)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error while search similar repo, reason:{e}"})



@router.post("/api/v1/similar_repos_with_exclude")
async def search_simialr_repos_with_exclude(payload:SearchSimialrQuery ):
    try:
        data = await qdrant_client.search_similar_with_exclude(payload.query, payload.previous_queries, 7)
        return JSONResponse(status_code=200, content=data)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error while search similar repo, reason:{e}"})
    


@router.post("/api/v1/repo_structure")
async def get_repo_structre(payload:RepoNameQuery):
    print(payload)
    try:
        # maybe could check the redis catch
        repo_structure_executor = RepositoryStructureAsyncGenerator(payload.reponame)
        yaml_str = await asyncio.wait_for(repo_structure_executor.generate(), timeout=30)
        return JSONResponse(status_code=200, content={"repo_structure_yaml_str":yaml_str})
    except asyncio.TimeoutError:
        await repo_structure_executor.free_temp_directory()
        return JSONResponse(status_code=500, content={"message": "Timeout while generating repo structure"})

    except Exception as e:
        await repo_structure_executor.free_temp_directory()
        return JSONResponse(status_code=500, content={"message": f"Error while generate repo structure, reason:{e}"})
    

