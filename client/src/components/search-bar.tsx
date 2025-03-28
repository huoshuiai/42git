"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar({
    className,
    placeholder,
    isRouteValue,
}: {
    className?: string;
    placeholder?: string;
    isRouteValue?: boolean;
}) {
    const searchParams = useSearchParams();
    const [searchText, setSearchText] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isPending, startTransition] = useTransition();

    const router = useRouter();
    const search = () => {
        if (isSearching) return;
        // 感覺這部分要分成3步：
        // 1. 問llm這個query是跟什麼有關？還是說直接用返回的repository
        // 2.
        setIsSearching(true);
        startTransition(() => {
            try {
                router.push(`/search?search_query=${searchText}`);
            } catch (err) {
                console.log(err);
            }
        });
    };

    useEffect(() => {
        if (!isPending) {
            setIsSearching(false);
        }
    }, [isPending]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (isSearching) return;
            // Enter key is pressed
            search();
        }
    };

    useEffect(() => {
        if (isRouteValue) {
            const searchQuery = searchParams.get("search_query") as string;
            setSearchText(searchQuery);
        }
    }, [isRouteValue, searchParams]);

    return (
        <div
            className={`hidden md:flex items-center space-x-4 max-w-3xl relative ${className}`}
        >
            <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={placeholder}
                disabled={isSearching}
                onKeyDown={handleKeyDown} // Adding the onKeyDown event handler
                className="text-lg border-primary focus:border-0 focus-visible:ring-primary dark:focus-visible:ring-primary"
            />
            <div
                className={`absolute right-4 bottom-3  ${
                    isSearching ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={search}
            >
                <FaSearch className="text-primary" />
            </div>
        </div>
    );
}
