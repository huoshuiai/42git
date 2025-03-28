"use client";

import React, { RefObject, useEffect, useRef, useState } from "react";
import ChatMessage from "@/components/commons/chat/chat-message";
import { Message } from "@/lib/types/gpt";
import { ChatRecordStore, useChatStore } from "@/app/_store/gpt-store";
import { useChatRag } from "../../_hooks/use-chat-rag";
import { useSearchParams } from "next/navigation";
import ChatInput from "@/components/commons/chat/chat-input";

export default function ChatPanel() {
    const { chatMessages, isAnswering, answeringMsg, chatWithRagResult } =
        useChatRag();

    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (endOfMessagesRef.current) {
            const scrollHeight = endOfMessagesRef.current.scrollHeight;
            const height = endOfMessagesRef.current.clientHeight;
            const maxScrollTop = scrollHeight - height;
            endOfMessagesRef.current.scrollTop =
                maxScrollTop > 0 ? maxScrollTop : 0;
        }
    }, [answeringMsg, chatMessages.length]); // 每當消息列表更新時，觸發滾動操作

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto">
            <div
                ref={endOfMessagesRef}
                className="flex flex-col w-full h-full overflow-auto bg-slate-200 dark:bg-slate-800 rounded-xl justify-start gap-6 px-5 pb-[150px] pt-5"
            >
                {chatMessages.map((msg, idx) => (
                    <ChatMessage key={idx} message={msg as Message} />
                ))}
                {isAnswering && (
                    <ChatMessage
                        message={{ role: "assistant", content: answeringMsg }}
                    />
                )}
            </div>
            <div className="sticky bottom-16 w-4/5 m-auto">
                <ChatInput
                    querySubmitHandler={chatWithRagResult}
                    isAnswering={isAnswering}
                />
            </div>
        </div>
    );
}
