"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function LoginPage() {
    const [email, setEmail] = useState("")

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        await signIn("email", { email, callbackUrl: "/dashboard" })
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Sign in to Syelope
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or create an account to start chatting
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <Button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full"
                        variant="outline"
                    >
                        Sign in with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-3"
                                placeholder="Email address"
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Sign in with Email
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
