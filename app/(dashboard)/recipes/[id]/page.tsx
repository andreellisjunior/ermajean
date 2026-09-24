import Workspace from "@/components/redesign/Workspace";
import { loadWorkspace } from "@/components/redesign/workspace-data";
import { notFound } from "next/navigation";
export default async function Page({ params }: { params: { id: string } }) {
  const data = await loadWorkspace();
  if (!data.recipes.some((r) => r.id === params.id)) notFound();
  return <Workspace view="recipe" recipeId={params.id} data={data} />;
}
