"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import RepoItem from "./repo-item";
import Skeleton from "./repo-item-skeleton";
import { RepoStore, useRepoStore } from "@/app/_store/repo-store";
import { useShallow } from "zustand/react/shallow";
import { ChatRecordStore, useChatStore } from "@/app/_store/gpt-store";

const repoSelector = (state: RepoStore) => ({
    repoList: state.repoList,
    setRepoList: state.setRepoList,
    setInitRepoFlag: state.setInitRepoFlag,
});

const chatSelector = (state: ChatRecordStore) => ({
    setMsgSessionId: state.setMsgSessionId,
    setChatMessages: state.setChatMessages,
});

export default function RepoList() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search_query") as string;

    const { repoList, setRepoList, setInitRepoFlag } = useRepoStore(
        useShallow(repoSelector)
    );
    const { setMsgSessionId, setChatMessages } = useChatStore(
        useShallow(chatSelector)
    );
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        setChatMessages([]);
        // TODO: reset chat history
        fetch("/api/search/rag", {
            method: "POST",
            body: JSON.stringify({ searchQuery }),
        })
            .then((data) => data.json())
            .then(({ ragData, newMsgSessionID }) => {
                console.log("---rag data:", ragData);
                setRepoList([...ragData]);
                setMsgSessionId(newMsgSessionID);
                setInitRepoFlag(true);
                setLoading(false);
            });
    }, [searchQuery]);

    return (
        <div className="flex flex-col gap-5 h-screen overflow-y-auto px-5 pb-40">
            {isLoading ? (
                <Skeleton count={10} />
            ) : (
                repoList.map((repo) => <RepoItem key={repo.id} repo={repo} />)
            )}
        </div>
    );
}
