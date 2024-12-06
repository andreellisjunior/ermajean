"use client";
import Modal from "@/components/ui/Modal";
import { DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ComboInput from "@/components/ui/ComboInput";
import DropdownInput from "@/components/ui/DropdownInput";
import { Textarea } from "@/components/ui/textarea";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Recipe } from "@/types";
import { addNewRecipeAction } from "@/app/actions";

export default function EditRecipe({ recipeId }: { recipeId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const getRecipe = async () => {
    setLoading(true);
    const res = await fetch(`/api/recipes?id=${recipeId}`);
    const data = await res.json();
    console.log({ data: data });

    setRecipe(data);
    setLoading(false);
    console.log({ recipe: recipe });
  };

  return (
    <>
      <button
        onClick={async () => {
          setOpen(true);
          await getRecipe();
        }}
        className="block rounded-lg py-2 px-3 transition hover:bg-primary/5 text-xs text-start w-full"
      >
        <p className="font-semibold text-black">Edit</p>
        <p className="text-black/50">Make changes to your recipe.</p>
      </button>
      <Modal {...{ open, setOpen }}>
        <form
          action={async (formData: FormData) => {
            await addNewRecipeAction(formData);
            setOpen(false);
          }}
        >
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <DialogTitle
              as="h3"
              className="text-xl font-semibold leading-6 text-gray-900 capitalize mb-3 flex items-center justify-between text-left gap-2"
            >
              Edit Recipe
              <XMarkIcon
                onClick={() => {
                  setOpen(false);
                }}
                className="h-6 w-6 text-primary"
              />
            </DialogTitle>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Input type="hidden" name="id" value={recipe?.id} />
                <div className="mt-4 text-left">
                  <Label htmlFor="recipeName">Name:</Label>
                  <Input
                    name="recipeName"
                    placeholder="Recipe Name"
                    defaultValue={recipe?.recipe_name}
                    required
                  />
                </div>
                <div className="mt-4 text-left">
                  <Label htmlFor="desc">Description:</Label>
                  <Input
                    name="desc"
                    placeholder="Description"
                    defaultValue={recipe?.description}
                    required
                  />
                </div>
                <div className="mt-4 text-left">
                  <Label htmlFor="prepTime">Prep Time:</Label>
                  <Input
                    name="prepTime"
                    defaultValue={recipe?.prep_time}
                    required
                  />
                </div>
                <div className="mt-4 text-left">
                  <Label htmlFor="cookTime">Cook Time:</Label>
                  <Input
                    name="cookTime"
                    defaultValue={recipe?.cook_time}
                    required
                  />
                </div>
                <div className="mt-4 text-left">
                  <Label htmlFor="estTotalTime">Est. Total Time:</Label>
                  <Input
                    name="estTotalTime"
                    defaultValue={recipe?.total_time}
                    required
                  />
                </div>
                <div className="mt-4 text-left">
                  <Label htmlFor="servings">Servings:</Label>
                  <Input
                    name="servings"
                    placeholder="2 - 4 Servings"
                    defaultValue={recipe?.servings}
                    required
                  />
                </div>
                <div className="mt-4 text-left">
                  <Label htmlFor="level">Difficulty Level:</Label>
                  <Input
                    name="level"
                    defaultValue={recipe?.difficulty_level}
                    required
                  />
                </div>
                <div className="mt-4 text-left">
                  <Label htmlFor="course">Course:</Label>
                  <Input name="course" defaultValue={recipe?.course} required />
                </div>
                <div className="mt-4 text-left">
                  <Label htmlFor="ingredients">Ingredients:</Label>
                  <Textarea
                    name="ingredients"
                    placeholder="List all ingredients"
                    defaultValue={recipe?.ingredients}
                    required
                  />
                </div>
                <div className="mt-4 text-left">
                  <Label htmlFor="instructions">Instructions:</Label>
                  <Textarea
                    name="instructions"
                    placeholder="List your instructions, your way"
                    defaultValue={recipe?.instructions}
                    required
                  />
                </div>

                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="mt-5 py-3 flex items-center gap-4 sticky bottom-0 right-0">
                    <Button
                      onClick={() => setOpen(false)}
                      variant={"secondary"}
                      className="w-full"
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant={"default"}
                      className="w-full"
                      type="submit"
                    >
                      Save
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}
