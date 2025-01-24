import { ShareIcon } from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import AIFeat from "../app/assets/AI-feat.png";
import AddFeat from "../app/assets/Add-Feat.png";
import NoteFeat from "../app/assets/Note-Feature.jpg";
import ShareFeat from "../app/assets/Share-Feat.jpg";
import Image from "next/image";

const features = [
  {
    name: "Add your own recipes",
    description: `A new recipe you've found or an family secret, add them all to your collection.`,
    icon: PlusIcon,
  },
  {
    name: "Create new recipes",
    description: `Let AI help you create new recipes based on your preferences.`,
    icon: SparklesIcon,
  },
  {
    name: "Share your favorites",
    description: `Share your favorite recipes with friends and family, or keep them to yourself. Nobody has to know.`,
    icon: ShareIcon,
  },
  {
    name: "Take Notes",
    description:
      "Keep track of your cooking journey with notes and tips for each recipe.",
    icon: PencilIcon,
  },
];

export default function Features() {
  return (
    <div id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-primary">
            Create & Save
          </h2>
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Everything you need for the best recipe management
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Our platform is designed to help you get the most out of your
            cooking experience. Whether you&apos;re a seasoned chef or just
            starting out, we have everything you need to make your next meal a
            success.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          <div className="relative lg:row-span-2 max-w-lg mx-auto">
            <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
              <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Add your own recipes
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  A new recipe you've found or a family secret, add them all to
                  your collection.
                </p>
              </div>
              <div className="relative min-h-[30rem] w-full grow [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm">
                <img
                  className="size-full object-cover object-top"
                  src={AddFeat.src}
                  alt=""
                />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem]"></div>
          </div>
          <div className="relative max-lg:row-start-1 max-w-lg mx-auto">
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)] justify-between">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Share your favorites
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Share your favorite recipes with friends and family, or keep
                  them to yourself. Nobody has to know.
                </p>
              </div>
              <img
                className="w-full object-contain"
                src={ShareFeat.src}
                alt=""
              />
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem]"></div>
          </div>
          <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2 max-w-lg mx-auto">
            <div className="absolute inset-px rounded-lg bg-white"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] justify-between">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Take Notes
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Keep track of your cooking journey with notes and tips for
                  each recipe.
                </p>
              </div>
              <div className="flex flex-1 items-center">
                <img
                  className="h-auto object-cover"
                  src={NoteFeat.src}
                  alt=""
                />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5"></div>
          </div>
          <div className="relative lg:row-span-2 max-w-lg mx-auto">
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Create New Recipes
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Let AI help you create new recipes based on your preferences.
                </p>
              </div>
              <div className="relative min-h-[30rem] w-full grow">
                <Image
                  className="h-full object-cover object-top"
                  src={AIFeat.src}
                  alt="ai feature"
                  width={500}
                  height={250}
                />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
          </div>
        </div>
        {/*<div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl'>*/}
        {/*  <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16'>*/}
        {/*    {features.map((feature) => (*/}
        {/*        <div key={feature.name} className='relative pl-16'>*/}
        {/*          <dt className='text-base/7 font-semibold text-gray-900'>*/}
        {/*            <div*/}
        {/*                className={`absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg ${*/}
        {/*                    feature.description.includes('AI')*/}
        {/*                        ? `bg-gradient-to-tr from-purple-600 to-teal-500`*/}
        {/*                        : `bg-primary`*/}
        {/*                }`}*/}
        {/*            >*/}
        {/*              <feature.icon*/}
        {/*                  aria-hidden='true'*/}
        {/*                  className='size-6 text-white'*/}
        {/*              />*/}
        {/*            </div>*/}
        {/*            {feature.name}*/}
        {/*          </dt>*/}
        {/*          <dd className='mt-2 text-base/7 text-gray-600'>*/}
        {/*            {feature.description}*/}
        {/*          </dd>*/}
        {/*        </div>*/}
        {/*    ))}*/}
        {/*  </dl>*/}
        {/*</div>*/}
      </div>
    </div>
  );
}
