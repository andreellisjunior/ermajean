import Workspace from "@/components/redesign/Workspace";
import { loadWorkspace } from "@/components/redesign/workspace-data";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  if ((await searchParams).session_id) {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    if (!user)
      redirect(
        `/auth/checkout-success?session_id=${encodeURIComponent((await searchParams).session_id)}`,
      );
  }
  return <Workspace view="recipes" data={await loadWorkspace()} />;
}
