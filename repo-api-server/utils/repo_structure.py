import os
import aiofiles
import asyncio
import aiofiles.os
import yaml
import shutil

# TODO: except raise handling

class RepositoryStructureAsyncGenerator:
    def __init__(self, repo_name):
        self.root_repo_dir = os.path.join(os.path.dirname(__file__), "repoDir")
        
        repo_dir_name = repo_name.replace("/", "_42git_")
        self.repo_url = f"https://github.com/{repo_name}"
        self.repo_temp_dir = os.path.join(self.root_repo_dir, repo_dir_name)
        self.loop = asyncio.get_event_loop()

    async def _create_directory(self, directory):
        try:
            await aiofiles.os.makedirs(directory, exist_ok=True)
            print(f"Directory created: {directory}")
        except Exception as err:
            print(f"Error creating directory: {err}")

    async def _clone_repo(self):
        print("---enter _clone_repo")
        git_url = f"{self.repo_url}.git"
        try:
            proc = await asyncio.create_subprocess_exec(
                "git", "clone", "--depth", "1", git_url, self.repo_temp_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()
            if proc.returncode == 0:
                print("Repository cloned successfully")
            else:
                print(f"Error cloning repository: {stderr.decode()}")
                return False
            return True
        except Exception as error:
            print(f"Error cloning repository: {error}")
            return False

    async def _build_tree(self, directory):
        structure = []
        loop = asyncio.get_event_loop()
        items = await loop.run_in_executor(None, os.scandir, directory)

        for item in items:
            item_path = os.path.join(directory, item.name)
            if item.is_dir():
                structure.append({item.name: await self._build_tree(item_path)})
            else:
                structure.append(item.name)
        return structure

    async def _generate_yaml_structure(self):
        structure = await self._build_tree(self.repo_temp_dir)
        yaml_str = yaml.dump(structure, indent=2)
        return yaml_str

    async def _remove_directory(self, directory):
        try:
            await asyncio.to_thread(shutil.rmtree, directory, ignore_errors=True)
            print(f"Directory removed: {directory}")
        except Exception as err:
            print(f"Error removing directory: {err}")

    async def free_temp_directory(self):
        await self._remove_directory(self.repo_temp_dir)

    async def generate(self):
        try:
            await self._create_directory(self.repo_temp_dir)
            clone_success = await self._clone_repo()
            if not clone_success:
                print('clone failed QQ')
                raise Exception("Sorry, no numbers below zero")
            yaml_str = await self._generate_yaml_structure()
            print('---_generate_yaml_structure')
            return yaml_str
        finally:
            await self.free_temp_directory()

