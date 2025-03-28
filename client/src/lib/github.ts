import yaml from "js-yaml";
import * as fs from "node:fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { Base64 } from "js-base64";
import { GITHUB_TOKEN } from "./const";

// 把 exec 包成異步執行
const execAsync = promisify(exec);

export const githubHeader = {
    Accept: "*/*",
    Authorization: `token ${GITHUB_TOKEN}`,
};

export const getRepoSubstucture = async (repoName: string, path = "") => {
    const url = `https://api.github.com/repos/${repoName}/contents/${path}`;

    const githubRes = await fetch(url, {
        method: "GET",
        headers: githubHeader,
    });
    const data = await githubRes.json();

    const subFolderOrFiles = data.map((sub: any) => ({
        name: sub.name,
        path: sub.path,
        type: sub.type,
    }));
    return subFolderOrFiles;
};

export const getRepoContent = async (repoName: string, path = "") => {
    const url = `https://api.github.com/repos/${repoName}/contents/${path}`;
    const githubRes = await fetch(url, {
        method: "GET",
        headers: githubHeader,
    });
    const data = await githubRes.json();
    return data;
};

export const getCodeContent = async (repoName: string, filePath = "") => {
    const url = `https://api.github.com/repos/${repoName}/contents/${filePath}`;

    const githubRes = await fetch(url, {
        method: "GET",
        headers: githubHeader,
    });
    const data = await githubRes.json();
    const { content } = data;
    return Base64.decode(content);
};

export default class RepositoryStructureGenerator {
    rootRepoDir = path.join(__dirname, "repoDir");
    repoTempDir: string;
    repoUrl: string;

    constructor(repoName: string) {
        const repoDirName = repoName.replace("/", "-");
        this.repoUrl = `https://github.com/${repoName}`;
        this.repoTempDir = path.join(this.rootRepoDir, repoDirName);
        this._createDirectory(this.repoTempDir);
    }

    async _createDirectory(directory: string) {
        try {
            await fs.mkdir(directory, { recursive: true });
            console.log(`Directory created: ${directory}`);
        } catch (err) {
            console.error(`Error creating directory: ${err}`);
        }
    }

    async _cloneRepo() {
        const gitUrl = `${this.repoUrl}.git`;
        try {
            await execAsync(`git clone ${gitUrl} ${this.repoTempDir}`);
            console.log("Repository cloned successfully");
        } catch (error) {
            console.error(`Error cloning repository: ${error}`);
        }
    }

    async _buildTree(directory: string) {
        const structure: any = [];
        const items = await fs.readdir(directory);

        for (const item of items) {
            const itemPath = path.join(directory, item);
            const stat = await fs.stat(itemPath);
            if (stat.isDirectory()) {
                structure.push({ [item]: await this._buildTree(itemPath) });
            } else {
                structure.push(item);
            }
        }

        return structure;
    }

    async _generateYamlStructure() {
        const structure = await this._buildTree(this.repoTempDir);
        const yamlStr = yaml.dump(structure, { indent: 2 });
        return yamlStr;
    }

    async _removeDirectory(directory: string) {
        try {
            await fs.rm(directory, { recursive: true, force: true });
            console.log(`Directory removed: ${directory}`);
        } catch (err) {
            console.error(`Error removing directory: ${err}`);
        }
    }

    async _freeTempDirectory() {
        await this._removeDirectory(this.repoTempDir);
    }

    async generate() {
        await this._createDirectory(this.repoTempDir);
        await this._cloneRepo();
        const yamlStr = await this._generateYamlStructure();
        await this._freeTempDirectory();
        return yamlStr;
    }
}
