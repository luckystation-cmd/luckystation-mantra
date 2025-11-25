
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
  const [showOverlay, setShowOverlay] = useState<'LOGIN' | 'STORE' | 'API_KEY' | null>(null);

  const bgRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consume User Context
  const { user, deductCredit, apiKey } = useUser();

  const t = UI_STRINGS[language];

  // Load History from IndexedDB
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const images = await dbService.getAllImages();
        setHistory(images);
      } catch (e) {
        console.error("Failed to load history from DB", e);
      }
    };
    loadHistory();
  }, []);

  const saveToHistory = async (newImage: GeneratedImage) => {
    try {
      await dbService.saveImage(newImage);
      setHistory(prev => [newImage, ...prev]);
    } catch (e) {
      console.error("Failed to save image to DB", e);
    }
  };

  const deleteFromHistory = async (id: string) => {
    try {
      await dbService.deleteImage(id);
      const updated = history.filter(img => img.id !== id);
      setHistory(updated);
      audioService.playClick('default');
      // If the deleted image was currently viewed in ResultView, close it
      if (currentImage?.id === id) {
          setCurrentImage(null);
          setStatus(AppStatus.IDLE);
      }
    } catch (e) {
      console.error("Failed to delete image from DB", e);
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (bgRef.current) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        bgRef.current.style.transform = `translate(-${x * 20}px, -${y * 20}px) scale(1.1)`;
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    audioService.setMuted(newState);
    if (!newState) {
      audioService.playClick(selectedStyle.id);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'th' ? 'en' : 'th';
    setLanguage(newLang);
    audioService.playClick('default');
  };

  const toggleMagic = () => {
    const newState = !isMagicEnabled;
    setIsMagicEnabled(newState);
    if (newState) {
      audioService.playMagicOn();
    } else {
      audioService.playMagicOff();
    }
  };

  const handleGoHome = () => {
    setViewMode('GENERATE');
    audioService.playClick('default');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStyleSelect = (style: StyleOption) => {
    setSelectedStyle(style);
    audioService.playClick(style.id);
  };

  const handleOriginSelect = (origin: OriginOption) => {
    setSelectedOrigin(origin);
    audioService.playClick(selectedStyle.id);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
        audioService.playClick(selectedStyle.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    audioService.playClick(selectedStyle.id);
  };

  const handleUseAnalyzedPrompt = (prompt: string) => {
    setInputText(prompt);
    setViewMode('GENERATE');
    audioService.playClick('default');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    // 1. CHECK API KEY (BYOK)
    if (!apiKey) {
        setShowOverlay('API_KEY');
        return;
    }

    // 2. DEDUCT CREDIT (Gamification only)
    if (user && user.credits > 0) {
        deductCredit();
    }

    setStatus(AppStatus.ENHANCING);
    setErrorMessage(null);
    audioService.playGenerateStart(selectedStyle.id);
    audioService.startAmbient();

    try {
      const materialToUse = selectedStyle.id === 'artmulet' ? selectedMaterial : undefined;
      
      let promptData;
      
      if (isMagicEnabled) {
          promptData = await enhancePrompt(
            apiKey,
            inputText, 
            selectedStyle, 
            selectedOrigin, 
            !!referenceImage,
            materialToUse,
            language
          );
      } else {
          promptData = quickConstructPrompt(
            inputText,
            selectedStyle, 
            selectedOrigin, 
            materialToUse, 
            language
          );
          await new Promise(r => setTimeout(r, 800));
      }
      
      const { prompt: finalPrompt, blessing, fontStyleTag } = promptData;
      
      setStatus(AppStatus.GENERATING);
      
      const imageUrl = await generateImage(
          apiKey,
          finalPrompt, 
          "9:16", 
          referenceImage || undefined, 
          selectedStyle.id
      );
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: finalPrompt,
        timestamp: Date.now(),
        blessing: blessing,
        styleId: selectedStyle.id,
        fontStyleTag: fontStyleTag
      };

      await saveToHistory(newImage); // SAVE TO DB
      setCurrentImage(newImage);
      setStatus(AppStatus.SUCCESS);
      
      audioService.stopAmbient();
      audioService.playSuccess(selectedStyle.id);

    } catch (error: any) {
      console.error(error);
      const errString = (error.message || "") + (error.toString() || "");
      
      if (errString.includes("429") || errString.toLowerCase().includes("quota") || errString.includes("RESOURCE_EXHAUSTED")) {
        setErrorMessage(t.quota_msg);
      } else if (errString.includes("API Key")) {
        setErrorMessage(language === 'th' ? "กุญแจ API ไม่ถูกต้อง" : "Invalid API Key");
        setShowOverlay('API_KEY');
      } else {
        setErrorMessage(t.error_msg);
      }
      
      setStatus(AppStatus.ERROR);
      audioService.stopAmbient();
      setTimeout(() => {
          setStatus(AppStatus.IDLE);
          setErrorMessage(null);
      }, 5000);
    }
  };

  const handleGallerySelect = (image: GeneratedImage) => {
      setCurrentImage(image);
      setStatus(AppStatus.SUCCESS); // Re-use the success view overlay
      audioService.playClick(image.styleId || 'default');
  };

  const getButtonLabel = () => {
    // English dynamic labels
    if (language === 'en') {
      switch (selectedStyle.id) {
        case 'chibi-pastel': return 'Manifest Cuteness ✨ (-1 Coin)';
        case 'artmulet': return 'Mint Amulet 🙏 (-1 Coin)';
        case 'sacred-deity': return 'Summon Deity ⚡ (-1 Coin)';
        case 'naga-king': return 'Summon Naga 🐉 (-1 Coin)';
        case 'dark-sorcery': return 'Cast Dark Spell 🌑 (-1 Coin)';
        default: return 'Generate (-1 Coin)';
      }
    }
    // Thai dynamic labels
    switch (selectedStyle.id) {
      case 'chibi-pastel': return 'เสกความน่ารัก ✨ (-1 เหรียญ)';
      case 'artmulet': return 'สร้างวัตถุมงคล 🙏 (-1 เหรียญ)';
      case 'sacred-deity': return 'อัญเชิญเทพ ⚡ (-1 เหรียญ)';
      case 'naga-king': return 'อัญเชิญพญานาค 🐉 (-1 เหรียญ)';
      case 'dark-sorcery': return 'ร่ายมนตร์ดำ 🌑 (-1 เหรียญ)';
      default: return 'เริ่มร่ายมนต์ 🔮 (-1 เหรียญ)';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-purple-500/30 font-['Prompt']">
      
      <div className="fixed inset-0 z-0">
        <div ref={bgRef} className="absolute inset-0 transition-transform duration-1000 ease-out">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/30 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[100px]"></div>
          <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-amber-900/10 blur-[80px]"></div>
        </div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <Header 
        isMuted={isMuted} 
        onToggleMute={toggleMute} 
        language={language} 
        onToggleLanguage={toggleLanguage}
        onHome={handleGoHome}
        onOpenLogin={() => setShowOverlay('API_KEY')}
        onOpenStore={() => setShowOverlay('STORE')}
      />

      <UserOverlay 
        type={showOverlay || 'API_KEY'} 
        isOpen={!!showOverlay} 
        onClose={() => setShowOverlay(null)} 
        language={language} 
      />

      <main className="relative z-10 pt-20 pb-10 px-4 max-w-2xl mx-auto flex flex-col gap-6 min-h-[calc(100vh-80px)]">
        
        {/* Navigation */}
        <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mx-auto w-full max-w-sm animate-slideDown overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setViewMode('GENERATE'); audioService.playClick('default'); }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 min-w-[70px] ${
              viewMode === 'GENERATE' 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.generate_tab}
          </button>
          <button
            onClick={() => { setViewMode('ALTAR'); audioService.playClick('default'); }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 min-w-[70px] ${
              viewMode === 'ALTAR' 
              ? 'bg-gradient-to-r from-red-600 to-amber-700 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.altar_tab}
          </button>
          <button
            onClick={() => { setViewMode('GALLERY'); audioService.playClick('default'); }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 min-w-[70px] ${
              viewMode === 'GALLERY' 
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.gallery_tab}
          </button>
          <button
            onClick={() => { setViewMode('ANALYZE'); audioService.playClick('default'); }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 min-w-[70px] ${
              viewMode === 'ANALYZE' 
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.analyze_tab}
          </button>
        </div>

        {viewMode === 'ALTAR' ? (
          <AltarView image={currentImage} language={language} />
        ) : viewMode === 'GALLERY' ? (
          <GalleryView 
            images={history} 
            onSelect={handleGallerySelect} 
            onDelete={deleteFromHistory} 
            language={language} 
          />
        ) : viewMode === 'ANALYZE' ? (
          <ImageAnalyzer onUsePrompt={handleUseAnalyzedPrompt} language={language} />
        ) : (
          /* --- GENERATE MODE --- */
          <>
            <div className="text-center space-y-2 mb-2 animate-slideUp">
              <h2 className="text-3xl font-light tracking-tight text-white">
                {t.title_prefix} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-300">{t.title_suffix}</span>
              </h2>
              <p className="text-gray-400 text-sm">{t.subtitle}</p>
            </div>

            <div className="glass-panel p-1 rounded-[32px] shadow-2xl shadow-black/50 animate-slideUp delay-100">
              <div className="bg-black/40 rounded-[28px] p-6 space-y-6">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t.input_label}</label>
                      
                      {/* Magic Toggle Switch */}
                      <button 
                         onClick={toggleMagic}
                         className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                            isMagicEnabled 
                            ? 'bg-gradient-to-r from-purple-900/50 to-amber-900/50 border-amber-500/50 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                            : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                         }`}
                         title={isMagicEnabled ? "Disable AI rewriting (Raw Mode)" : "Enable AI rewriting (Magic Mode)"}
                      >
                         <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isMagicEnabled ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110' : 'bg-gray-600'}`}></div>
                         <span className={isMagicEnabled ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 drop-shadow-sm' : ''}>
                           {isMagicEnabled ? t.magic_mode_on : t.magic_mode_off}
                         </span>
                      </button>
                  </div>
                  
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={referenceImage ? (language === 'th' ? "ระบุรายละเอียดเพิ่มเติม..." : "Add style details...") : t.input_placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all resize-none h-24"
                    disabled={status === AppStatus.GENERATING || status === AppStatus.ENHANCING}
                  />
                </div>

                <div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  
                  {!referenceImage ? (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 group"
                    >
                      <div className="p-2 rounded-full bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm">{t.upload_btn}</span>
                    </button>
                  ) : (
                    <div className="relative group rounded-xl overflow-hidden border border-purple-500/30">
                      <div className="aspect-[3/1] w-full relative">
                        <img src={referenceImage} alt="Reference" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center gap-4">
                            <span className="text-white font-medium drop-shadow-lg flex items-center gap-2">
                              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {language === 'th' ? 'รูปอ้างอิงพร้อม' : 'Reference Loaded'}
                            </span>
                        </div>
                      </div>
                      <button 
                        onClick={clearReferenceImage}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-500/80 text-white transition-colors backdrop-blur-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{t.origin_label}</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 px-2 -mx-2 mask-gradient-right">
                    {ORIGINS.map((origin) => {
                      const isSelected = selectedOrigin.id === origin.id;
                      return (
                        <button
                          key={origin.id}
                          onClick={() => handleOriginSelect(origin)}
                          className={`
                            flex-shrink-0 px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300
                            ${isSelected 
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg text-white' 
                              : 'bg-white/5 hover:bg-white/10 text-gray-400'}
                          `}
                        >
                          <img 
                            src={`https://flagcdn.com/w40/${origin.flagCode}.png`}
                            srcSet={`https://flagcdn.com/w80/${origin.flagCode}.png 2x`}
                            alt={origin.name}
                            className="w-6 h-auto rounded shadow-sm object-cover"
                          />
                          <span className="text-sm font-medium whitespace-nowrap">
                            {language === 'th' ? origin.name_th : origin.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <StyleSelector 
                  selectedStyle={selectedStyle} 
                  onSelect={handleStyleSelect} 
                  language={language}
                />

                {selectedStyle.id === 'artmulet' && (
                  <div className="space-y-3 animate-slideDown">
                    <div className="flex justify-between items-end px-1">
                      <label className="text-sm font-medium text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <span>{t.material_label}</span>
                      </label>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 px-2 -mx-2 mask-gradient-right">
                      {MATERIALS.map((material) => {
                        const isSelected = selectedMaterial.id === material.id;
                        return (
                          <button
                            key={material.id}
                            onClick={() => { setSelectedMaterial(material); audioService.playClick(selectedStyle.id); }}
                            className={`
                              flex-shrink-0 px-4 py-3 rounded-xl flex items-center gap-2 transition-all duration-300
                              ${isSelected 
                                ? `bg-gradient-to-r ${material.color} shadow-[0_0_15px_rgba(255,255,255,0.2)] text-black font-bold scale-105` 
                                : 'bg-white/5 hover:bg-white/10 text-gray-400'}
                            `}
                          >
                            <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${material.color} border border-white/20`}></span>
                            <span className="text-sm whitespace-nowrap">
                              {language === 'th' ? material.name_th : material.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || status !== AppStatus.IDLE}
                  className={`
                    w-full py-4 rounded-2xl font-bold text-lg tracking-wide shadow-lg
                    flex items-center justify-center gap-2 relative overflow-hidden group
                    ${!inputText.trim() 
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]'}
                    transition-all duration-300 transform active:scale-[0.98]
                  `}
                >
                  {status === AppStatus.IDLE ? (
                    <>
                      <span className="relative z-10">{getButtonLabel()}</span>
                      <svg className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </>
                  ) : (
                    <span className="animate-pulse">{t.generate_btn_loading}</span>
                  )}
                </button>
              </div>
              
              {(status === AppStatus.GENERATING || status === AppStatus.ENHANCING) && (
                <LoadingView status={status} language={language} />
              )}
            </div>
          </>
        )}
        
        <p className="text-center text-[10px] text-gray-600 mt-auto">
          {t.powered_by}
        </p>

      </main>

      {status === AppStatus.SUCCESS && currentImage && (
        <ResultView 
          image={currentImage} 
          onClose={() => {
            setStatus(AppStatus.IDLE);
          }} 
          onDelete={() => deleteFromHistory(currentImage.id)}
          onRemix={(prompt) => {
              setCurrentImage(null);
              setStatus(AppStatus.IDLE);
              handleUseAnalyzedPrompt(prompt); // Re-use logic to set prompt and go to generate view
          }}
          language={language}
        />
      )}
      
      {status === AppStatus.ERROR && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-bounce z-50">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{errorMessage || t.error_msg}</span>
        </div>
      )}

    </div>
  );
};

// --- Main App Wrapper (Provides Context) ---
const App: React.FC = () => {
  return (
    <UserProvider>
      <InnerApp />
    </UserProvider>
  );
};

export default App;
