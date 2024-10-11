import { resetPasswordAction } from '@/app/actions';
import { FormMessage, Message } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Logo from '../../assets/Logo.svg';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Message;
}) {
  return (
    <div className='flex flex-col justify-evenly items-center w-full h-screen p-2'>
      {/* Hero/Logo */}
      <div className='flex flex-col items-center justify-center text-center'>
        <h3>welcome to</h3>
        <Image src={Logo} alt='logo' width={500} height={500} />
        <p>Your personal recipe management and creation tool.</p>
      </div>
      {/* Sign up/Sign in Section */}
      <div className='w-full flex flex-col'>
        {'success' in searchParams ? (
          <div className='text-foreground border-l-2 border-foreground px-4'>
            <Link href='/'>
              <Button className='w-full'>Login</Button>
            </Link>
          </div>
        ) : (
          <form className='flex flex-col w-full min-w-64 p-4 gap-2 [&>input]:mb-4'>
            <h1 className='text-2xl font-medium'>Reset password</h1>
            <p className='text-sm text-foreground/60'>
              Please enter your new password below.
            </p>
            <Label htmlFor='password'>New password</Label>
            <Input
              type='password'
              name='password'
              placeholder='New password'
              required
            />
            <Label htmlFor='confirmPassword'>Confirm password</Label>
            <Input
              type='password'
              name='confirmPassword'
              placeholder='Confirm password'
              required
            />
            <SubmitButton formAction={resetPasswordAction}>
              Reset password
            </SubmitButton>
          </form>
        )}
        <FormMessage message={searchParams} />
      </div>
    </div>
  );
}
