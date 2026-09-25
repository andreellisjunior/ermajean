import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<Message>;
}) {
  return (
    <>
      <h1>Let’s get you back in.</h1>
      <p>Enter your email and we’ll send a password reset link.</p>
      {!("success" in (await searchParams)) && (
        <form action={forgotPasswordAction}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            name="email"
            placeholder="you@example.com"
            required
          />
          <SubmitButton pendingText="Sending link…">
            Send reset link
          </SubmitButton>
        </form>
      )}
      <FormMessage message={await searchParams} />
      <div className="ej-auth-links">
        <Link href="/sign-in">Back to sign in</Link>
      </div>
    </>
  );
}
