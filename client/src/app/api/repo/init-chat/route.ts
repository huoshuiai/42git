/**
 * init repo structure and related prompt,
 * and then save with sessionId in DB (currently redis)
 * because currently cannot use ObjectStorage on sealos,
 */

import { updateMessages } from "@/database/redis";
import { CHAT_SESSION_FLAG, githubHeader, SERVER_API } from "@/lib/const";
import RepositoryStructureGenerator, {
    getCodeContent,
    getRepoSubstucture,
} from "@/lib/github";
import RepoStructureGenerator from "@/lib/repoStrucGenerator";
import { cookies } from "next/headers";
import { Base64 } from "js-base64";
import { v4 as uuidv4 } from "uuid";

import { Message } from "@/lib/types/gpt";

export async function POST(req: Request) {
    /**
     * 1. get repository id from req
     * 2. get repo name from DB
     * 3. through repo name, get repo sturcture yaml string
     *  - from minio
     *  - from github api, and then generate yaml string
     */

    // TODO: 這邊可能要用ReAct的prompt，不過init的時候就先讀readme.md就好吧

    const { repoName } = await req.json();

    const readmeContent = await getCodeContent(repoName, "README.md");
    const repoStructureRes = await fetch(
        `${SERVER_API}/api/v1/repo_structure`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ reponame: repoName }),
        }
    );
    const { repo_structure_yaml_str } = await repoStructureRes.json();
    const newMsgSessionID = uuidv4();
    const sysPrompt = {
        role: "system",
        content: `Here are instructions from the user outlining your goals and how you should respond:
        You are "Repo Assistant", and as such you will offer both general guidance and specific code snippets or detailed implementation steps for software modifications or feature additions. You will analyse the context of the user's request and the relevant GitHub repository to provide the most appropriate response. For general inquiries, you will offer a broad overview or conceptual explanation. For specific requests, you will provide precise code examples, step-by-step instructions, or detailed technical advice.
        In every interaction, Repo Assistant will assess the user's level of expertise and tailor its responses accordingly, ensuring that the guidance is both accessible and useful. Whether the user needs a high-level overview or a deep dive into code, Repo Assistant is equipped to assist with a range of queries related to GitHub repositories.
        The tone will remain helpful and instructional, aiming to empower users to effectively understand, use, and modify software from GitHub repositories.
        
        the following is the repository Readme content:
        ===
        ${readmeContent}
        ===

        the following is the repository structure in YAML format:
        ===
        ${repo_structure_yaml_str}
        ===
        `,
    } as Message;
    await updateMessages(newMsgSessionID, [sysPrompt]);

    return Response.json(
        { message: "init success", messageSessionId: newMsgSessionID },
        { status: 200 }
    );
    try {
        // 用api來call太慢
        const repoStructureGenerator = new RepoStructureGenerator(repoName);
        const repoStructure = await repoStructureGenerator.generate();
        console.log("---repoStructure:", repoStructure);
        const repoSysPrompt = "";
        return Response.json({ message: repoStructure }, { status: 200 });
    } catch (err) {
        console.log("---repoStructure error:", err);
        return Response.json({ message: "fail" }, { status: 200 });
    }
}
