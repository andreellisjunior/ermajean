import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CONVERTKIT_API_KEY;
const FORM_ID = process.env.CONVERTKIT_FORM_ID;
const API_URL = `https://api.convertkit.com/v3`;
const email_required_message = 'Email is required';
const error_message = 'Something went wrong. Please try again later.';
const success_message =
  'Success! Now check your email to confirm your subscription.';

export const POST = async (req: NextRequest, res: NextResponse) => {
  const email = (await req.json()).email;

  if (!email) {
    return new NextResponse(
      JSON.stringify({ message: email_required_message }),
      { status: 400 }
    );
  }
  try {
    const url = [API_URL, 'forms', FORM_ID, 'subscribe'].join('/');
    const data = {
      api_key: API_KEY,
      email,
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(url, options);
    if (response.status === 200) {
      return new NextResponse(JSON.stringify({ message: success_message }));
    }
  } catch {
    return new NextResponse(JSON.stringify({ message: error_message }), {
      status: 500,
    });
  }
};
