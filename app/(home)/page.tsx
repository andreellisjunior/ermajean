import Image from 'next/image';
import Logo from '../../app/assets/Logo.svg';
import { SubmitButton } from '@/components/submit-button';
import { signInAction } from '../actions';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormMessage, Message } from '@/components/form-message';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Index({
  searchParams,
}: {
  searchParams: Message;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect('/recipes');
  }
  return (
    <>
      <div className='flex flex-col justify-evenly items-center w-full h-screen p-2'>
        {/* Hero/Logo */}
        <div className='flex flex-col items-center justify-center text-center'>
          <h3>welcome to</h3>
          <Image src={Logo} alt='logo' width={500} height={500} />
          <p>Your personal recipe management and creation tool.</p>
        </div>
        {/* Sign up/Sign in Section */}
        <div className='w-full flex flex-col'>
          <form className='flex-1 flex flex-col min-w-64'>
            <div className='flex flex-col gap-2 [&>input]:mb-3 mt-8'>
              <Label htmlFor='email'>Email</Label>
              <Input name='email' placeholder='you@example.com' required />
              <div className='flex justify-between items-center'>
                <Label htmlFor='password'>Password</Label>
                <Link
                  className='text-xs text-primary underline font-bold'
                  href='/forgot-password'
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                type='password'
                name='password'
                placeholder='Your password'
                required
              />
              <p className='text-sm text-foreground self-end'>
                Don't have an account?{' '}
                <Link
                  className='text-primary font-bold underline'
                  href='/sign-up'
                >
                  Sign up
                </Link>
              </p>
              <SubmitButton
                pendingText='Signing In...'
                formAction={signInAction}
              >
                Sign in
              </SubmitButton>
              <FormMessage message={searchParams} />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
