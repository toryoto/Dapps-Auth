'use client';

import React, { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const handleMetaMaskLogin = async () => {
    await login('metamask');
  };

  const handleWeb3AuthLogin = async () => {
    await login('web3auth');
  };

  if (user) {
    return null; // 必要に応じて、ここでローディング
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Our Dapp</h1>
        <div className="space-y-4">
          <button
            onClick={handleMetaMaskLogin}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition duration-200"
          >
            Login with MetaMask
          </button>
          <button
            onClick={handleWeb3AuthLogin}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          >
            Login with Web3Auth
          </button>
        </div>
      </div>
    </div>
  );
}