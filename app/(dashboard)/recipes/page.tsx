import Workspace from "@/components/redesign/Workspace";
import { loadWorkspace } from "@/components/redesign/workspace-data";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
export default async function Page({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  if (searchParams.session_id) {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user)
      redirect(
        `/auth/checkout-success?session_id=${encodeURIComponent(searchParams.session_id)}`,
      );
  }
  return <Workspace view="recipes" data={await loadWorkspace()} />;
}
