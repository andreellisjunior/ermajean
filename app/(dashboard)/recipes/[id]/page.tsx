import Workspace from "@/components/redesign/Workspace";
import { loadWorkspace } from "@/components/redesign/workspace-data";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadWorkspace();
  if (!data.recipes.some((r) => r.id === id)) notFound();
  return <Workspace view="recipe" recipeId={id} data={data} />;
}
