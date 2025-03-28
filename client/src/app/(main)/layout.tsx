import React from "react";
import { ModeToggle } from "@/components/layouts/toggle-mode";
import AuthHeader from "@/components/layouts/auth-header";

export default function SearchLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div className="flex flex-row-reverse w-full items-center gap-2">
                <AuthHeader />
                <ModeToggle />
            </div>
            {children}
        </>
    );
}
