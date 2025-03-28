import React from "react";
import RepoList from "./_components/repo-area/repo-list";
import { Separator } from "@/components/ui/separator";
import ChatMainPanel from "./_components/chat-area/main-panel";
import ChatPanel from "./_components/chat-area/chat-panel";

export default function Page() {
    // 理論上應該會有兩個狀態：正在搜尋related repo/ 正在以related repo text產生問答
    return (
        <div className="flex h-full pt-5 px-10 gap-1 justify-between">
            <div className="w-3/5">
                <ChatMainPanel />
            </div>
            <Separator orientation="vertical" />
            <div className="w-2/5">
                <RepoList />
            </div>
        </div>
    );
}
