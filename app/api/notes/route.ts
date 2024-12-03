import { createClient } from '@/libs/supabase/server';
import { NextRequest } from 'next/server';

const supabase = createClient();

export async function GET() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
}

export async function POST(req: NextRequest) {}
