"use client";
import { Recipe } from "@/types/config";
import AddNewRecipe from "@/components/ui/AddNewRecipe";
import { Input } from "@/components/ui/input";
import RecipeCard from "@/components/ui/RecipeCard";
import WelcomeModal from "@/components/ui/WelcomeModal";
import { useEffect, useState } from "react";
import { Message } from "./form-message";
import ProfileSettings from "../ProfileSettings";
import { UserCogIcon } from "lucide-react";

const RecipeList = ({
  profiles,
  recipes,
  searchParams,
}: {
  profiles:
    | { name: string; email: string; location?: string; has_access: boolean }[]
    | null;
  recipes: Recipe[];
  searchParams: Message;
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);
  const [profile, setProfile] = useState(false);

  useEffect(() => {
    if (searchInput === "") {
      setFilteredRecipes(recipes);
    } else {
      setFilteredRecipes(
        recipes.filter((recipe) =>
          recipe.recipe_name.toLowerCase().includes(searchInput.toLowerCase()),
        ),
      );
    }
  }, [searchInput, recipes]);

  return (
    <div className="flex-1 w-full flex flex-col h-screen">
      {/* Header and Search */}
      <div className="min-h-60 flex flex-col w-full items-center gap-4 justify-center bg-primary md:bg-transparent rounded-b-[40%] md:rounded-none mb-6 px-12 text-center text-white md:text-black">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setProfile(true)}
        >
          <h1 className="text-3xl italic">
            Hi,{" "}
            <span className="text-white md:text-primary">
              {profiles![0].name ?? "Friend"}
            </span>
            !
          </h1>
          <UserCogIcon className="h-6 w-auto text-white md:text-primary" />
        </div>
        <p>What would you like to make today?</p>
        <div className="flex gap-4 w-full max-w-sm">
          <Input
            name="search"
            placeholder="Search Saved Recipes"
            className="w-full rounded-xl text-center text-black"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Content section */}
      <div className="min-h-44 overflow-y-auto px-4 max-w-xl mx-auto">
        {/* TODO: Filtering categories */}
        <div className="pb-12">
          {/* Recipes */}
          {filteredRecipes?.length === 0 ? (
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 -translate-y-1/4 w-full">
              <div className="flex flex-col h-[50vh] text-center max-w-72 mx-auto w-full justify-center">
                <p className="text-xl text-gray-600">
                  Doesn’t look like you have any recipes saved yet.
                </p>
                <p className="tex-xs font-bold">
                  Click the plus button to get started
                </p>
              </div>
              {/* <Image
                src={Arrow.src}
                width={100}
                height={50}
                alt='arrow image'
                className='absolute left-1/2 bottom-0 transform -translate-x-1/2 -translate-y-1/8 block sm:hidden'
              /> */}
            </div>
          ) : (
            filteredRecipes?.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                searchParams={searchParams}
                profiles={profiles}
              />
            ))
          )}
        </div>
      </div>
      {!profiles![0].name && <WelcomeModal />}
      <AddNewRecipe {...{ searchParams, profiles }} />
      <ProfileSettings open={profile} setOpen={setProfile} profile={profiles} />
    </div>
  );
};

export default RecipeList;
