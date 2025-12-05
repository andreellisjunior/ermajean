const config = {
    appName: 'ermajean',
    appDescription: 'Create, Save and Share the Recipes you love!',
    domainName: 'ermajean.com',
    stripe: {
        plans: [
            {
                priceId: '',
                isFeatured: false,
                name: 'Free',
                description:
                    'Just a taste — try 3 AI recipes and see how much time you’ll save in the kitchen.',
                price: 0,
                features: [
                    { name: '3 free AI recipes (lifetime)' },
                    { name: 'Save unlimited personal recipes' },
                ],
            },
            {
                priceId: 'price_1QWp6pEl9PRnOeq5BdPuTmWU',
                isFeatured: true,
                name: 'Yearly',
                description:
                    'For serious cooks who want unlimited AI recipes all year long at the best value.',
                price: 99,
                features: [
                    { name: 'Unlimited AI recipes' },
                    { name: 'Save your own recipes' },
                    { name: 'Share your recipes with friends and loved ones' },
                    { name: 'Take notes so you can keep track of your findings' },
                    { name: 'Email support' },
                ],
            },
            {
                priceId: 'price_1S1vPoEl9PRnOeq5lBf7pBbo',
                isFeatured: false,
                name: 'Monthly',
                description:
                    'For regular cooks who want fresh AI recipe ideas each month with flexible monthly billing.',
                price: 11.99,
                features: [
                    { name: 'Craft 8 new recipes with AI per month' },
                    { name: 'Save your own recipes' },
                    { name: 'Share your recipes with friends and loved ones' },
                    { name: 'Take notes so you can keep track of your findings' },
                    { name: 'Email support' },
                ],
            },
        ],
    },
    auth: {
        loginUrl: '/sign-in',
        callbackUrl: '/sign-in',
    },
};

export default config;
