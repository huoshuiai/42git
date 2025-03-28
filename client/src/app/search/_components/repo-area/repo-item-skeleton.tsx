// Skeleton.tsx
import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
export default function Skeleton({ count = 1 }: { count: number }) {
    return (
        <>
            {Array.from({ length: count }, (_, i) => (
                <Card key={i} className="w-[500px] animate-pulse">
                    <CardHeader className="p-3">
                        <CardTitle className="text-xl">
                            <div className="bg-gray-300 rounded w-[100px] h-[30px]"></div>
                        </CardTitle>
                        <CardDescription>
                            <div className="bg-gray-300 rounded w-[20px] h-[10px]"></div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-300 rounded h-[10px] w-full mb-2"></div>
                        <div className="bg-gray-300 rounded h-[10px] w-[85%] mb-2"></div>
                        <div className="bg-gray-300 rounded h-[10px] w-[80%]"></div>{" "}
                    </CardContent>
                </Card>
            ))}
        </>
    );
}
