"use client";

import React, { Dispatch, SetStateAction } from "react";
import TemplateImage from "../../app/assets/food-placeholder.png";
import RecipeModal from "./RecipeModal";
import { Recipe } from "../../types";
import { Message } from "./form-message";

const RecipeCard = ({
  recipe,
  searchParams,
  profiles,
  setOpen,
  setAiOptions,
}: {
  recipe: Recipe;
  searchParams?: Message;
  profiles?: { name: string; email: string; has_access: boolean }[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  setAiOptions?: Dispatch<SetStateAction<[]>>;
}) => {
  const [openModal, setOpenModal] = React.useState(false);
  return (
    <>
      <div
        onClick={() => setOpenModal(true)}
        className="w-full rounded-xl border border-gray-400 mb-8 overflow-hidden bg-white hover:shadow-xl hover:cursor-pointer hover:-translate-y-1 transition-all"
      >
        <div
          className="h-40 w-full"
          style={{
            backgroundImage: `url(${TemplateImage.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* <Image src={TemplateImage} alt='recipe' width={500} height={50} /> */}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <h2 className="text-xl font-bold">{recipe.recipe_name}</h2>
          <p>
            Est. Total Time:{" "}
            <span className="font-bold">{recipe.total_time}</span>
          </p>
          <p>
            Description: <span className="font-bold">{recipe.description}</span>
          </p>
        </div>
      </div>
      <RecipeModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        {...{ recipe, searchParams, profiles, setOpen, setAiOptions }}
      />
    </>
  );
};

export default RecipeCard;
