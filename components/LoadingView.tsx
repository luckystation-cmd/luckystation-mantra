
import React from 'react';
import { AppStatus, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface LoadingViewProps {
  status: AppStatus;
  language: Language;
}

const LoadingView: React.FC<LoadingViewProps> = ({ status, language }) => {
  const isEnhancing = status === AppStatus.ENHANCING;
  const t = UI_STRINGS[language];
  
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl animate-fadeIn">
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl bg-purple-600/30 animate-pulse"></div>
        <div className="w-20 h-20 border-4 border-t-purple-500 border-r-amber-500 border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl animate-bounce">
            {isEnhancing ? '✨' : '🎨'}
          </span>
        </div>
      </div>
      
      <div className="mt-6 text-center space-y-1">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-amber-200">
          {isEnhancing ? t.enhancing_title : t.generating_title}
        </h3>
        <p className="text-xs text-gray-400">
          {isEnhancing ? t.enhancing_desc : t.generating_desc}
        </p>
      </div>
    </div>
  );
};

export default LoadingView;
