"use client";
import { usePathname } from "next/navigation";
import bg from "../../app/assets/background.png";
import RecipeBg from "../../app/assets/RecipesBackground.png";
import { ReactNode, useEffect, useState } from "react";

const BackgroundWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const background = pathname.includes("/recipes") ? RecipeBg : bg;

  const [isWideScreen, setIsWideScreen] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => setIsWideScreen(window.innerWidth > 767);

    // Run on mount
    checkScreenWidth();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

  return (
    <div
      className="bg-background w-full"
      style={
        isWideScreen
          ? {
              backgroundImage: `url(${background.src})`,
              position: "fixed",
            }
          : {}
      }
    >
      {children}
    </div>
  );
};

export default BackgroundWrapper;
