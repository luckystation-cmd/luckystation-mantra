
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import StyleSelector from './components/StyleSelector';
import LoadingView from './components/LoadingView';
import ResultView from './components/ResultView';
import ImageAnalyzer from './components/ImageAnalyzer';
import AltarView from './components/AltarView';
import UserOverlay from './components/UserOverlay'; 
import GalleryView from './components/GalleryView';
import { STYLES, ORIGINS, MATERIALS, UI_STRINGS } from './constants';
import { AppStatus, GeneratedImage, StyleOption, OriginOption, MaterialOption, Language } from './types';
import { enhancePrompt, generateImage, quickConstructPrompt } from './services/geminiService';
import { audioService } from './services/audioService';
import { dbService } from './services/dbService'; // Import DBService
import { UserProvider, useUser } from './contexts/UserContext';

// --- Inner App Component (Where hooks can be used) ---
const InnerApp: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(STYLES[0]);
  const [selectedOrigin, setSelectedOrigin] = useState<OriginOption>(ORIGINS[0]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(MATERIALS[0]);
  
  const [language, setLanguage] = useState<Language>('th');
  const [isMagicEnabled, setIsMagicEnabled] = useState(true);

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'GENERATE' | 'ANALYZE' | 'ALTAR' | 'GALLERY'>('GENERATE');
  const [isMuted, setIsMuted] = useState(false);

  // History State
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  // User Overlay State
  const [showOverlay, setShowOverlay] = useState<'LOGIN' | 'STORE' | null>(null);

  const bgRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consume User Context
  const { user, deductCredit } = useUser();

  const t = UI_STRINGS[language];

  // Load History from IndexedDB
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const images = await dbService.getAllImages();
        setHistory(images);
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    };
    loadHistory();
  }, []);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
        setErrorMessage(language === 'th' ? "กรุณาพิมพ์คำอธิษฐานก่อนครับ" : "Please enter a keyword.");
        setTimeout(() => setErrorMessage(null), 3000);
        return;
    }

    // Deduct Credit (Gamification only)
    deductCredit();
    
    setStatus(isMagicEnabled ? AppStatus.ENHANCING : AppStatus.GENERATING);
    setErrorMessage(null);
    audioService.playGenerateStart(selectedStyle.id);

    try {
      let finalPrompt = "";
      let blessing = "";
      let fontStyleTag = "standard";

      // 1. Construct/Enhance Prompt
      if (isMagicEnabled) {
         const enhanced = await enhancePrompt(
             inputText, 
             selectedStyle, 
             selectedOrigin, 
             !!referenceImage,
             selectedMaterial,
             language
         );
         finalPrompt = enhanced.prompt;
         blessing = enhanced.blessing;
         fontStyleTag = enhanced.fontStyleTag || "standard";
      } else {
         const quick = quickConstructPrompt(inputText, selectedStyle, selectedOrigin, selectedMaterial, language);
         finalPrompt = quick.prompt;
         blessing = quick.blessing;
         fontStyleTag = quick.fontStyleTag;
         // Small delay to simulate processing in Raw Mode
         await new Promise(r => setTimeout(r, 800));
      }

      setStatus(AppStatus.GENERATING);

      // 2. Generate Image
      const imageUrl = await generateImage(finalPrompt, "9:16", referenceImage || undefined, selectedStyle.id);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: finalPrompt,
        timestamp: Date.now(),
        blessing: blessing,
        styleId: selectedStyle.id,
        fontStyleTag: fontStyleTag
      };

      setCurrentImage(newImage);
      setStatus(AppStatus.SUCCESS);
      audioService.playSuccess(selectedStyle.id);

      // Save to History & DB
      setHistory(prev => [newImage, ...prev]);
      dbService.saveImage(newImage).catch(console.error);

    } catch (error: any) {
      console.error("Generation failed:", error);
      setStatus(AppStatus.ERROR);
      
      const errString = (error.message || "").toUpperCase() + (error.toString() || "").toUpperCase();
      let msg = t.error_msg; // Default generic error

      // 1. SAFETY BLOCK
      if (errString.includes('SAFETY') || errString.includes('BLOCK') || errString.includes('REFUSED')) {
          msg = t.safety_error_msg;
      } 
      // 2. QUOTA / RATE LIMIT
      else if (errString.includes('429') || errString.includes('QUOTA') || errString.includes('RESOURCE_EXHAUSTED')) {
          msg = t.quota_msg;
      }
      // 3. NETWORK
      else if (errString.includes('NETWORK') || errString.includes('FETCH')) {
          msg = language === 'th' ? "❌ ไม่สามารถเชื่อมต่อได้ เช็คอินเทอร์เน็ต" : "❌ Network Error. Check connection.";
      }

      setErrorMessage(msg);

      // Extend display time to 8 seconds so user can read the solution
      setTimeout(() => {
        setStatus(prev => prev === AppStatus.ERROR ? AppStatus.IDLE : prev);
        setErrorMessage(null);
      }, 8000);
    }
  };

  const handleToggleMagic = () => {
    setIsMagicEnabled(!isMagicEnabled);
    if (!isMagicEnabled) audioService.playMagicOn();
    else audioService.playMagicOff();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReferenceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-x-hidden selection:bg-amber-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black"></div>
         <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-[pulse_8s_infinite]"></div>
         <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-amber-900/10 blur-[120px] rounded-full mix-blend-screen animate-[pulse_10s_infinite]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <Header 
        isMuted={isMuted}
        onToggleMute={() => {
            const newVal = !isMuted;
            setIsMuted(newVal);
            audioService.setMuted(newVal);
        }}
        language={language}
        onToggleLanguage={() => setLanguage(l => l === 'th' ? 'en' : 'th')}
        onHome={() => setViewMode('GENERATE')}
        onOpenLogin={() => setShowOverlay('LOGIN')}
        onOpenStore={() => setShowOverlay('STORE')}
      />

      {/* Main Content */}
      <main className="relative z-10 pt-20 pb-24 px-4 max-w-lg mx-auto min-h-screen flex flex-col">
        
        {/* TAB SWITCHER */}
        <div className="flex justify-center gap-1 bg-white/5 p-1 rounded-2xl mb-6 backdrop-blur-md border border-white/5">
            {[
                { id: 'GENERATE', label: t.generate_tab, icon: '🎨' },
                { id: 'ALTAR', label: t.altar_tab, icon: '🙏' },
                { id: 'GALLERY', label: t.gallery_tab, icon: '🎴' },
                { id: 'ANALYZE', label: t.analyze_tab, icon: '👁️' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => {
                        setViewMode(tab.id as any);
                        audioService.playClick('standard');
                    }}
                    className={`flex-1 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col items-center gap-1 ${viewMode === tab.id ? 'bg-white/10 text-amber-400 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>

        {/* --- VIEW: GENERATE --- */}
        {viewMode === 'GENERATE' && (
            <div className="space-y-6 animate-fadeIn">
                
                {/* Hero Text */}
                <div className="text-center space-y-1 py-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)] font-['Srisakdi']">
                            {t.title_prefix}
                        </span>
                        <br/>
                        <span className="text-lg font-light tracking-[0.2em] text-gray-300 uppercase">
                            {t.title_suffix}
                        </span>
                    </h1>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                        {t.subtitle}
                    </p>
                </div>

                {/* Input Area */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                    <div className="relative bg-[#1a1a1a] rounded-2xl p-4 border border-white/10 shadow-xl">
                        
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                {t.input_label}
                            </label>
                            <button 
                                onClick={handleToggleMagic}
                                className={`text-[10px] px-2 py-1 rounded-full border transition-all flex items-center gap-1 ${isMagicEnabled ? 'bg-purple-900/50 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-gray-800 border-gray-600 text-gray-400'}`}
                            >
                                {isMagicEnabled ? t.magic_mode_on : t.magic_mode_off}
                            </button>
                        </div>

                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={t.input_placeholder}
                            className="w-full bg-black/30 text-white placeholder-gray-600 text-lg font-medium border-none focus:ring-0 resize-none h-20 leading-relaxed"
                        />

                        {/* Upload Ref Image Button */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            {referenceImage ? (
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                                    <img src={referenceImage} alt="Ref" className="w-6 h-6 rounded object-cover" />
                                    <span className="text-xs text-gray-300">Image Loaded</span>
                                    <button onClick={() => setReferenceImage(null)} className="text-gray-500 hover:text-white ml-2">×</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {t.upload_btn}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Selectors */}
                <StyleSelector 
                    selectedStyle={selectedStyle} 
                    onSelect={(s) => {
                        setSelectedStyle(s);
                        audioService.playClick(s.id);
                    }}
                    language={language}
                />

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-gray-500 font-bold px-1">{t.origin_label}</label>
                        <select 
                            value={selectedOrigin.id}
                            onChange={(e) => setSelectedOrigin(ORIGINS.find(o => o.id === e.target.value) || ORIGINS[0])}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        >
                            {ORIGINS.map(o => (
                                <option key={o.id} value={o.id} className="bg-gray-900 text-white">
                                    {o.flag} {language === 'th' ? o.name_th : o.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-gray-500 font-bold px-1">{t.material_label}</label>
                        <select 
                            value={selectedMaterial.id}
                            onChange={(e) => setSelectedMaterial(MATERIALS.find(m => m.id === e.target.value) || MATERIALS[0])}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                        >
                            {MATERIALS.map(m => (
                                <option key={m.id} value={m.id} className="bg-gray-900 text-white">
                                    {language === 'th' ? m.name_th : m.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={status !== AppStatus.IDLE}
                    className="w-full relative group overflow-hidden rounded-2xl p-0.5"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-[gradient_3s_ease_infinite] opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-black rounded-[14px] px-6 py-4 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]">
                        {status !== AppStatus.IDLE ? (
                             <>
                                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                                    {t.generate_btn_loading}
                                </span>
                             </>
                        ) : (
                             <>
                                <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">🔮</span>
                                <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-yellow-400">
                                    {t.generate_btn_idle}
                                </span>
                             </>
                        )}
                    </div>
                </button>

                <div className="text-center text-[10px] text-gray-600 font-mono">
                    {t.powered_by}
                </div>
            </div>
        )}

        {/* --- VIEW: ALTAR --- */}
        {viewMode === 'ALTAR' && (
            <AltarView image={currentImage || history[0] || null} language={language} />
        )}

        {/* --- VIEW: GALLERY --- */}
        {viewMode === 'GALLERY' && (
            <GalleryView 
                images={history} 
                language={language}
                onSelect={(img) => {
                    setCurrentImage(img);
                    // Optionally open ResultView
                }}
                onDelete={(id) => {
                   setHistory(prev => prev.filter(i => i.id !== id));
                   dbService.deleteImage(id);
                }}
            />
        )}

        {/* --- VIEW: ANALYZE --- */}
        {viewMode === 'ANALYZE' && (
            <ImageAnalyzer 
                language={language}
                onUsePrompt={(p) => {
                    setInputText(p);
                    setViewMode('GENERATE');
                }}
            />
        )}

      </main>

      {/* --- OVERLAYS --- */}
      
      {/* Loading Overlay */}
      {(status === AppStatus.ENHANCING || status === AppStatus.GENERATING) && (
        <LoadingView status={status} language={language} />
      )}

      {/* Result View Overlay */}
      {currentImage && viewMode === 'GENERATE' && status === AppStatus.SUCCESS && (
         <ResultView 
            image={currentImage} 
            onClose={() => setStatus(AppStatus.IDLE)} 
            onDelete={() => {
                setHistory(prev => prev.filter(i => i.id !== currentImage.id));
                setCurrentImage(null);
                setStatus(AppStatus.IDLE);
            }}
            onRemix={(prompt) => {
                setInputText(prompt);
                setCurrentImage(null);
                setStatus(AppStatus.IDLE);
            }}
            language={language}
         />
      )}

      {/* Error Toast (Fixed Bottom) */}
      <div className={`fixed bottom-24 left-4 right-4 z-[99] p-4 rounded-xl bg-red-900/95 border border-red-500/50 text-white shadow-2xl backdrop-blur-xl transform transition-all duration-500 ${errorMessage ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="flex items-start gap-3">
            <div className="p-2 bg-red-800 rounded-lg shrink-0">
                <span className="text-xl">⚠️</span>
            </div>
            <div className="flex-1">
                <div className="whitespace-pre-line text-sm font-medium leading-relaxed opacity-90">
                    {errorMessage}
                </div>
                {/* SMART ACTION BUTTON */}
                {(errorMessage?.includes('Safety') || errorMessage?.includes('ความปลอดภัย')) && (
                    <button 
                        onClick={() => {
                            setIsMagicEnabled(false);
                            setErrorMessage(null);
                            // User needs to tap Generate again, but we set the state
                        }}
                        className="mt-2 text-xs bg-white text-red-900 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    >
                         {language === 'th' ? '⚡ ปิด Magic (Raw Mode)' : '⚡ Disable Magic'}
                    </button>
                )}
                {(errorMessage?.includes('Quota') || errorMessage?.includes('Server Busy')) && (
                    <button 
                         onClick={() => {
                             setErrorMessage(null);
                             handleGenerate();
                         }}
                         className="mt-2 text-xs bg-white text-red-900 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                    >
                         {language === 'th' ? '🔄 ลองใหม่' : '🔄 Retry'}
                    </button>
                )}
            </div>
            <button 
                onClick={() => setErrorMessage(null)} 
                className="p-1 text-white/40 hover:text-white transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      </div>

      {/* User Logic Overlay (Login/Store) */}
      <UserOverlay 
        type={showOverlay || 'LOGIN'} 
        isOpen={!!showOverlay} 
        onClose={() => setShowOverlay(null)}
        language={language}
      />

    </div>
  );
};

// --- Main App Entry ---
const App: React.FC = () => {
  return (
    <UserProvider>
      <InnerApp />
    </UserProvider>
  );
};

export default App;
