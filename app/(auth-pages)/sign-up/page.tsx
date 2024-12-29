import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../assets/Logo.svg";
import { Button } from "@/components/ui/button";

export default function Signup({ searchParams }: { searchParams: Message }) {
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

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
          {"success" in searchParams ? (
            <div className="text-foreground flex flex-col gap-4">
              <FormMessage message={searchParams} />
              <Link href="/sign-in">
                <Button className="w-full">Sign In</Button>
              </Link>
            </div>
          ) : (
            <form className="flex flex-col min-w-64">
              <h1 className="text-2xl font-medium">Sign up</h1>
              <p className="text-sm text text-foreground self-end">
                Already have an account?{" "}
                <Link className="text-primary font-medium underline" href="/">
                  Sign in
                </Link>
              </p>
              <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                <Label htmlFor="email">Email</Label>
                <Input name="email" placeholder="you@example.com" required />
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Your password"
                  minLength={6}
                  required
                />
                <SubmitButton
                  formAction={signUpAction}
                  pendingText="Signing up..."
                >
                  Sign up
                </SubmitButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
