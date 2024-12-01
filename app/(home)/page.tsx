import { createClient } from '@/libs/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/ui/Header';
import Pricing from '@/components/Pricing';
import Features from '@/components/Features';
import PricingPlan from '@/components/PricingPlan';
import CTA from '@/components/CTA';
import CallToAction from '@/components/ui/CallToAction';
import Footer from '@/components/Footer';

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect('/recipes');
  }
  return (
    <>
      <Header />
      <Features />
      <hr className='max-w-2xl mx-auto h-[2px] bg-[#094a231a] rounded-full' />
      <PricingPlan />
      <hr className='max-w-2xl mx-auto h-[2px] bg-[#094a231a] rounded-full' />
      <CallToAction />
      <Footer />
    </>
  );
}
