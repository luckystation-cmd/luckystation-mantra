
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserContextType } from '../types';
import { audioService } from '../services/audioService';

const UserContext = createContext<UserContextType | undefined>(undefined);

// Constants
const WELCOME_CREDITS = 50; // Give 50 credits to match user expectation
const DAILY_REWARD = 10;
const AD_REWARD = 5;

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  // Load user & key from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('luckystation_user');
    const storedKey = localStorage.getItem('luckystation_api_key');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedKey) {
      setApiKeyState(storedKey);
    } else {
        // If no key, we can still have a guest user, or wait until key input
    }
  }, []);

  // Save user to local storage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('luckystation_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('luckystation_user');
    }
  }, [user]);

  const setApiKey = (key: string) => {
    localStorage.setItem('luckystation_api_key', key);
    setApiKeyState(key);
    // If setting key for first time and no user, auto-login to give credits
    if (!user) {
        login();
    }
  };

  const removeApiKey = () => {
    localStorage.removeItem('luckystation_api_key');
    setApiKeyState(null);
  };

  const login = () => {
    // In BYOK mode, "Login" is just creating a local profile
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: 'Divine Creator',
      email: 'creator@luckystation.com',
      avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Mantra&backgroundColor=b6e3f4', // Free Avatar API
      credits: WELCOME_CREDITS,
      isVip: true, // BYOK users are VIPs
      lastDailyClaim: null
    };
    
    setUser(newUser);
    audioService.playCoinSound();
  };

  const logout = () => {
    setUser(null);
    removeApiKey();
  };

  const deductCredit = (): boolean => {
    if (!user) return false;
    // In BYOK mode, credits are just for fun/gamification
    // We update the UI counter but don't strictly block if they have their own key
    // However, for the "Game Feel", we deduct.
    
    if (user.credits <= 0) {
        // Optional: Can allow negative or stop. Let's allow negative for BYOK so they aren't blocked by fake credits.
        setUser(prev => prev ? { ...prev, credits: prev.credits - 1 } : null);
        return true;
    }

    setUser(prev => prev ? { ...prev, credits: prev.credits - 1 } : null);
    return true;
  };

  const addCredits = (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, credits: prev.credits + amount } : null);
    audioService.playCoinSound();
  };

  const watchAd = async (): Promise<boolean> => {
    // Simulate Ad Network Latency
    await new Promise(resolve => setTimeout(resolve, 3000)); 
    addCredits(AD_REWARD);
    return true;
  };

  const canClaimDaily = React.useMemo(() => {
    if (!user) return false;
    if (!user.lastDailyClaim) return true;
    
    const last = new Date(user.lastDailyClaim);
    const now = new Date();
    // Check if it's a different day
    return last.getDate() !== now.getDate() || last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear();
  }, [user]);

  const claimDailyReward = (): boolean => {
    if (!canClaimDaily) return false;
    
    setUser(prev => prev ? { 
      ...prev, 
      credits: prev.credits + DAILY_REWARD,
      lastDailyClaim: Date.now()
    } : null);
    audioService.playCoinSound();
    return true;
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      apiKey,
      setApiKey,
      removeApiKey,
      login, 
      logout, 
      deductCredit, 
      addCredits, 
      watchAd, 
      claimDailyReward,
      canClaimDaily 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
