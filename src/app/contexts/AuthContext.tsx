'use client'; 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { supabase } from '../lib/supabase/supabase';
import { web3auth } from '../lib/web3auth/web3auth';

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
}

interface AuthContextType {
  user: any;
  login: (method: 'metamask' | 'web3auth') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initAuth = async () => {
      await web3auth.initModal();
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    initAuth();
  }, []);

  const loginWithMetaMask = async () => {
    if (window.ethereum && typeof window.ethereum.request === 'function') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        const data = await callApi(address, 'MetaMask');

        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (error) {
        console.error('Error during MetaMask login:', error);
      }
    } else {
      console.error('MetaMask not detected');
    }
  }

  const loginWithWeb3Auth = async () => {
    try {
      const web3authProvider = await web3auth.connect();
      const ethersProvider = new ethers.providers.Web3Provider(web3authProvider as any);
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();

      const data = await callApi(address, 'Web3Auth');

      // ここでスマートコントラクトのFaucetContractを呼び出すAPIを呼べば初期資金を提供できる

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Error during Web3Auth login:', error);
    }
  };

  const callApi = async (wallet_address: string, auth_type: string) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wallet_address, auth_type }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    return data;
  }

  const login = async (method: 'metamask' | 'web3auth') => {
    if (method === 'metamask') {
      await loginWithMetaMask();
    } else if (method === 'web3auth') {
      await loginWithWeb3Auth();
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      if (web3auth.connected) {
        await web3auth.logout();
      }

      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};