'use client';
import { DialogTitle } from '@headlessui/react';
import React, { useState } from 'react';
import Modal from './Modal';

import { addAIRecipeAction, addNewRecipeAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Textarea } from '@/components/ui/textarea';
import { getPlanType, getRecipeLimit } from '@/libs/planUtils';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BookIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import ComboInput from './ComboInput';
import DropdownInput from './DropdownInput';
import { Message } from './form-message';
import PaidFeatureModal from './PaidFeatureModal';
import { SubmitButton } from './submit-button';

const AddNewRecipe = ({
  searchParams,
  profiles,
  count,
}: {
  searchParams: Message;
  profiles: { location?: string; has_access: boolean; price_id?: string }[];
  count: number;
}) => {
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paidModal, setPaidModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const aiForm = () => {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      setLoading(true);
      setIsGenerating(true);
      setGeneratedContent('');

      try {
        const response = await fetch('/api/generate-recipe', {
          method: 'POST',
          body: JSON.stringify({
            taste: formData.get('taste'),
            ingredients: formData.get('ingredients'),
            serving: formData.get('serving'),
            total_time: formData.get('totalTime'),
            course: formData.get('course'),
            restrictions: formData.get('restrictions'),
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setIsGenerating(false);
                break;
              }

              try {
                const content = JSON.parse(data);
                setGeneratedContent((prev) => prev + content);
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to generate recipe');
      } finally {
        setLoading(false);
      }
    };

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
            What ingredients do you have to work with?{' '}
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
            List dietary restrictions{' '}
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
        <Input
          type="hidden"
          name="location"
          value={profiles[0].location ?? `USA`}
        />
        <div className="mt-5 py-3 flex items-center gap-4 sticky bottom-0 right-0">
          <div className="flex flex-col w-full gap-4">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <LoadingSpinner />
                {isGenerating && (
                  <div className="text-sm text-gray-500">
                    Generating recipe... {generatedContent && '✓'}
                  </div>
                )}
                {generatedContent && (
                  <pre className="whitespace-pre-wrap text-sm">
                    {generatedContent}
                  </pre>
                )}
              </div>
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
                  variant={'ghost'}
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
              { id: 1, name: 'Beginner' },
              { id: 2, name: 'Easy' },
              { id: 3, name: 'Medium' },
              { id: 4, name: 'Hard' },
              { id: 5, name: 'Yes Chef!' },
            ]}
          />
        </div>
        <div className="mt-4 text-left">
          <Label htmlFor="course">Course:</Label>
          <DropdownInput
            name="course"
            items={[
              { id: 1, name: 'Breakfast' },
              { id: 2, name: 'Lunch' },
              { id: 3, name: 'Dinner' },
              { id: 4, name: 'Snack' },
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

        {/* Nutrition Information Toggle */}
        <div className="mt-6 flex items-center space-x-2">
          <input
            type="checkbox"
            id="nutrition-toggle-new"
            className="rounded"
            onChange={(e) => {
              const nutritionSection = document.getElementById(
                'nutrition-section-new'
              );
              if (nutritionSection) {
                nutritionSection.style.display = e.target.checked
                  ? 'block'
                  : 'none';
              }
            }}
          />
          <Label htmlFor="nutrition-toggle-new" className="text-sm font-medium">
            Add nutritional information (optional)
          </Label>
        </div>

        {/* Nutritional Information Fields */}
        <div
          id="nutrition-section-new"
          style={{ display: 'none' }}
          className="space-y-4 mt-4"
        >
          <div className="border-t pt-4">
            <h4 className="font-medium text-foreground mb-3">
              Nutritional Information (per serving)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  name="calories"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="1"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  name="protein"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  name="carbs"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  name="fat"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="fiber">Fiber (g)</Label>
                <Input
                  name="fiber"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="sugar">Sugar (g)</Label>
                <Input
                  name="sugar"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  disabled={loading}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="sodium">Sodium (mg)</Label>
                <Input
                  name="sodium"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="1"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 py-3 flex items-center justify-center gap-4 sticky bottom-0 right-0">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Button
                className="w-full"
                variant={'secondary'}
                onClick={() => setDefaultOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button variant={'default'} className="w-full" type="submit">
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
      <div className="fixed bottom-24 right-5 shadow-lg shadow-gray-600 rounded-full">
        <button
          onClick={() => setOpen(!open)}
          className="bg-primary text-primary-foreground p-2 rounded-full border-[1px]"
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
        <form
          onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            setLoading(true);
            aiOpen
              ? await addAIRecipeAction(formData)
              : await addNewRecipeAction(formData);
            setOpen(false);
            setLoading(false);
            setAiOpen(false);
            toast.success('Recipe saved successfully');
          }}
          className="h-full"
        >
          <div className="mt-3 text-center sm:mt-0 sm:text-left h-full">
            {!aiOpen && !defaultOpen ? (
              <div className="flex flex-wrap items-center justify-center gap-4 h-auto">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    const planType = getPlanType(
                      profiles[0].has_access,
                      profiles[0].price_id
                    );
                    const recipeLimit = getRecipeLimit(planType);

                    const isAtLimit =
                      recipeLimit !== null && count >= recipeLimit;

                    if (isAtLimit) {
                      setPaidModal(true);
                    } else {
                      setDefaultOpen(false);
                      setAiOpen(true);
                    }
                  }}
                  className={`w-full border border-gray-200 flex flex-col items-center justify-center p-12 rounded-lg gap-4 h-full transition ${(() => {
                    const planType = getPlanType(
                      profiles[0].has_access,
                      profiles[0].price_id
                    );
                    const recipeLimit = getRecipeLimit(planType);
                    return recipeLimit !== null && count >= recipeLimit
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-md hover:cursor-pointer';
                  })()}`}
                >
                  <SparklesIcon className="w-12 h-auto text-primary" />
                  <h5 className="text-2xl">Generate a New One!</h5>
                  {(() => {
                    const planType = getPlanType(
                      profiles[0].has_access,
                      profiles[0].price_id
                    );
                    const recipeLimit = getRecipeLimit(planType);

                    if (planType === 'unlimited') {
                      return (
                        <p className="text-sm text-green-600 text-center font-semibold">
                          Unlimited AI recipes
                        </p>
                      );
                    }

                    if (planType === 'monthly' && recipeLimit) {
                      return (
                        <p className="text-sm text-gray-500 text-center">
                          {count >= recipeLimit
                            ? 'Monthly limit reached - Upgrade for unlimited'
                            : `${recipeLimit - count} monthly recipes remaining`}
                        </p>
                      );
                    }

                    if (planType === 'free' && recipeLimit) {
                      return (
                        <p className="text-sm text-gray-500 text-center">
                          {count >= recipeLimit
                            ? 'Limit reached - Upgrade for unlimited'
                            : `${recipeLimit - count} free recipes remaining`}
                        </p>
                      );
                    }

                    return null;
                  })()}
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
      </Modal>
      <PaidFeatureModal open={paidModal} setOpen={setPaidModal} />
    </>
  );
};

export default AddNewRecipe;
