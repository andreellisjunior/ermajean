import { createClient } from '@/libs/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { searchParams } = new URL(req.url);
  const recipeId = searchParams.get('id');

  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('recipe_id', +recipeId)
    .order('created_at', { ascending: false });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  const { id, edit, recipeId, title, note } = await req.json();

  if (edit) {
    const { data, error } = await supabase
      .from('notes')
      .update({ title, note, updated_at: new Date() })
      .eq('id', id)
      .select();
    return NextResponse.json(data);
  } else {
    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          user_id: userId,
          title,
          note,
          recipe_id: recipeId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .select();
    return NextResponse.json(data);
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { id } = await req.json();

  const { data, error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .select();

  return NextResponse.json(data);
}
