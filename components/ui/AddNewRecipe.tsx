"use client";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import { DialogTitle } from "@headlessui/react";

import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addNewRecipeAction, aiRecipeCreation } from "@/app/actions";
import ComboInput from "./ComboInput";
import DropdownInput from "./DropdownInput";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Message } from "./form-message";
import { SubmitButton } from "./submit-button";
import { toast } from "react-toastify";
import PaidFeatureModal from "./PaidFeatureModal";
import { BookIcon } from "lucide-react";
import { Recipe } from "@/types";
import RecipeCard from "@/components/ui/RecipeCard";
import { DeleteWarning } from "@/components/DeleteWarning";
import apiClient from "@/libs/api";

const AddNewRecipe = ({
  searchParams,
  profiles,
}: {
  searchParams: Message;
  profiles: { has_access: boolean }[];
}) => {
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paidModal, setPaidModal] = useState(false);
  const [aiOptions, setAiOptions] = useState<Recipe[]>([]);
  const [cancel, setCancel] = useState(false);

  const aiForm = () => {
    return (
      <>
        <DialogTitle
          as="h3"
          className="text-xl font-semibold leading-6 text-rose-900 capitalize mb-3"
        >
          Add New Recipe (AI)
          <XMarkIcon
            onClick={() => {
              setOpen(false);
              setTimeout(() => {
                setAiOpen(false);
              }, 1000);
            }}
            className="h-6 w-6 text-primary absolute right-3 top-8"
          />
        </DialogTitle>
        <p className="text-gray-500 text-sm">
          Add all details as best you can for the recipe. (photo coming soon!)
        </p>
        <div className="mt-4 text-left">
          <Label htmlFor="taste">What do you have taste for?</Label>
          <Input
            name="taste"
            placeholder="Balanced chicken meal with a lot of veggies"
            required
            disabled={loading}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="ingredients">
            What ingredients do you have to work with?{" "}
            <span className="text-xs italic text-gray-500">(optional)</span>
          </Label>
          <Input
            name="ingredients"
            placeholder="Chicken, broccoli, rice, salt, pepper, garlic, etc."
            disabled={loading}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="serving">How many are eating?</Label>
          <Input
            name="serving"
            placeholder="5 people, just me"
            required
            disabled={loading}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="total_time">How much total time do you have?</Label>
          <Input
            name="total_time"
            placeholder="1 hour?, 2 hours?, 30 min.?"
            required
            disabled={loading}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="restrictions">
            List dietary restrictions{" "}
            <span className="text-xs italic text-gray-500">(optional)</span>:
          </Label>
          <Input
            name="restrictions"
            placeholder="Vegan, keto, gluten-free, etc."
            disabled={loading}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="course">Which course is this meal?</Label>
          <Input
            name="course"
            placeholder="Breakfast, lunch, dinner, or snack"
            required
            disabled={loading}
          />
        </div>
        <div className="mt-5 py-3 flex items-center gap-4 sticky bottom-0 right-0">
          <div className="flex flex-col w-full gap-4">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <SubmitButton
                  className="bg-gradient-to-r from-purple-600 to-teal-500 w-full hover:opacity-90 transition-opacity"
                  type="submit"
                  pendingText="Generating..."
                  disabled={loading}
                >
                  GENERATE
                  <SparklesIcon className="h-6 w-6" />
                </SubmitButton>
                <Button
                  variant={"ghost"}
                  type="button"
                  onClick={() => setAiOpen(false)}
                >
                  Go Back
                </Button>
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  const regularForm = () => {
    return (
      <>
        <DialogTitle
          as="h3"
          className="text-xl font-semibold leading-6 text-gray-900 capitalize mb-3 flex items-center justify-between text-left gap-2"
        >
          Add New Recipe
          <XMarkIcon
            onClick={() => {
              setOpen(false);
            }}
            className="h-6 w-6 text-primary"
          />
        </DialogTitle>
        <p className="text-gray-500 text-sm text-left">
          Add all details as best you can for the recipe. (photo coming soon!)
        </p>
        <div className="mt-4 text-left">
          <Label htmlFor="recipeName">Name:</Label>
          <Input
            name="recipeName"
            placeholder="Recipe Name"
            required
            disabled={loading}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="desc">Description:</Label>
          <Input
            name="desc"
            placeholder="Description"
            required
            disabled={loading}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="prepTime">Prep Time:</Label>
          <ComboInput name="prepTime" />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="cookTime">Cook Time:</Label>
          <ComboInput name="cookTime" />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="estTotalTiime">Est. Total Time:</Label>
          <ComboInput name="estTotalTime" />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="servings">Servings:</Label>
          <Input
            name="servings"
            placeholder="2 - 4 Servings"
            required
            disabled={loading}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="level">Difficulty Level:</Label>
          <DropdownInput
            name="level"
            items={[
              { id: 1, name: "Beginner" },
              { id: 2, name: "Easy" },
              { id: 3, name: "Medium" },
              { id: 4, name: "Hard" },
              { id: 5, name: "Yes Chef!" },
            ]}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="course">Course:</Label>
          <DropdownInput
            name="course"
            items={[
              { id: 1, name: "Breakfast" },
              { id: 2, name: "Lunch" },
              { id: 3, name: "Dinner" },
              { id: 4, name: "Snack" },
            ]}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="ingredients">Ingredients:</Label>
          <Textarea
            name="ingredients"
            placeholder="List all ingredients"
            required
            disabled={loading}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="instructions">Instructions:</Label>
          <Textarea
            name="instructions"
            placeholder="List your instructions, your way"
            required
            disabled={loading}
          />
        </div>
        <div className="mt-5 py-3 flex items-center justify-center gap-4 sticky bottom-0 right-0">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Button
                className="w-full"
                variant={"secondary"}
                onClick={() => setDefaultOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button variant={"default"} className="w-full" type="submit">
                Save
              </Button>
            </>
          )}
        </div>
      </>
    );
  };
  return (
    <>
      <div className="fixed bottom-5 right-5 shadow-lg shadow-gray-600 rounded-full">
        <button
          onClick={() => setOpen(!open)}
          className="bg-primary text-primary-foreground p-2 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>
      <Modal {...{ open, setOpen }} height="h-auto">
        {aiOptions?.length ? (
          <>
            <DialogTitle
              as="h3"
              className="text-xl font-semibold leading-6 text-rose-900 capitalize mb-3 flex items-center justify-between text-left gap-2"
            >
              Add New Recipe (AI)
              <XMarkIcon
                onClick={() => {
                  setCancel(true);
                }}
                className="h-6 w-6 text-primary"
              />
            </DialogTitle>
            <p className="text-gray-500 text-sm text-left mb-4">
              Select a recipe to view more details.
            </p>
            {aiOptions.map((recipe, i) => (
              <RecipeCard key={i} {...{ setOpen, recipe, setAiOptions }} />
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCancel(true)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <form
            onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              setLoading(true);
              aiOpen
                ? setAiOptions(await aiRecipeCreation(formData))
                : await addNewRecipeAction(formData);
              // setOpen(false);
              setLoading(false);
              setAiOpen(false);
            }}
            className="h-full"
          >
            <div className="mt-3 text-center sm:mt-0 sm:text-left h-full">
              {!aiOpen && !defaultOpen ? (
                <div className="flex flex-wrap items-center justify-center gap-4 h-auto">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      if (!profiles[0].has_access) {
                        setPaidModal(true);
                      } else {
                        setDefaultOpen(false);
                        setAiOpen(true);
                      }
                    }}
                    className="w-full border border-gray-200 flex flex-col items-center justify-center p-12 rounded-lg gap-4 h-full hover:shadow-md hover:cursor-pointer transition"
                  >
                    <SparklesIcon className="w-12 h-auto text-primary" />
                    <h5 className="text-2xl">Generate a New One!</h5>
                  </div>
                  <div
                    onClick={() => {
                      setAiOpen(false);
                      setDefaultOpen(true);
                    }}
                    className="w-full border border-gray-200 flex flex-col items-center justify-center p-12 rounded-lg gap-4 h-full hover:shadow-md hover:cursor-pointer transition"
                  >
                    <BookIcon className="w-12 h-auto text-primary" />
                    <h5 className="text-2xl">Add My Own!</h5>
                  </div>
                </div>
              ) : aiOpen ? (
                aiForm()
              ) : (
                regularForm()
              )}
            </div>
          </form>
        )}
      </Modal>
      <PaidFeatureModal open={paidModal} setOpen={setPaidModal} />
      <DeleteWarning
        open={cancel}
        setOpen={setCancel}
        title={"AI Creation"}
        desc={
          "You are about to cancel the AI creation. This action cannot be undone"
        }
        action={() => {
          setOpen(false);
          setCancel(false);
          setAiOptions([]);
        }}
      />
    </>
  );
};

export default AddNewRecipe;
