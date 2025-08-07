'use client'

import { signIn } from "@/lib/auth-client";
import { Button } from "../ui/button";

function LoginButton() {

    const handleLogin = async () => {
        await signIn.social({
            provider: 'google',
            callbackURL: "/"
        })
    }
    return ( 
        <Button onClick={handleLogin} asChild >
            <span className="w-full bg-teal-500 hover:bg-teal-700 text-white py-6 text-base font-medium cursor-pointer">
                Sign in With Google
            </span>
        </Button>
     );
}

export default LoginButton;