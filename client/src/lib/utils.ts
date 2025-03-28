import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Repo } from "./types/repo";

export const generatePrompt = (repoList: Repo[], query: string) => {
    const repoPrompt = repoList.reduce((pre, curr) => {
        const { title, description } = curr.data;
        const prompt = `repo title:${title}, repo description:${description} \n--------- \n`;
        return pre + prompt;
    }, "");
    const systemPrompt = {
        role: "system",
        content: `You are an Engineer Assistant.
            You will base your opensource knowledge and some extra github repositories information below:
            ===
            ${repoPrompt}
            ===
            to help user solve their problem.
        `,
    };
    const userQuery = `user query: ###${query}### \n repository list: ###${repoPrompt} ###`;

    return { systemPrompt, userQuery };
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
