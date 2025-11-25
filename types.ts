
export type Language = 'th' | 'en';

export interface StyleOption {
  id: string;
  name: string;
  name_th: string;
  description: string;
  description_th: string;
  promptModifier: string;
  icon: string;
  color: string;
}

export interface OriginOption {
  id: string;
  name: string;
  name_th: string;
  promptModifier: string;
  flag: string;
  flagCode: string; 
}

export interface MaterialOption {
  id: string;
  name: string;
  name_th: string;
  promptModifier: string;
  color: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  blessing?: string; 
  styleId?: string; 
  fontStyleTag?: string; 
}

export enum AppStatus {
  IDLE = 'IDLE',
  ENHANCING = 'ENHANCING', 
  GENERATING = 'GENERATING', 
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GenerationConfig {
  aspectRatio: "9:16";
}

export interface FortuneResult {
  verse: string;        
  prediction: string;   
  lucky_numbers: string; 
}

// --- NEW USER ECONOMY TYPES ---

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  credits: number;
  isVip: boolean;
  lastDailyClaim: number | null; // Timestamp
}

export interface UserContextType {
  user: UserProfile | null;
  apiKey: string | null; // NEW: Store API Key
  setApiKey: (key: string) => void; // NEW: Function to set key
  removeApiKey: () => void; // NEW: Function to remove key
  login: () => void;
  logout: () => void;
  deductCredit: () => boolean;
  addCredits: (amount: number) => void;
  watchAd: () => Promise<boolean>; // Returns true if ad watched successfully
  claimDailyReward: () => boolean;
  canClaimDaily: boolean;
}
