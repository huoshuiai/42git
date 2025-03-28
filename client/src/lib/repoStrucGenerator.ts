import yaml from "js-yaml";
import { githubHeader } from "./const";

const codeExtensions: string[] = [
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".rb",
    ".go",
    ".rs",
];

export default class RepoStructureGenerator {
    repoName: string;

    constructor(repoName: string) {
        this.repoName = repoName;
    }

    async _getRepoContent(repoName: string, path = "") {
        const url = `https://api.github.com/repos/${repoName}/contents/${path}`;
        const response = await fetch(url, {
            method: "GET",
            headers: githubHeader,
        });
        const data = await response.json();
        console.log("---_getRepoContent:", data);
        return data;
    }
    _isCodeFile(filename: string) {
        return codeExtensions.some((ext) => filename.endsWith(ext));
    }

    async _buildTree(repoName: string, dirPath = "") {
        const contents = await this._getRepoContent(repoName, dirPath);
        const structure: any = [];

        for (const item of contents) {
            if (item.type === "dir") {
                const subDirStructure = await this._buildTree(
                    repoName,
                    item.path
                );
                if (subDirStructure.length > 0) {
                    const dirStructure: any = {};
                    dirStructure[item.name] = subDirStructure;
                    structure.push(dirStructure);
                }
            } else if (this._isCodeFile(item.name)) {
                structure.push(item.name);
            }
        }

        return structure;
    }

    async _generateYamlStructure() {
        const structure = await this._buildTree(this.repoName);
        const yamlStr = yaml.dump(structure, { indent: 2 });
        return yamlStr;
    }

    async generate() {
        const yamlStr = await this._generateYamlStructure();
        return yamlStr;
    }
}
