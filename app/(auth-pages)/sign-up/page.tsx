import { googleAuth } from "@/app/actions";
import { FormMessage, Message } from "@/components/ui/form-message";
import Link from "next/link";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<Message>;
}) {
  return (
    <>
      <h1>Come on in.</h1>
      <p>
        Dinner shouldn’t be a second job. Start with 3 free AI recipes and a
        place for all your keepers.
      </p>
      <FormMessage message={await searchParams} />
      {!("success" in (await searchParams)) && (
        <form action={googleAuth}>
          <SubmitButton pendingText="Opening Google…">
            Continue with Google
          </SubmitButton>
        </form>
      )}
      <div className="ej-auth-links">
        <span>Already have an account?</span>
        <Link href="/sign-in">Sign in</Link>
      </div>
      <p style={{ marginTop: 24, fontSize: 12 }}>
        By continuing, you agree to our <Link href="/tos">Terms</Link> and{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    </>
  );
}
