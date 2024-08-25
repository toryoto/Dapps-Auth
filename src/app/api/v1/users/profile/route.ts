import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/supabase';

export async function PUT(req: NextRequest) {
  try {
    const { name, bio, userId } = await req.json();

    // バリデーションを記述する

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ name, bio })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}