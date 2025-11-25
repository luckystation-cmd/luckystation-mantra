
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Language } from '../types';

interface UserOverlayProps {
  type: 'LOGIN' | 'STORE' | 'API_KEY';
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const UserOverlay: React.FC<UserOverlayProps> = ({ type, isOpen, onClose, language }) => {
  const { login, user, watchAd, claimDailyReward, canClaimDaily, apiKey, setApiKey, removeApiKey } = useUser();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(3);
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    if (apiKey) setInputKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    if (inputKey.trim().length > 10) {
        setApiKey(inputKey.trim());
        onClose();
    } else {
        alert(language === 'th' ? "API Key ไม่ถูกต้อง" : "Invalid API Key");
    }
  };

  const handleRemoveKey = () => {
      if (confirm(language === 'th' ? "ต้องการลบกุญแจ?" : "Remove API Key?")) {
          removeApiKey();
          setInputKey('');
      }
  }

  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    setAdTimer(3);
    
    const interval = setInterval(() => {
        setAdTimer(prev => prev - 1);
    }, 1000);

    await watchAd(); // Simulates 3s delay
    
    clearInterval(interval);
    setIsWatchingAd(false);
  };

  const handleClaimDaily = () => {
    claimDailyReward();
  };

  // --- AD OVERLAY (Simulating a full screen ad) ---
  if (isWatchingAd) {
      return (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 animate-fadeIn">
              <div className="absolute top-4 right-4 text-white/50 text-xs">Ad • Sponsor</div>
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Watching Ad...</h2>
              <p className="text-gray-400 text-sm">Reward in {adTimer}s</p>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={onClose}></div>
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-[#1a1a1a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-slideUp">
        
        {/* Header Decor */}
        <div className="h-24 bg-gradient-to-br from-amber-500 to-amber-700 relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
             {type === 'API_KEY' || type === 'LOGIN' ? (
                 <span className="text-5xl drop-shadow-lg">🗝️</span>
             ) : (
                 <span className="text-5xl drop-shadow-lg">🪙</span>
             )}
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
        </div>

        <div className="p-8 text-center space-y-6">
            
            {(type === 'LOGIN' || type === 'API_KEY') && (
                <>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">
                            {language === 'th' ? 'ถวายกุญแจทิพย์' : 'Offer Celestial Key'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {language === 'th' 
                             ? 'กรุณากรอก Gemini API Key เพื่อเปิดประตูมิติ (ฟรี)' 
                             : 'Enter your Gemini API Key to open the portal (Free).'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <input 
                                type="password" 
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                placeholder={language === 'th' ? "วาง API Key ที่นี่..." : "Paste API Key here..."}
                                className="w-full bg-black/50 border border-amber-500/30 rounded-xl p-4 text-center text-white focus:outline-none focus:border-amber-400 transition-colors"
                            />
                             {apiKey && (
                                <button 
                                    onClick={handleRemoveKey}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs hover:text-red-300"
                                >
                                    {language === 'th' ? 'ลบ' : 'Remove'}
                                </button>
                             )}
                        </div>

                        <button 
                            onClick={handleSaveKey}
                            disabled={inputKey.length < 10}
                            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                                inputKey.length >= 10 
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:scale-[1.02]' 
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {apiKey ? (language === 'th' ? 'อัปเดตกุญแจ' : 'Update Key') : (language === 'th' ? 'ยืนยันกุญแจ' : 'Confirm Key')}
                        </button>
                    </div>
                    
                    <div className="pt-2 border-t border-white/10">
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:text-amber-300 underline flex items-center justify-center gap-1"
                        >
                            {language === 'th' ? '👉 รับกุญแจฟรี (Get API Key)' : '👉 Get Free API Key'}
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                        <p className="text-[10px] text-gray-500 mt-2">
                            *Key is stored locally on your device.
                        </p>
                    </div>
                </>
            )}

            {type === 'STORE' && user && (
                <>
                   <div className="space-y-1">
                        <h2 className="text-xl font-bold text-white">
                            {language === 'th' ? 'เติมพลังบุญ' : 'Top-up Credits'}
                        </h2>
                        <div className="text-4xl font-bold text-amber-400 drop-shadow-md">
                             {user.credits} <span className="text-sm text-gray-400">Coins</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                         {/* Daily Reward */}
                         <button 
                            onClick={handleClaimDaily}
                            disabled={!canClaimDaily}
                            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                canClaimDaily 
                                ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/50 hover:border-green-400 cursor-pointer' 
                                : 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed'
                            }`}
                         >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📅</span>
                                <div className="text-left">
                                    <div className="text-white font-bold text-sm">Daily Login</div>
                                    <div className="text-[10px] text-gray-400">{canClaimDaily ? 'Available Now' : 'Come back tomorrow'}</div>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-green-500 text-black font-bold text-xs rounded-full">
                                {canClaimDaily ? 'CLAIM +10' : 'CLAIMED'}
                            </div>
                         </button>

                         {/* Watch Ad */}
                         <button 
                            onClick={handleWatchAd}
                            className="w-full p-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-2xl border border-purple-500/50 flex items-center justify-between hover:border-purple-400 transition-all active:scale-[0.98]"
                         >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🎬</span>
                                <div className="text-left">
                                    <div className="text-white font-bold text-sm">Watch Ad</div>
                                    <div className="text-[10px] text-gray-400">Support us & get reward</div>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-purple-500 text-white font-bold text-xs rounded-full">
                                +5 FREE
                            </div>
                         </button>
                         
                         <div className="text-[10px] text-gray-500 pt-2">
                            {language === 'th' ? 'เหรียญใช้สำหรับเล่นสนุกเท่านั้น ไม่มีการหักเงินจริง' : 'Credits are for gamification only. No real money involved.'}
                         </div>
                    </div>
                </>
            )}

        </div>
      </div>
    </div>
  );
};

export default UserOverlay;
