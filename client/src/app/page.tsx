import Image from "next/image";
import Logo from "@/assets/logo/logo.svg";
import TypingDesacription from "@/components/commons/typeing-desc";
import SearchBar from "@/components/search-bar";
import AuthHeader from "@/components/layouts/auth-header";
import { ModeToggle } from "@/components/layouts/toggle-mode";

export default function Home() {
    return (
        // <main className="flex flex-col h-screen w-screen p-10">
        //     <div className="flex flex-row-reverse w-full ">
        //         <ModeToggle />
        //     </div>
        <>
            <div className="flex flex-row-reverse w-full items-center gap-2">
                <AuthHeader />
                <ModeToggle />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <Image
                    priority
                    src={Logo}
                    alt="42git"
                    width={200}
                    height={100}
                    style={{ margin: "30px" }}
                />

                <div>
                    <TypingDesacription />
                </div>

                <SearchBar
                    placeholder="Search something you want to build..."
                    className="w-2/3 m-20"
                />
            </div>
        </>
    );
}
