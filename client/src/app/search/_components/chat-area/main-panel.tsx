"use client";
import React, { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatPanel from "./chat-panel";

export default function ChatMainPanel() {
    return (
        <Tabs
            defaultValue="chat"
            className="w-full h-full flex flex-col justify-start items-start"
        >
            <TabsList className="w-auto">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger disabled={true} value="soon">
                    coming soon
                </TabsTrigger>
            </TabsList>
            <TabsContent
                value="chat"
                className="flex-grow w-full h-full overflow-hidden"
            >
                <ChatPanel />
            </TabsContent>
        </Tabs>
    );
}
