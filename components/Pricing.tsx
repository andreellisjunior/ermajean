import config from '@/config';
import ButtonCheckout from './ButtonCheckout';

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

const Pricing = () => {
  return (
    <>
      <section className='bg-base-200 overflow-hidden' id='pricing'>
        <div className='py-24 px-8 max-w-5xl mx-auto'>
          <div className='flex flex-col text-center w-full mb-20'>
            <p className='font-medium text-primary mb-8'>Pricing</p>
            <h2 className='font-bold text-3xl lg:text-5xl tracking-tight'>
              Save hours of repetitive code and ship faster!
            </h2>
          </div>

          <div className='relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8'>
            {config.stripe.plans.map((plan) => (
              <div key={plan.priceId} className='relative w-full max-w-lg'>
                {plan.isFeatured && (
                  <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20'>
                    <span
                      className={`badge text-xs text-primary-content font-semibold border-0 bg-primary`}
                    >
                      POPULAR
                    </span>
                  </div>
                )}

                {plan.isFeatured && (
                  <div
                    className={`absolute -inset-[1px] rounded-[9px] bg-primary z-10`}
                  ></div>
                )}

                <div className='relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-lg'>
                  <div className='flex justify-between items-center gap-4'>
                    <div>
                      <p className='text-lg lg:text-xl font-bold'>
                        {plan.name}
                      </p>
                      {plan.description && (
                        <p className='text-base-content/80 mt-2'>
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    {plan.priceAnchor && (
                      <div className='flex flex-col justify-end mb-[4px] text-lg '>
                        <p className='relative'>
                          <span className='absolute bg-base-content h-[1.5px] inset-x-0 top-[53%]'></span>
                          <span className='text-base-content/80'>
                            ${plan.priceAnchor}
                          </span>
                        </p>
                      </div>
                    )}
                    <p className={`text-5xl tracking-tight font-extrabold`}>
                      ${plan.price}
                    </p>
                    <div className='flex flex-col justify-end mb-[4px]'>
                      <p className='text-xs text-base-content/60 uppercase font-semibold'>
                        USD
                      </p>
                    </div>
                  </div>
                  {plan.features && (
                    <ul className='space-y-2.5 leading-relaxed text-base flex-1'>
                      {plan.features.map((feature, i) => (
                        <li key={i} className='flex items-center gap-2'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            className='w-[18px] h-[18px] opacity-80 shrink-0'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z'
                              clipRule='evenodd'
                            />
                          </svg>

                          <span>{feature.name} </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className='space-y-2'>
                    <ButtonCheckout priceId={plan.priceId} />

                    <p className='flex items-center justify-center gap-2 text-sm text-center text-base-content/80 font-medium relative'>
                      Pay once. Access forever.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PricingSection />
    </>
  );
};

export default Pricing;

import {
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid';

export function PricingSection() {
  return (
    <div className='relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0'>
      <div className='absolute inset-0 -z-10 overflow-hidden'>
        <svg
          aria-hidden='true'
          className='absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]'
        >
          <defs>
            <pattern
              x='50%'
              y={-1}
              id='e813992c-7d03-4cc4-a2bd-151760b470a0'
              width={200}
              height={200}
              patternUnits='userSpaceOnUse'
            >
              <path d='M100 200V.5M.5 .5H200' fill='none' />
            </pattern>
          </defs>
          <svg x='50%' y={-1} className='overflow-visible fill-gray-50'>
            <path
              d='M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z'
              strokeWidth={0}
            />
          </svg>
          <rect
            fill='url(#e813992c-7d03-4cc4-a2bd-151760b470a0)'
            width='100%'
            height='100%'
            strokeWidth={0}
          />
        </svg>
      </div>
      <div className='mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10'>
        <div className='lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8'>
          <div className='lg:pr-4'>
            <div className='lg:max-w-lg'>
              <p className='text-base/7 font-semibold text-indigo-600'>
                Deploy faster
              </p>
              <h1 className='mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl'>
                A better workflow
              </h1>
              <p className='mt-6 text-xl/8 text-gray-700'>
                Aliquet nec orci mattis amet quisque ullamcorper neque, nibh
                sem. At arcu, sit dui mi, nibh dui, diam eget aliquam. Quisque
                id at vitae feugiat egestas.
              </p>
            </div>
          </div>
        </div>
        <div className='-ml-12 -mt-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden'>
          <img
            alt=''
            src='https://tailwindui.com/plus/img/component-images/dark-project-app-screenshot.png'
            className='w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]'
          />
        </div>
        <div className='lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8'>
          <div className='lg:pr-4'>
            <div className='max-w-xl text-base/7 text-gray-700 lg:max-w-lg'>
              <p>
                Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget
                risus enim. Mattis mauris semper sed amet vitae sed turpis id.
                Id dolor praesent donec est. Odio penatibus risus viverra tellus
                varius sit neque erat velit. Faucibus commodo massa rhoncus,
                volutpat. Dignissim sed eget risus enim. Mattis mauris semper
                sed amet vitae sed turpis id.
              </p>
              <ul role='list' className='mt-8 space-y-8 text-gray-600'>
                <li className='flex gap-x-3'>
                  <CloudArrowUpIcon
                    aria-hidden='true'
                    className='mt-1 h-5 w-5 flex-none text-indigo-600'
                  />
                  <span>
                    <strong className='font-semibold text-gray-900'>
                      Push to deploy.
                    </strong>{' '}
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Maiores impedit perferendis suscipit eaque, iste dolor
                    cupiditate blanditiis ratione.
                  </span>
                </li>
                <li className='flex gap-x-3'>
                  <LockClosedIcon
                    aria-hidden='true'
                    className='mt-1 h-5 w-5 flex-none text-indigo-600'
                  />
                  <span>
                    <strong className='font-semibold text-gray-900'>
                      SSL certificates.
                    </strong>{' '}
                    Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure
                    qui lorem cupidatat commodo.
                  </span>
                </li>
                <li className='flex gap-x-3'>
                  <ServerIcon
                    aria-hidden='true'
                    className='mt-1 h-5 w-5 flex-none text-indigo-600'
                  />
                  <span>
                    <strong className='font-semibold text-gray-900'>
                      Database backups.
                    </strong>{' '}
                    Ac tincidunt sapien vehicula erat auctor pellentesque
                    rhoncus. Et magna sit morbi lobortis.
                  </span>
                </li>
              </ul>
              <p className='mt-8'>
                Et vitae blandit facilisi magna lacus commodo. Vitae sapien duis
                odio id et. Id blandit molestie auctor fermentum dignissim.
                Lacus diam tincidunt ac cursus in vel. Mauris varius vulputate
                et ultrices hac adipiscing egestas. Iaculis convallis ac tempor
                et ut. Ac lorem vel integer orci.
              </p>
              <h2 className='mt-16 text-2xl font-bold tracking-tight text-gray-900'>
                No server? No problem.
              </h2>
              <p className='mt-6'>
                Id orci tellus laoreet id ac. Dolor, aenean leo, ac etiam
                consequat in. Convallis arcu ipsum urna nibh. Pharetra, euismod
                vitae interdum mauris enim, consequat vulputate nibh. Maecenas
                pellentesque id sed tellus mauris, ultrices mauris. Tincidunt
                enim cursus ridiculus mi. Pellentesque nam sed nullam sed diam
                turpis ipsum eu a sed convallis diam.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
