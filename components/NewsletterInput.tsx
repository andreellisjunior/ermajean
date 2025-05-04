'use client';
import { FormEvent, useState } from 'react';
import { Button } from './ui/button';
import Loader from './ui/Loader';

const NewsletterInput = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailSubscription = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`/api/convertkitRequest`, {
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      method: 'POST',
    });
    setMessage((await res.json()).message);
    setEmail('');
  };

  return (
    <form
      onSubmit={async (e) => {
        setIsLoading(true);
        await emailSubscription(e);
        setIsLoading(false);
      }}
      className='seva-form formkit-form flex gap-x-4 mx-auto md:mx-0'
      data-sv-form='8003968'
      data-uid='41726f4897'
      data-format='inline'
      data-version='5'
      data-options='{"settings":{"after_subscribe":{"action":"message","success_message":"Success! Now check your email to confirm your subscription.","redirect_url":""},"analytics":{"google":null,"fathom":null,"facebook":null,"segment":null,"pinterest":null,"sparkloop":null,"googletagmanager":null},"modal":{"trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15},"powered_by":{"show":true,"url":"https://convertkit.com/features/forms?utm_campaign=poweredby&amp;utm_content=form&amp;utm_medium=referral&amp;utm_source=dynamic"},"recaptcha":{"enabled":false},"return_visitor":{"action":"show","custom_content":""},"slide_in":{"display_in":"bottom_right","trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15},"sticky_bar":{"display_in":"top","trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15}},"version":"5"}'
      min-width='400 500 600 700 800'
    >
      <div data-style='clean'>
        <ul
          className='formkit-alert formkit-alert-error'
          data-element='errors'
          data-group='alert'
        ></ul>
        <div
          data-element='fields'
          data-stacked='false'
          className='seva-fields formkit-fields'
        >
          <div className='flex flex-col items-center justify-center gap-4'>
            <div className='formkit-field flex flex-col gap-4 items-stretch justify-center md:flex-row md:items-center w-full'>
              <input
                className='formkit-input py-2.5 px-4 rounded-md border border-gray-300 shadow-sm sm:text-sm w-full'
                name='email_address'
                aria-label='Enter email for free recipes'
                placeholder='Enter email for free recipes'
                required
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {isLoading ? (
                <Loader color='primary' />
              ) : (
                <Button
                  type='submit'
                  aria-label='Subscribe'
                  className='font-bold'
                >
                  Subscribe
                </Button>
              )}
            </div>
            <p className='text-sm text-gray-600'>
              Rest assured, your email will{' '}
              <span className='italic text-primary font-bold underline'>
                never
              </span>{' '}
              be sold or spammed!
            </p>
            {message && <p>{message}</p>}
          </div>
        </div>
      </div>
    </form>
  );
};

export default NewsletterInput;
