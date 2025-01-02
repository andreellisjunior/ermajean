import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import Logo from "@/app/assets/Logo.svg";

const navigation = [
  { name: "Pricing", href: "#pricing" },
  { name: "Features", href: "#features" },
  { name: "Contact", href: "mailto:support@ermajean.com" },
];

const Footer = () => {
  return (
    <footer className="bg-base-200 border-t border-base-content/10">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className=" flex lg:items-center md:flex-row md:flex-nowrap flex-wrap flex-col">
          <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
            <Link
              href="/#"
              aria-current="page"
              className="flex gap-2 justify-center md:justify-start items-center"
            >
              <Image
                src={Logo}
                alt={`${config.appName} logo`}
                priority={true}
                className="w-auto h-full"
                width={250}
                height={250}
              />
            </Link>
            <p className="mt-3 text-xs text-gray-500">
              Copyright © {new Date().getFullYear()} - All rights reserved
            </p>
          </div>
          <div className="flex-grow flex flex-wrap flex-col gap-8 justify-center -mb-10 md:mt-0 mt-10 text-center">
            <div className="flex flex-col md:flex-row gap-4 md:justify-end">
              {[
                ...navigation,
                { name: "Terms", href: "/tos" },
                {
                  name: "Privacy Policy",
                  href: "/privacy-policy",
                },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-base font-semibold text-gray-900"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <p className="text-xs text-center md:text-right text-gray-500">
              Designed & Developed by{" "}
              <a href="https://aguynamedandre.com/" target="_blank">
                A Guy Named Andre
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
