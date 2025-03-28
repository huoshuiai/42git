from fastembed.embedding import FlagEmbedding as Embedding
from typing import List
import numpy as np
import requests
from bs4 import BeautifulSoup
import markdown
import re
import pandas as pd



repo_user = 'sindresorhus'  # 替換為目標用戶名
repo_name = 'awesome'  # 替換為目標存儲庫名

def get_readme_content(repo_user, repo_name):
    url = f"https://api.github.com/repos/{repo_user}/{repo_name}/readme"
    response = requests.get(url, headers={"Accept": "application/vnd.github.v3.raw"})
    if response.status_code == 200:
        return response.text
    else:
        return None

def extract_markdown_links(markdown_content):
    pattern = r'\[([^\]]+)\]\((http[s]?://[^\)]+)\)'
    matches = re.findall(pattern, markdown_content)
    return {text: url for text, url in matches}

readme_content = get_readme_content(repo_user, repo_name)

def parse_markdown(markdown_content):
    lines = markdown_content.split('\n')
    current_field = None
    entries = []

    field_pattern = r'^##\s+(.*)'
    link_pattern = r'\-\s+\[(.*?)\]\((.*?)\)\s*\-?\s*(.*)'

    for line in lines:
        field_match = re.match(field_pattern, line)
        if field_match:
            current_field = field_match.group(1)
        else:
            link_match = re.match(link_pattern, line)
            if link_match and current_field:
                title, link, desc = link_match.groups()
                entries.append({
                    "field": current_field,
                    "title": title,
                    "link": link,
                    "desc": desc
                })

    return entries

def create_dataframe_and_filter(parsed_markdown_content):
    df = pd.DataFrame(parsed_markdown_content)
    filtered_df = df[df['field'] != 'Contents']
    return filtered_df

if readme_content:
    external_links =parse_markdown(readme_content)
    df = create_dataframe_and_filter(external_links)

else:
    print("無法獲取README.md內容")

df.reset_index(drop=True, inplace=True)
df['desc'] = df['desc'].replace('', pd.NA)
df['desc'].fillna(df['title'], inplace=True)

df.to_csv('out_20231216.csv',index=False)