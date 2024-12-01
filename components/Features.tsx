import { ShareIcon } from '@heroicons/react/20/solid';
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Add your own recipes',
    description: `A new recipe you've found or an family secret, add them all to your collection.`,
    icon: PlusIcon,
  },
  {
    name: 'Create new recipes',
    description: `Let AI help you create new recipes based on your preferences.`,
    icon: SparklesIcon,
  },
  {
    name: 'Share your favorites',
    description: `Share your favorite recipes with friends and family, or keep them to yourself. Nobody has to know.`,
    icon: ShareIcon,
  },
  {
    name: 'Take Notes',
    description:
      'Keep track of your cooking journey with notes and tips for each recipe.',
    icon: PencilIcon,
  },
];

export default function Features() {
  return (
    <div id='features' className='py-24 sm:py-32'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl lg:text-center'>
          <h2 className='text-base/7 font-semibold text-primary'>
            Create & Save
          </h2>
          <p className='mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-balance'>
            Everything you need to for the best recipe
          </p>
          <p className='mt-6 text-lg/8 text-gray-600'>
            Our platform is designed to help you get the most out of your
            cooking experience. Whether you&apos;re a seasoned chef or just
            starting out, we have everything you need to make your next meal a
            success.
          </p>
        </div>
        <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl'>
          <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16'>
            {features.map((feature) => (
              <div key={feature.name} className='relative pl-16'>
                <dt className='text-base/7 font-semibold text-gray-900'>
                  <div
                    className={`absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg ${
                      feature.description.includes('AI')
                        ? `bg-gradient-to-tr from-purple-600 to-teal-500`
                        : `bg-primary`
                    }`}
                  >
                    <feature.icon
                      aria-hidden='true'
                      className='size-6 text-white'
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className='mt-2 text-base/7 text-gray-600'>
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
