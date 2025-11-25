
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserContextType } from '../types';
import { audioService } from '../services/audioService';

const UserContext = createContext<UserContextType | undefined>(undefined);

// Constants
const WELCOME_CREDITS = 50; 
const DAILY_REWARD = 10;
const AD_REWARD = 5;

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('luckystation_user');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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

  const login = () => {
    // Simulated Google Login for gamification
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: 'Divine Creator',
      email: 'creator@gmail.com',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c', // Generic Google-like avatar
      credits: WELCOME_CREDITS,
      isVip: false,
      lastDailyClaim: null
    };
    
    setUser(newUser);
    audioService.playCoinSound();
  };

  const logout = () => {
    setUser(null);
  };

  const deductCredit = (): boolean => {
    if (!user) return false;
    
    if (user.credits <= 0) {
        // In free mode, we allow them to continue even if credits < 0 for better UX,
        // or we could block. Let's just deduct and show negative or clamp to 0.
        // For now, let's just subtract.
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
