import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import PublicLanding from "@/components/redesign/PublicLanding";

export default async function Index() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (user) redirect("/kitchen");
  return <PublicLanding />;
}
