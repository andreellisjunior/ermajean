import { Metadata } from 'next';
import NewsletterInput from '@/components/NewsletterInput';
import background from '@/app/assets/background.png';
import pdf1 from '@/app/assets/marketing-material/PDF - page 1.jpg';
import pdf2 from '@/app/assets/marketing-material/PDF - page 12.jpg';
import pdf3 from '@/app/assets/marketing-material/PDF - page 15.jpg';
import pdf4 from '@/app/assets/marketing-material/PDF - page 18.jpg';
import pdf5 from '@/app/assets/marketing-material/PDF - page 22.jpg';
import pdf6 from '@/app/assets/marketing-material/PDF - page 24.jpg';
import pdf7 from '@/app/assets/marketing-material/PDF - page 3.jpg';
import logo from '@/app/assets/Logo (color).jpg';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '24 Free AI Recipes | Ermajean - AI Recipe Generator',
  description:
    'Download our free collection of 24 AI-generated recipes for every dietary need including traditional, gluten-free, and vegan options for breakfast, lunch, dinner, and dessert.',
  keywords:
    'free recipes, AI recipes, recipe generator, vegan recipes, gluten-free recipes, meal planning, cooking inspiration',
  openGraph: {
    title: '24 Free AI Recipes | Ermajean',
    description:
      'Get 24 free AI-generated recipes for every dietary need. Breakfast, lunch, dinner, and dessert options included!',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Ermajean AI Recipe Collection',
      },
    ],
    type: 'website',
  },
};

export default function FreeAiRecipes() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DigitalDocument",
            "name": "24 Free AI Recipes",
            "description": "A comprehensive recipe collection with options for every dietary need including traditional, gluten-free, and vegan recipes.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "provider": {
              "@type": "Organization",
              "name": "Ermajean",
              "description": "AI-powered recipe generator"
            }
          })
        }}
      />
      {/* Structured data script from above */}
      <div
        className='relative overflow-hidden min-h-screen p-4 md:p-0 bg-background'
        style={{
          backgroundImage: `url(${background.src})`,
          transform: 'rotate(180deg)',
        }}
      >
        <main className='relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center min-h-screen gap-16 rotate-180'>
          <section className='sm:max-w-xl flex flex-col gap-4 text-gray-500'>
            <header>
              <Link href='/sign-up'>
                <div className='mb-4 flex flex-col md:flex-row text-center md:text-left items-center gap-4'>
                  <img
                    alt='Ermajean Logo - AI Recipe Generator'
                    src={logo.src}
                    className='size-full object-fit h-full w-64'
                  />
                  <p className='italic text-primary underline text-sm'>
                    Create your free account today to create your own recipes!
                  </p>
                </div>
              </Link>
              <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
                24 Free AI Recipes
              </h1>
            </header>
            <article>
              <p className='mt-4 text-xl text-gray-500'>
                This comprehensive recipe collection has been carefully curated
                to provide delicious options for every dietary need. You'll get{' '}
                <span className='text-primary italic'>
                  Breakfast, lunch, dinner, and dessert!
                </span>
              </p>
              <p>This includes:</p>
              <ul className='pl-8'>
                <li className='list-disc'>Traditional</li>
                <li className='list-disc'>Gluten-Free</li>
                <li className='list-disc'>Vegan</li>
                <li className='text-primary italic font-bold'>and more</li>
              </ul>
            </article>
            <NewsletterInput />
          </section>
          <div className=''>
            <div className='flex items-center space-x-6 lg:space-x-8'>
              <div className='grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8'>
                <div className='h-64 w-44 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100'>
                  <img
                    alt='Gourmet dinner recipe with plated presentation - Page 18'
                    src={pdf4.src}
                    className='size-full object-cover'
                  />
                </div>
                <div className='h-64 w-44 overflow-hidden rounded-lg'>
                  <img
                    alt='Healthy breakfast recipe with nutritional information - Page 12'
                    src={pdf2.src}
                    className='size-full object-cover'
                  />
                </div>
              </div>
              <div className='grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8'>
                <div className='h-64 w-44 overflow-hidden rounded-lg'>
                  <img
                    alt='Vegetarian lunch option with fresh ingredients - Page 15'
                    src={pdf3.src}
                    className='size-full object-cover'
                  />
                </div>
                <div className='h-64 w-44 overflow-hidden rounded-lg'>
                  <img
                    alt='Recipe collection cover page with colorful food photography - Page 1'
                    src={pdf1.src}
                    className='size-full object-cover'
                  />
                </div>
                <div className='h-64 w-44 overflow-hidden rounded-lg'>
                  <img
                    alt='Gluten-free dessert recipe with preparation steps - Page 22'
                    src={pdf5.src}
                    className='size-full object-cover'
                  />
                </div>
              </div>
              <div className='grid shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8'>
                <div className='h-64 w-44 overflow-hidden rounded-lg'>
                  <img
                    alt='Vegan dinner recipe with ingredient list - Page 24'
                    src={pdf6.src}
                    className='size-full object-cover'
                  />
                </div>
                <div className='h-64 w-44 overflow-hidden rounded-lg'>
                  <img
                    alt='Quick and easy breakfast recipe with cooking time - Page 3'
                    src={pdf7.src}
                    className='size-full object-cover'
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
