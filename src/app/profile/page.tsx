"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Profile {
  name: string;
  bio: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({ name: '', bio: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      fetchProfile();
    }
  }, [user, router]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/v1/users/profile?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch profile');
  
      const { user: fetchedProfile } = await response.json();
      setProfile({
        name: fetchedProfile.name ?? '',
        bio: fetchedProfile.bio ?? '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to fetch profile. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id, name: profile.name, bio: profile.bio }),
      });

      if (!response.ok) throw new Error('Failed to update profile');
  
      const result = await response.json();
      console.log(result)
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false)
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Profile</h1>
      <p style={{ marginBottom: '16px' }}>Wallet Address: {user.wallet_address}</p>
      
      {isEditing ? (
        <>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Name"
            style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Bio"
            style={{ width: '100%', padding: '8px', marginBottom: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handleCancel} 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#f1f1f1', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ marginBottom: '8px' }}><strong>Name:</strong> {profile.name}</p>
          <p style={{ marginBottom: '16px' }}><strong>Bio:</strong> {profile.bio}</p>
          <button 
            onClick={handleEdit} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#008CBA', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Edit Profile
          </button>
        </>
      )}
      
      <button 
        onClick={handleLogout} 
        style={{ 
          marginTop: '16px', 
          padding: '8px 16px', 
          backgroundColor: '#f44336', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        Logout
      </button>
    </div>
  );
}