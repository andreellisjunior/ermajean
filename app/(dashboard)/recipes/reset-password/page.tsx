import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import Brand from "@/components/redesign/Brand";
import Image from "next/image";
import Link from "next/link";
import "@/components/redesign/public.css";

export default function ResetPassword({
  searchParams,
}: {
  searchParams: Message;
}) {
  return (
    <div className="ej-auth">
      <header className="ej-auth-header">
        <Brand />
      </header>
      <main className="ej-auth-grid">
        <section className="ej-auth-story">
          <h1>
            A fresh start.
            <br />
            Same good kitchen.
          </h1>
          <p>Set a new password, then get back to your keepers.</p>
          <Image
            src="/redesign/ermajean.png"
            alt=""
            width={400}
            height={480}
            sizes="400px"
          />
        </section>
        <section className="ej-auth-card">
          <h1>Reset your password.</h1>
          {"success" in searchParams ? (
            <>
              <FormMessage message={searchParams} />
              <Link href="/kitchen" className="ej-button ej-green">
                Back to my kitchen →
              </Link>
            </>
          ) : (
            <>
              <p>Choose a password you haven’t used here before.</p>
              <form action={resetPasswordAction}>
                <label htmlFor="password">New password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <SubmitButton pendingText="Updating password…">
                  Save new password
                </SubmitButton>
                <FormMessage message={searchParams} />
              </form>
            </>
          )}
          <div className="ej-auth-links">
            <Link href="/sign-in">Back to sign in</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
