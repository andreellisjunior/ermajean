import { Comfortaa } from 'next/font/google';
import Head from 'next/head';
import '../../../globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Logo from '../../../assets/logo.svg';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Recipes | ErmaJean',
  description: 'A collection of recipes from ErmaJean',
};

const comfortaa = Comfortaa({
  subsets: ['latin'],
});

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <html lang='en' className={comfortaa.className} suppressHydrationWarning>
      <Head>
        <link
          rel='icon'
          type='image/png'
          href='/favicon-48x48.png'
          sizes='48x48'
        />
        <link rel='icon' type='image/svg+xml' href='/favicon.svg' />
        <link rel='shortcut icon' href='/favicon.ico' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <meta name='apple-mobile-web-app-title' content='ermajean' />
        <link rel='manifest' href='/site.webmanifest' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
      </Head>
      <body className='bg-[#F7F7ED] max-w-2xl mx-auto p-4'>
        <div className='flex mb-6 justify-between items-center flex-col border-b-2 pb-4'>
          <Image src={Logo} alt='ErmaJean Logo' width={250} height={250} />

          <p>What to create, save, and share your own recipe?</p>
          <a href='/'>
            <Button size={'sm'} className='mt-2'>
              Create a free account
            </Button>
          </a>
        </div>
        {children}
      </body>
    </html>
  );
}
