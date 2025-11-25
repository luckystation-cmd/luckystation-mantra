
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Language } from '../types';
import { UI_STRINGS } from '../constants';

interface UserOverlayProps {
  type: 'LOGIN' | 'STORE';
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const UserOverlay: React.FC<UserOverlayProps> = ({ type, isOpen, onClose, language }) => {
  const { login, user, watchAd, claimDailyReward, canClaimDaily } = useUser();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(3);
  const t = UI_STRINGS[language];

  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = () => {
      login();
      onClose();
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
             {type === 'LOGIN' ? (
                 <span className="text-5xl drop-shadow-lg">✨</span>
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
            
            {type === 'LOGIN' && (
                <>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">
                            {language === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {t.sign_in_desc}
                        </p>
                    </div>

                    <div className="space-y-4 pt-2">
                        <button 
                            onClick={handleLogin}
                            className="w-full py-4 rounded-xl bg-white text-gray-700 font-bold shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                            <span>{t.sign_in_google}</span>
                        </button>
                        <p className="text-[10px] text-gray-500">
                           {language === 'th' ? 'จำลองการเข้าสู่ระบบเพื่อความสะดวกรวดเร็ว (ไม่มีการเก็บข้อมูลจริง)' : 'Simulated login for quick access (No real data stored).'}
                        </p>
                    </div>
                </>
            )}

            {type === 'STORE' && user && (
                <>
                   <div className="space-y-1">
                        <h2 className="text-xl font-bold text-white">
                            {t.top_up_title}
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
                                    <div className="text-white font-bold text-sm">{t.daily_reward}</div>
                                    <div className="text-[10px] text-gray-400">{canClaimDaily ? (language === 'th' ? 'กดรับได้เลย' : 'Available Now') : (language === 'th' ? 'พรุ่งนี้มาใหม่' : 'Come back tomorrow')}</div>
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
                                    <div className="text-white font-bold text-sm">{t.watch_ad}</div>
                                    <div className="text-[10px] text-gray-400">{language === 'th' ? 'สนับสนุนเรา & รับแต้ม' : 'Support us & get reward'}</div>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-purple-500 text-white font-bold text-xs rounded-full">
                                +5 FREE
                            </div>
                         </button>
                         
                         <div className="text-[10px] text-gray-500 pt-2">
                            {t.credits_desc}
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
