import { Redirect } from "expo-router";
export default function SignUp() {
  return (
    <Redirect
      href={{ pathname: "/(auth)/sign-in", params: { mode: "signup" } }}
    />
  );
}
