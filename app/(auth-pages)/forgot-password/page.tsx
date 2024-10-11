import { forgotPasswordAction } from '@/app/actions';
import { FormMessage, Message } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Logo from '../../assets/Logo.svg';
import Image from 'next/image';

export default function ForgotPassword({
  searchParams,
}: {
  searchParams: Message;
}) {
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
          <form className='flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-64'>
            <div>
              <h1 className='text-2xl font-medium'>Reset Password</h1>
              <p className='text-sm text-secondary-foreground text-right'>
                Already have an account?{' '}
                <Link className='text-primary underline' href='/'>
                  Sign in
                </Link>
              </p>
            </div>
            <div className='flex flex-col gap-2 [&>input]:mb-3 mt-8'>
              <Label htmlFor='email'>Email</Label>
              <Input name='email' placeholder='you@example.com' required />
              <SubmitButton formAction={forgotPasswordAction}>
                Reset Password
              </SubmitButton>
              <FormMessage message={searchParams} />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
