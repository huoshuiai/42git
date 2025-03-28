"use client";

import { logout } from "@/app/(main)/sign-in/[[...sign-in]]/_actions/signin.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function AvatarDropdownMenu({
    imageSrc,
    imageFallText,
}: {
    imageSrc: string;
    imageFallText: string;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="hover:cursor-pointer">
                    <AvatarImage src={imageSrc} />
                    <AvatarFallback>{imageFallText}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-10 hover:cursor-pointer">
                <DropdownMenuItem>
                    <span
                        onClick={() => {
                            logout();
                        }}
                    >
                        SignOut
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
