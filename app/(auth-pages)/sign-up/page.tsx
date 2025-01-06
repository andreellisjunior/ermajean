import { googleAuth, signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../assets/logo-color.png";
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
    <div className="flex flex-col justify-evenly items-center w-full h-screen p-2">
      {/* Hero/Logo */}
      <div className="flex flex-col items-center justify-center text-center">
        <h3>Welcome to</h3>
        <a href="/">
          <Image src={Logo} alt="logo" width={500} height={500} />
        </a>
        <p>Your personal recipe management and creation tool.</p>
      </div>

      {/* Sign Up Section */}
      <div className="w-full flex flex-col">
        {"success" in searchParams ? (
          <div className="text-foreground flex flex-col gap-4">
            <FormMessage message={searchParams} />
            <Link href="/sign-in">
              <Button className="w-full">Sign In</Button>
            </Link>
          </div>
        ) : (
          <>
            <form className="flex flex-col min-w-64" action={signUpAction}>
              <h1 className="text-2xl font-medium">Sign up</h1>
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
                <SubmitButton pendingText="Signing up...">Sign up</SubmitButton>
              </div>
              <p className="text-sm text-foreground self-center mt-4">
                Already have an account?{" "}
                <Link
                  className="text-primary font-medium underline"
                  href="/sign-in"
                >
                  Sign in
                </Link>
              </p>
            </form>

            <div className="w-full h-[1px] bg-gray-300 my-6" />

            <form action={googleAuth}>
              <button
                type="submit"
                className="flex items-center justify-center text-nowrap gap-4 w-full bg-white h-10 border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
              >
                <svg className="w-auto h-6" viewBox="0 0 128 128">
                  <path
                    fill="#fff"
                    d="M44.59 4.21a63.28 63.28 0 004.33 120.9 67.6 67.6 0 0032.36.35 57.13 57.13 0 0025.9-13.46 57.44 57.44 0 0016-26.26 74.33 74.33 0 001.61-33.58H65.27v24.69h34.47a29.72 29.72 0 01-12.66 19.52 36.16 36.16 0 01-13.93 5.5 41.29 41.29 0 01-15.1 0A37.16 37.16 0 0144 95.74a39.3 39.3 0 01-14.5-19.42 38.31 38.31 0 010-24.63 39.25 39.25 0 019.18-14.91A37.17 37.17 0 0176.13 27a34.28 34.28 0 0113.64 8q5.83-5.8 11.64-11.63c2-2.09 4.18-4.08 6.15-6.22A61.22 61.22 0 0087.2 4.59a64 64 0 00-42.61-.38z"
                  ></path>
                  <path
                    fill="#e33629"
                    d="M44.59 4.21a64 64 0 0142.61.37 61.22 61.22 0 0120.35 12.62c-2 2.14-4.11 4.14-6.15 6.22Q95.58 29.23 89.77 35a34.28 34.28 0 00-13.64-8 37.17 37.17 0 00-37.46 9.74 39.25 39.25 0 00-9.18 14.91L8.76 35.6A63.53 63.53 0 0144.59 4.21z"
                  ></path>
                  <path
                    fill="#f8bd00"
                    d="M3.26 51.5a62.93 62.93 0 015.5-15.9l20.73 16.09a38.31 38.31 0 000 24.63q-10.36 8-20.73 16.08a63.33 63.33 0 01-5.5-40.9z"
                  ></path>
                  <path
                    fill="#587dbd"
                    d="M65.27 52.15h59.52a74.33 74.33 0 01-1.61 33.58 57.44 57.44 0 01-16 26.26c-6.69-5.22-13.41-10.4-20.1-15.62a29.72 29.72 0 0012.66-19.54H65.27c-.01-8.22 0-16.45 0-24.68z"
                  ></path>
                  <path
                    fill="#319f43"
                    d="M8.75 92.4q10.37-8 20.73-16.08A39.3 39.3 0 0044 95.74a37.16 37.16 0 0014.08 6.08 41.29 41.29 0 0015.1 0 36.16 36.16 0 0013.93-5.5c6.69 5.22 13.41 10.4 20.1 15.62a57.13 57.13 0 01-25.9 13.47 67.6 67.6 0 01-32.36-.35 63 63 0 01-23-11.59A63.73 63.73 0 018.75 92.4z"
                  ></path>
                </svg>
                Continue with Google
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
