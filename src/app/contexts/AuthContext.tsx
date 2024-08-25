'use client'; 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { supabase } from '../lib/supabase/supabase';
import { web3auth } from '../lib/web3auth/web3auth';
import { User, AuthMethod, AuthContextType } from '../types/auth';

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
}

// createContextを使用して、認証情報を保持するコンテキストを作成する
// このコンテキストはアプリのどこからでも使用できる
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

  const getProvider = async (method: AuthMethod): Promise<ethers.providers.Web3Provider> => {
    if (method === 'metamask') {
      if (!window.ethereum || typeof window.ethereum.request !== 'function') {
        throw new Error('MetaMask not detected');
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return new ethers.providers.Web3Provider(window.ethereum);
    } else {
      const web3authProvider = await web3auth.connect();
      return new ethers.providers.Web3Provider(web3authProvider as any);
    }
  };

  const getAddress = async (provider: ethers.providers.Web3Provider): Promise<string> => {
    const signer = provider.getSigner();
    return await signer.getAddress();
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

    return await response.json();
  }

  const login = async (method: AuthMethod) => {
    try {
      const provider = await getProvider(method);
      const address = await getAddress(provider);
      const { user: newUser } = await callApi(address, method);

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error(`Error during ${method} login:`, error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      if (web3auth.connected) {
        await web3auth.logout();
      }
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    // コンテキストのプロバイダーでアプリ全体にvalueを渡す
    // AuthContext.Providerは自動で生成される
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// コンポーネントでの認証関連処理を簡潔にするためにuseContextをラップしたuseAuthを実装
export const useAuth = () => {
  // AuthContextはuser,login,logoutを所持するコンテキスト
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};