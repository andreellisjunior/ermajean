"use client";
import { googleAuth, signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Login({ searchParams }: { searchParams: Message }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  return (
    <>
      <h1>Welcome back, hon.</h1>
      <p>Your keepers are right where you left them.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSending(true);
          try {
            const result = await signInAction(new FormData(e.currentTarget));
            if (result?.status === 500)
              toast.error(`${result.message}. Please try again.`);
            else {
              router.replace("/kitchen");
              router.refresh();
            }
          } catch {
            toast.error("Couldn’t sign in. Please try again.");
          } finally {
            setSending(false);
          }
        }}
      >
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
        <button type="submit" disabled={sending}>
          {sending ? "Signing in…" : "Back to my kitchen"}
        </button>
        <FormMessage message={searchParams} />
      </form>
      <div className="ej-auth-links">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/sign-up">Create an account</Link>
      </div>
      <div className="ej-auth-divider">or</div>
      <form action={googleAuth}>
        <button className="ej-google" type="submit">
          Continue with Google
        </button>
      </form>
    </>
  );
}
