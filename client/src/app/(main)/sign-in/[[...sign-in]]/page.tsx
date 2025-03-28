"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    getGithubOathConsentUrl,
    getGoogleOauthConsentUrl,
    login,
} from "./_actions/signin.action";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";

export default function Page() {
    const { toast } = useToast();
    const googleOAuth = async () => {
        const res = await getGoogleOauthConsentUrl();
        if (res.url) {
            window.location.href = res.url;
        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
            });
        }
    };
    const githubOAuth = async () => {
        const res = await getGithubOathConsentUrl();
        if (res.url) {
            window.location.href = res.url;
        } else {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
            });
        }
    };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    return (
        <Card className="m-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Login</CardTitle>
                <CardDescription>
                    Please enter by Google or Github account.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="Your username"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div> */}
            </CardContent>
            <CardFooter className="flex flex-col gap-5">
                {/* <Button
                    className="w-full bg-primary transition-colors"
                    onClick={() => {
                        login({ email, password });
                    }}
                >
                    Sign in
                </Button>
                <Separator className="my-4" /> */}
                <Button
                    className="w-full bg-red-600 hover:bg-red-600  hover:scale-110 transition-transform duration-300 flex justify-center gap-1"
                    onClick={googleOAuth}
                >
                    <FaGoogle size={30} /> Sign in by Google
                </Button>
                <Button
                    className="w-full hover:bg-black hover:scale-110 transition-transform duration-300 flex justify-center gap-1"
                    onClick={githubOAuth}
                >
                    <FaGithub size={30} /> Sign in by Github
                </Button>
            </CardFooter>
        </Card>
    );
}
