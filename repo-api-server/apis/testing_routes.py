from fastapi.responses import JSONResponse
from apis.repo_routes import SearchQuery
from db.qdrant_db import QdrantConnection
from .router import router



qdrant_client_binary =  QdrantConnection('42git-binary')
qdrant_client_hnsw =  QdrantConnection('42git-hnsw')
qdrant_client_scalar =  QdrantConnection('42git-scalar')


@router.post("/test_api/seach_repos/binary")
def search_repo_binary( payload:SearchQuery ):
    try:
        data = qdrant_client_binary.search_similar(payload.query, 7)
        return JSONResponse(status_code=200, content=data)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error while search similar repo, reason:{e}"})

@router.post("/test_api/seach_repos/hnsw")
def search_repo_hnsw( payload:SearchQuery ):
    try:
        data = qdrant_client_hnsw.search_similar(payload.query, 7)
        return JSONResponse(status_code=200, content=data)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error while search similar repo, reason:{e}"})

@router.post("/test_api/seach_repos/scalar")
def search_repo_scalar( payload:SearchQuery ):
    try:
        data = qdrant_client_scalar.search_similar(payload.query, 7)
        return JSONResponse(status_code=200, content=data)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error while search similar repo, reason:{e}"})
