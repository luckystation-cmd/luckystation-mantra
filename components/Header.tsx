
import React from 'react';
import { APP_NAME } from '../constants';
import { Language } from '../types';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
  isMuted?: boolean;
  onToggleMute?: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onHome: () => void;
  onOpenLogin: () => void;
  onOpenStore: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isMuted = false, 
  onToggleMute, 
  language, 
  onToggleLanguage, 
  onHome,
  onOpenLogin,
  onOpenStore
}) => {
  const { user, apiKey } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl border-b border-white/10"></div>
      <div className="relative max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Home Button */}
        <button 
          onClick={onHome}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none group overflow-hidden"
          title="Go to Home"
        >
          <div className="w-9 h-9 rounded-xl bg-black border border-amber-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.3)] group-hover:shadow-[0_0_25px_rgba(255,215,0,0.6)] group-hover:scale-105 transition-all duration-300 relative overflow-hidden flex-shrink-0">
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-amber-600 text-2xl font-bold drop-shadow-sm pb-1">ॐ</span>
          </div>
          
          <h1 className="text-sm sm:text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 cursor-pointer block whitespace-nowrap truncate">
            {APP_NAME}
          </h1>
        </button>
        
        {/* Right: Actions Group */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* USER / KEY SECTION */}
          {user && apiKey ? (
            <button 
                onClick={onOpenStore}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-amber-500/30 hover:bg-white/10 transition-all mr-1"
            >
                <img src={user.avatar} alt="User" className="w-5 h-5 rounded-full border border-white/20" />
                <div className="flex items-center gap-1">
                    <span className="text-amber-400 text-sm font-bold">{user.credits}</span>
                    <span className="text-[10px] text-amber-200/50">🪙</span>
                </div>
            </button>
          ) : (
            <button 
                onClick={onOpenLogin}
                className={`px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg transition-all border border-white/10 mr-1 whitespace-nowrap flex items-center gap-1 ${apiKey ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-amber-600 animate-pulse'}`}
            >
                {apiKey ? (
                    <>
                    <span className="text-xs">🔐</span> {language === 'th' ? 'พร้อม' : 'Ready'}
                    </>
                ) : (
                    <>
                    <span className="text-xs">🔑</span> {language === 'th' ? 'ใส่กุญแจ' : 'Set Key'}
                    </>
                )}
            </button>
          )}

          {/* Language Toggle */}
          <button 
            onClick={onToggleLanguage}
            className="w-8 h-8 rounded-full bg-white/5 text-[10px] font-bold text-gray-300 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 hover:text-white transition-all flex items-center justify-center backdrop-blur-sm"
          >
            {language === 'th' ? 'TH' : 'EN'}
          </button>

          {/* Mute Button */}
          {onToggleMute && (
            <button 
              onClick={onToggleMute}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border border-transparent ${isMuted ? 'bg-white/5 text-gray-500' : 'bg-white/10 text-amber-200 border-amber-500/20 hover:bg-white/20'}`}
            >
              {isMuted ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                 </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
