'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/supabase';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      fetchProfile();
    }
  }, [user, router]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Wallet Address: {user.wallet_address}</p>
      {profile && (
        <>
          <p>Name: {profile.name}</p>
          <p>Bio: {profile.bio}</p>
        </>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}