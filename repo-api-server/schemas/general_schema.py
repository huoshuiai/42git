from pydantic import BaseModel
import typing as t


class RepoInfo(BaseModel):
    title:str
    field: str
    link: str
    desc: str

class VectorPayload(BaseModel):
    vector: t.List[float]
    payload: RepoInfo

