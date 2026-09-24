import Workspace from "@/components/redesign/Workspace";
import { loadWorkspace } from "@/components/redesign/workspace-data";
export default async function Page() {
  return <Workspace view="kitchen" data={await loadWorkspace()} />;
}
