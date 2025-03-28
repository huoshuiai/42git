"use client";

import { Repo } from "@/lib/types/repo";
import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RepoItem({ repo }: { repo: Repo }) {
    const [isHovered, setIsHovered] = useState(false);

    const descGenerator = (desc: string) => {
        const words = desc.split(/\s+/);
        if (words.length <= 100) return desc;
        return words.slice(0, 100).join(" ") + "...";
    };

    return (
        <Link className="relative" href={`/repo/${repo.id}`} target="_blank">
            <div
                className="relative w-[500px] hover:cursor-pointer overflow-hidden rounded-lg"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Card className="relative z-10">
                    <CardHeader className="p-3 ">
                        <CardTitle className="text-xl">
                            {repo.data.title}
                        </CardTitle>
                        {/* <CardDescription></CardDescription> */}
                    </CardHeader>
                    <CardContent>
                        <p>{descGenerator(repo.data.description)}</p>
                    </CardContent>
                </Card>
                <Overlay isHovered={isHovered} repoName={repo.data.title} />
            </div>
        </Link>
    );
}

const Overlay = ({
    isHovered,
    repoName,
}: {
    isHovered: boolean;
    repoName: string;
}) => {
    return (
        <motion.div
            className="absolute left-0 w-full h-full  bg-opacity-60 bg-primary flex items-center justify-center z-10"
            initial={{ bottom: "-100%" }}
            animate={isHovered ? { bottom: 0 } : { bottom: "-100%" }}
            transition={{ duration: 0.3 }}
        >
            <div className="text-white text-center">
                <h3 className="text-lg font-bold">Start Chat Repository</h3>
                <p>with {repoName}</p>
            </div>
        </motion.div>
    );
};
