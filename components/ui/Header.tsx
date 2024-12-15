"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Logo from "../../app/assets/Logo.svg";
import { Button } from "./button";
import Multiscreen from "../../app/assets/multiscreen.png";
import HomeBG from "../../app/assets/home-background-image.jpg";

const navigation = [
  { name: "Pricing", href: "#pricing" },
  { name: "Features", href: "#features" },
  { name: "Contact", href: "mailto:support@ermajean.com" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{ backgroundImage: `url(${HomeBG.src})` }}
      className="bg-cover bg-no-repeat bg-center shadow-md"
    >
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 md:px-8"
        >
          <div className="flex md:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">ErmaJean</span>
              <Image src={Logo} alt="logo" width={150} height={150} />
            </a>
          </div>
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="hidden md:flex md:gap-x-12">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm/6 font-semibold text-gray-900"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden md:flex md:flex-1 md:justify-end md:gap-4">
            <a
              href="/sign-in"
              className="text-sm/6 font-semibold text-gray-900"
            >
              <Button variant="link">Sign In</Button>
            </a>
            <a
              href="/sign-up"
              className="text-sm/6 font-semibold text-gray-900"
            >
              <Button>Get Started Free</Button>
            </a>
          </div>
        </nav>
        <Dialog
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
          className="md:hidden"
        >
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#F7F7ED] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <div className="flex md:flex-1">
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">ErmaJean</span>
                  <Image src={Logo} alt="logo" width={150} height={150} />
                </a>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6 flex flex-col gap-4">
                  <a
                    href="/sign-in"
                    className="text-sm/6 font-semibold text-gray-900"
                  >
                    <Button variant="link">Sign In</Button>
                  </a>
                  <a
                    href="/sign-up"
                    className="text-sm/6 font-semibold text-gray-900"
                  >
                    <Button>Get Started Free</Button>
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <div className="relative isolate px-6 py-32 md:px-8">
        <div className="relative overflow-hidden">
          <div className="pb-80 sm:pb-40 md:pb-4 md:pt-4">
            <div className="relative flex flex-col gap-4 lg:flex-row items-center mx-auto lg:max-w-5xl px-4 sm:static sm:px-6 md:px-8">
              <div className="text-center lg:text-start lg:w-1/2">
                <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                  Create, Save and Share the Recipes you love!
                </h1>
                <p className="mt-4 text-xl text-gray-500">
                  ErmaJean is a personal recipe management and creation tool.
                  Create, save and share your recipes with family and friends!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 my-4 justify-center lg:justify-start">
                  <a href="/sign-up">
                    <Button size="lg">Get Started For Free</Button>
                  </a>
                  <a href="#features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </a>
                </div>
              </div>
              <div className="max-w-4xl mx-auto w-auto">
                <Image src={Multiscreen} alt="" width={300} height={500} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
