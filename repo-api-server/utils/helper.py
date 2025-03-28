import pandas as pd
from pathlib import Path
from typing import List


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
    
def parse_vector(vector_str:str):
    """
    将表示向量的字符串解析为数字列表。
    :param vector_str: 表示向量的字符串，例如 '[1, 2, 3]'
    :return: 数字列表
    """
    # 去除方括号并按空格分割
    vector_str = vector_str.strip('[]')
    # 将字符串分割成单独的数字，并转换为float
    vector = [float(x) for x in vector_str.split()]
    return vector

def format_data(data):
    formatted_data = []

    for _, row in data.iterrows():
        item = {
            "vector": row['embedding_desc'],  # 假设这是一个向量表示
            "payload": {
                "title": row['title'],
                "link": row['link'],
                "desc": row['desc'],
                "field": row['field']
            }
        }
        formatted_data.append(item)

    return formatted_data

