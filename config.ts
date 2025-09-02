import themes from 'daisyui/src/theming/themes';
import { ConfigProps } from './types/config';

const config = {
  // REQUIRED
  appName: 'ermajean',
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription: 'Create, Save and Share the Recipes you love!',
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: 'ermajean.com',
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (mailgun.supportEmail) otherwise customer support won't work.
    id: '',
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ['/'],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        priceId: '',
        isFeatured: false,
        name: 'Free',
        description:
          'Just a taste — try 3 AI recipes and see how much time you’ll save in the kitchen.',
        price: 0,
        href: '/sign-up',
        features: [
          {
            name: '3 free AI recipes (lifetime)',
          },
          {
            name: 'Save unlimited personal recipes',
          },
        ],
      },
      {
        priceId: 'price_1QWp6pEl9PRnOeq5BdPuTmWU',
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        name: 'Yearly',
        description:
          'For serious cooks who want unlimited AI recipes all year long at the best value.',
        price: 99,
        features: [
          { name: 'Unlimited AI recipes' },
          {
            name: 'Save your own recipes',
          },
          { name: 'Share your recipes with friends and loved ones' },
          { name: 'Take notes so you can keep track of your findings' },
          { name: 'Email support' },
        ],
      },
      {
        priceId: 'price_1S1vPoEl9PRnOeq5lBf7pBbo',
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: false,
        name: 'Monthly',
        description:
          'For regular cooks who want fresh AI recipe ideas each month with flexible monthly billing.',
        price: 11.99,
        features: [
          { name: 'Craft 8 new recipes with AI per month' },
          {
            name: 'Save your own recipes',
          },
          { name: 'Share your recipes with friends and loved ones' },
          { name: 'Take notes so you can keep track of your findings' },
          { name: 'Email support' },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: 'bucket-name',
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: 'https://cdn-id.cloudfront.net/',
  },
  mailgun: {
    // subdomain to use when sending emails, if you don't have a subdomain, just remove it. Highly recommended to have one (i.e. mg.yourdomain.com or mail.yourdomain.com)
    subdomain: 'mg',
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `ShipFast <noreply@mg.shipfa.st>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Marc at ShipFast <marc@mg.shipfa.st>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: 'marc@mg.shipfa.st',
    // When someone replies to supportEmail sent by the app, forward it to the email below (otherwise it's lost). If you set supportEmail to empty, this will be ignored.
    forwardRepliesTo: 'marc.louvion@gmail.com',
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: 'light',
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes['light']['primary'],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: '/sign-in',
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: '/sign-in',
  },
} as ConfigProps;

export default config;
