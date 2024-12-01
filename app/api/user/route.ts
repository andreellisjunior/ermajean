import { createClient } from '@/libs/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: customerId, error } = (await supabase
      .from('profiles')
      .select('customer_id')
      .eq('id', userId)
      .single()) as { data: { customer_id: string | null }; error: any };

    const access = customerId.customer_id != null;

    return NextResponse.json({
      access,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
