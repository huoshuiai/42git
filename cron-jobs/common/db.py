from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine

from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from common.config import DATABASE_URL, DATABASE_URL_ASYNC

Base = declarative_base()

repos_table_name = 'repositories'

class Repository(Base):
    __tablename__ = repos_table_name

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    stars = Column(Integer, nullable=False)
    forks = Column(Integer, nullable=False)
    html_url= Column(String, nullable=False)
    description = Column(String, nullable=False)
    topics = Column(ARRAY(String))
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    crawled_at = Column(String, nullable=False)
    llm_conclusion = Column(Text, nullable=True)  # 新增欄位
    repo_structure = Column(Text, nullable=True) # 需要長文本
    #llm_conclusion_02 = Column(Text, nullable=True)  # 新增欄位


engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# 創建表格（如果它們還不存在的話）
def init_db():
    Base.metadata.create_all(engine)

# 创建异步引擎和会话
async_engine = create_async_engine(DATABASE_URL_ASYNC, echo=True)
AsyncLocalSession = sessionmaker(async_engine, expire_on_commit=False, class_=AsyncSession)


async def async_init_db():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)