"use client";
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Logo from "../../assets/logo-color.png";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Login({ searchParams }: { searchParams: Message }) {
  const [sending, setSending] = useState(false);

  return (
    <>
      <div className="flex flex-col justify-evenly items-center w-full h-screen p-2">
        {/* Hero/Logo */}
        <div className="flex flex-col items-center justify-center text-center">
          <h3>welcome to</h3>
          <a href="/">
            <Image src={Logo} alt="logo" width={500} height={500} />
          </a>
          <p>Your personal recipe management and creation tool.</p>
        </div>
        {/* Sign up/Sign in Section */}
        <div className="w-full flex flex-col">
          <form
            className="flex-1 flex flex-col min-w-64"
            action={async (formData: FormData) => {
              setSending(true);
              const request = await signInAction(formData);
              if (request.status === 500)
                toast.error(`${request.message}. Please try again.`);
              setSending(false);
            }}
          >
            <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
              <Label htmlFor="email">Email</Label>
              <Input name="email" placeholder="you@example.com" required />
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                required
              />
              <Link
                className="text-xs text-primary underline font-black"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
              <SubmitButton className="mt-4" pendingText="Signing In...">
                Sign in
              </SubmitButton>
              <FormMessage message={searchParams} />
              <p className="text-sm text-foreground self-center">
                Don&apos;t have an account?{" "}
                <Link
                  className="text-primary font-bold underline"
                  href="/sign-up"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
