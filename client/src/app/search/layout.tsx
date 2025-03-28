import Image from "next/image";
import React from "react";
import Logo from "@/assets/logo/logo.svg";
import SearchBar from "@/components/search-bar";
import { ModeToggle } from "@/components/layouts/toggle-mode";
import { Separator } from "@/components/ui/separator";
import AuthHeader from "@/components/layouts/auth-header";

export default function SearchLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="w-full h-screen overflow-hidden flex flex-col">
            <div className="w-full flex justify-between mb-3">
                <Image priority src={Logo} alt="42git" width={60} />
                <SearchBar
                    placeholder="Search something"
                    className="w-[500px] "
                    isRouteValue={true}
                />
                <div className="flex gap-2">
                    <ModeToggle />
                    <AuthHeader />
                </div>
            </div>
            <Separator />
            <div className="flex-grow p-4 overflow-hidden">{children}</div>
        </div>
    );
}
