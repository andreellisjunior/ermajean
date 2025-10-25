import config from '@/config';
import { CheckIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import ButtonCheckout from './ButtonCheckout';

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PricingPlan() {
  return (
    <div id="pricing" className="relative isolate  px-6 py-24 sm:py-32 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
        />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base/7 font-semibold text-primary">Pricing</h2>
        <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          Just the right price for you
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
        The app is free to use, but you can take advantage of more with
        additional features in Premium.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-7xl lg:grid-cols-3">
        {config.stripe.plans.map((tier, tierIdx) => (
          <>
            <div
              key={tierIdx}
              className={classNames(
                tier.isFeatured
                  ? 'relative bg-primary lg:h-[45rem] flex flex-col'
                  : 'bg-white/60 sm:mx-8 lg:mx-0',
                tier.isFeatured
                  ? ''
                  : tierIdx === 0
                    ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-bl-3xl lg:rounded-tr-none'
                    : 'sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-3xl',
                'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10 relative'
              )}
            >
              {tier.isFeatured && (
                <span
                  className="absolute left-1/2 lg:left-2/3 lg:-translate-x-1/2 bg-white p-4 rounded top-0 lg:-top-5 w-3/5 text-center rotate-[5deg] flex flex-col gap-1"
                  style={{
                    boxShadow:
                      '0 0 0 1px rgba(147, 51, 234, 0.3), 0 0 20px rgba(147, 51, 234, 0.4), 0 0 40px rgba(147, 51, 234, 0.2), 0 0 80px rgba(147, 51, 234, 0.1)',
                  }}
                >
                  <span className='text-xs font-bold'>MOST POPULAR</span>
                  ~30% savings!
                </span>
              )}
              <h3
                id={`${tierIdx}`}
                className={classNames(
                  tier.isFeatured ? 'text-white font-bold' : 'text-primary',
                  'text-base/7 font-semibold'
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span
                  className={classNames(
                    tier.isFeatured ? 'text-white' : 'text-gray-900',
                    'text-5xl font-semibold tracking-tight'
                  )}
                >
                  ${tier.price}
                </span>
                <span
                  className={classNames(
                    tier.isFeatured ? 'text-white' : 'text-gray-500',
                    'text-base'
                  )}
                >
                  /{tier.name.toLowerCase().split('ly')[0]}
                </span>
              </p>
              <p
                className={classNames(
                  tier.isFeatured ? 'text-white' : 'text-gray-600',
                  'mt-6 text-base/7'
                )}
              >
                {tier.description}
              </p>
              <ul
                role="list"
                className={classNames(
                  tier.isFeatured ? 'text-white' : 'text-gray-600',
                  'mt-8 space-y-3 text-sm/6 sm:mt-10'
                )}
              >
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex gap-x-3">
                    <CheckIcon
                      aria-hidden="true"
                      className={classNames(
                        tier.isFeatured ? 'text-white' : 'text-primary',
                        'h-6 w-5 flex-none'
                      )}
                    />
                    {feature.name}
                  </li>
                ))}
              </ul>
              {!tier.priceId ? (
                <Link
                  href={tier.href}
                  className={classNames(
                    tier.isFeatured
                      ? 'bg-secondary text-primary shadow-sm hover:bg-secondary/90 focus-visible:outline-primary mt-auto'
                      : 'bg-primary text-white ring-1 ring-inset ring-secondary hover:ring-secondary hover:bg-primary/90 focus-visible:outline-indigo-600',
                    'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 transition-all'
                  )}
                >
                  Get Started For Free
                </Link>
              ) : (
                <ButtonCheckout priceId={tier.priceId} />
              )}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
