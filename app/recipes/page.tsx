import RecipeList from "@/components/ui/RecipeList";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { Recipe } from "@/types/config";
import { Message } from "@/components/ui/form-message";

export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: Message;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const { data: recipes, error } = (await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false })) as {
    data: Recipe[];
    error: any;
  };
  const { data: profiles, error: profileError } = (await supabase
    .from("profiles")
    .select("name, email, location, has_access")) as {
    data: {
      name: string;
      email: string;
      location?: string;
      has_access: boolean;
    }[];
    error: any;
  };

  // Format date properly for Supabase comparison
  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { count, error: countError } = await supabase
    .from('recipe_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .gte('created_at', THIRTY_DAYS_AGO);

  return <RecipeList {...{ profiles, recipes, searchParams, count }} />;
}
