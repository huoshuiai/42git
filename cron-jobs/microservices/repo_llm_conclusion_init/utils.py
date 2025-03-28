import re


def clean_readme_content(content:str):
    # 去除 Markdown 標記
    content = re.sub(r'\[.*?\]\(.*?\)', '', content)  # 去除鏈接
    content = re.sub(r'!\[.*?\]\(.*?\)', '', content)  # 去除圖片
    content = re.sub(r'[#*`~]', '', content)  # 去除標題和其他標記
    content = re.sub(r'\n+', '\n', content)  # 合併多個連續的換行符
    # 去除 HTML 標記
    content = re.sub(r'<.*?>', '', content)
    # 去除特殊字符
    content = re.sub(r'[^\w\s]', '', content)
    # 去除多餘的空白字符
    content = re.sub(r'\s+', ' ', content).strip()
    return content