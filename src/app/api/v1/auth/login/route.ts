import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/supabase';

export async function POST(req: Request) {
  const { wallet_address } = await req.json();

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({ wallet_address, auth_type: 'MetaMask' }, { onConflict: 'wallet_address' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}