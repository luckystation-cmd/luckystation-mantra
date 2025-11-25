
import React from 'react';
import { STYLES, UI_STRINGS } from '../constants';
import { StyleOption, Language } from '../types';

interface StyleSelectorProps {
  selectedStyle: StyleOption;
  onSelect: (style: StyleOption) => void;
  language: Language;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, language }) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-end px-1">
        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {UI_STRINGS[language].style_label}
        </label>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-4 px-2 snap-x -mx-2">
        {STYLES.map((style) => {
          const isSelected = selectedStyle.id === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onSelect(style)}
              className={`
                relative flex-shrink-0 w-28 h-32 rounded-2xl p-3 flex flex-col justify-between
                transition-all duration-300 snap-center border
                ${isSelected 
                  ? 'border-amber-400/50 bg-white/10 shadow-[0_0_20px_rgba(251,191,36,0.2)] translate-y-[-2px]' 
                  : 'border-white/5 bg-white/5 hover:bg-white/10'}
              `}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-lg
                bg-gradient-to-br ${style.color} shadow-lg
              `}>
                {style.icon}
              </div>
              
              <div className="text-left">
                <span className={`block text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {language === 'th' ? style.name_th : style.name}
                </span>
                <span className="text-[10px] text-gray-500 leading-tight line-clamp-2 mt-1">
                  {language === 'th' ? style.description_th : style.description}
                </span>
              </div>

              {isSelected && (
                <div className="absolute inset-0 rounded-2xl ring-1 ring-amber-400/30"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StyleSelector;
