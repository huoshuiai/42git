import { getCurrUser } from "@/lib/userservice/lucia";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarDropdownMenu from "./avatar-dropdown";
import SignArea from "./sign-area";

export default async function AuthHeader() {
    const user = await getCurrUser();

    return (
        <div className="flex justify-center items-center gap-1">
            {user ? (
                <AvatarDropdownMenu
                    imageSrc={user.picture!}
                    imageFallText={user.name![0]}
                />
            ) : (
                <SignArea />
            )}
        </div>
    );
}
