
import React, { useState, useRef } from 'react';
import { reverseEngineerPrompt } from '../services/geminiService';
import { UI_STRINGS } from '../constants';
import { Language } from '../types';

interface ImageAnalyzerProps {
  onUsePrompt: (prompt: string) => void;
  language: Language;
}

interface AnalysisResult {
  prompt: string;
  analysis: string;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onUsePrompt, language }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = UI_STRINGS[language];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); 
        setUrlError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlLoad = async () => {
    if (!imageUrlInput.trim()) return;
    setIsLoadingUrl(true);
    setUrlError(null);
    try {
      const response = await fetch(imageUrlInput);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) throw new Error("URL is not an image");

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setImageUrlInput(''); 
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error(error);
      setUrlError("Cannot fetch image. Please upload instead.");
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsLoading(true);
    try {
      const data = await reverseEngineerPrompt(image, language);
      setResult(data);
    } catch (error) {
      console.error(error);
      setUrlError("Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) navigator.clipboard.writeText(result.prompt);
  };

  return (
    <div className="glass-panel p-1 rounded-[32px] shadow-2xl shadow-black/50 animate-slideUp">
      <div className="bg-black/40 rounded-[28px] p-6 space-y-6">
        
        <div className="text-center space-y-1">
          <h3 className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
             {t.analyze_title}
          </h3>
          <p className="text-xs text-gray-400">{t.analyze_subtitle}</p>
        </div>

        <div className="relative">
            <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
            />
            
            {!image ? (
            <div className="space-y-4">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-amber-400/50 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-amber-400/20 transition-colors">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-white">{t.tap_upload}</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-xs text-gray-500">OR</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <input 
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
                      placeholder={t.paste_url}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-24 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                    />
                    <button
                      onClick={handleUrlLoad}
                      disabled={!imageUrlInput || isLoadingUrl}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {isLoadingUrl && (
                         <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      )}
                      {t.load_url}
                    </button>
                </div>
                {urlError && (
                   <p className="text-red-400 text-xs pl-1 animate-fadeIn">⚠️ {urlError}</p>
                )}
            </div>
            ) : (
            <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black">
                <img src={image} alt="Upload" className="w-full h-48 object-contain opacity-80" />
                <button 
                onClick={() => { setImage(null); setResult(null); setImageUrlInput(''); setUrlError(null); }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-red-500 text-white transition-colors"
                >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            )}
        </div>

        {!result && (
            <div className="relative">
                <button
                onClick={handleAnalyze}
                disabled={!image || isLoading}
                className={`
                    w-full py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2
                    ${!image 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-[1.02] active:scale-95'}
                `}
                >
                {isLoading ? (
                    <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t.scanning}</span>
                    </>
                ) : (
                    <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{t.analyze_btn}</span>
                    </>
                )}
                </button>
            </div>
        )}

        {result && (
            <div className="space-y-4 animate-fadeIn">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🧐</span>
                        <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide">{t.ai_analysis_title}</h4>
                     </div>
                     <p className="text-white text-md font-medium leading-relaxed">
                        "{result.analysis}"
                     </p>
                </div>

                <div className="bg-black/50 rounded-xl p-4 border border-white/10 relative group">
                    <div className="absolute top-0 left-0 px-2 py-1 bg-white/10 rounded-br-lg text-[10px] text-gray-400 font-medium border-b border-r border-white/10">
                        {t.extracted_prompt}
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed mt-4 max-h-32 overflow-y-auto font-mono">
                        {result.prompt}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleCopy}
                        className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/10"
                    >
                        {t.copy_btn}
                    </button>
                    <button 
                        onClick={() => onUsePrompt(result.prompt)}
                        className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {t.use_prompt_btn}
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ImageAnalyzer;
