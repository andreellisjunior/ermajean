"use client";

export default function AIRecipesCount({ count }: { count: number }) {

    return (
        <div className="flex gap-2 items-center justify-between w-auto m-4 p-2 text-primary font-bold border border-2 border-primary rounded-lg backdrop-blur-lg">
            <p className="">FREE AI Recipes Remaining:</p>
            <p className="">{10 - count}/10</p>
        </div>  
    )
}