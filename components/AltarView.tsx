
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedImage, FortuneResult, Language } from '../types';
import { getDailyFortune } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { UI_STRINGS } from '../constants';

interface AltarViewProps {
  image: GeneratedImage | null;
  language: Language;
}

type OfferingType = 'garland' | 'lotus' | 'fruit' | 'jewelry';

const OFFERINGS = [
  { id: 'garland', label: 'Garland', label_th: 'พวงมาลัย', icon: '🌼' }, 
  { id: 'lotus', label: 'Lotus', label_th: 'ดอกบัว', icon: '🪷' },   
  { id: 'fruit', label: 'Fruits', label_th: 'ผลไม้มงคล', icon: '🍊' }, 
  { id: 'jewelry', label: 'Jewelry', label_th: 'เครื่องประดับ', icon: '📿' }, 
];

const toThaiNum = (n: number) => n.toString().replace(/[0-9]/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[parseInt(d)]);

const AltarView: React.FC<AltarViewProps> = ({ image, language }) => {
  const [isIncenseLit, setIsIncenseLit] = useState(false);
  const [currentOffering, setCurrentOffering] = useState<OfferingType | null>(null);
  const [isOfferingMenuOpen, setIsOfferingMenuOpen] = useState(false);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [stickNumber, setStickNumber] = useState("๑๙");
  const [isStickFalling, setIsStickFalling] = useState(false);
  const [showFortuneModal, setShowFortuneModal] = useState(false);
  const [isSharingFortune, setIsSharingFortune] = useState(false);
  
  const isShakingRef = useRef(false);
  const lastShakeTimeRef = useRef(0);
  const fortuneCardRef = useRef<HTMLDivElement>(null);

  const t = UI_STRINGS[language];
  const hasImage = !!image;

  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      if (showFortuneModal || isStickFalling || !hasImage) return;

      const current = event.accelerationIncludingGravity;
      if (!current) return;
      const { x, y, z } = current;
      if (x === null || y === null || z === null) return;
      const accel = Math.sqrt(x*x + y*y + z*z);
      
      if (accel > 25) { 
        const now = Date.now();
        if (!isShakingRef.current && (now - lastShakeTimeRef.current > 1000)) {
           handleShakeSiamsi(true);
           lastShakeTimeRef.current = now;
        }
      }
    };

    if (window.DeviceMotionEvent) window.addEventListener('devicemotion', handleMotion);
    return () => { if (window.DeviceMotionEvent) window.removeEventListener('devicemotion', handleMotion); };
  }, [showFortuneModal, isStickFalling, hasImage]);

  const handleLightIncense = () => {
    if (isIncenseLit) return;
    setIsIncenseLit(true);
    audioService.playChanting();
  };

  const handleSelectOffering = (type: string) => {
    setCurrentOffering(type as OfferingType);
    setIsOfferingMenuOpen(false);
    audioService.playClick('artmulet');
  };

  const handleShakeSiamsi = async (isSensor = false) => {
    if (isShakingRef.current || isStickFalling || showFortuneModal) return;

    if (!isSensor && typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        try {
            const state = await (DeviceMotionEvent as any).requestPermission();
            if (state !== 'granted') {
                alert("Please grant sensor permissions to use the Shake feature.");
                return;
            }
        } catch (e) { console.error(e); }
    }
    
    setIsShaking(true);
    isShakingRef.current = true;
    setFortune(null);
    audioService.playSiamsiShake();

    const rand = Math.floor(Math.random() * 28) + 1;
    setStickNumber(language === 'th' ? toThaiNum(rand) : rand.toString());

    setTimeout(async () => {
      setIsShaking(false);
      isShakingRef.current = false;
      setIsStickFalling(true);
      
      const prompt = image ? image.prompt : "General sacred deity";
      try {
        const result = await getDailyFortune(prompt, language);
        setFortune(result);
      } catch (e) {
        console.error(e);
        setFortune({
            verse: language === 'th' ? "จิตตั้งมั่น อธิษฐาน ด้วยศรัทธา\nพรเมตตา มหาเทพ ประทานให้" : "Keep your faith strong and true,\nBlessings shall come to you.",
            prediction: language === 'th' ? "สิ่งที่หวังไว้กำลังจะสำเร็จผล ขอให้หมั่นทำความดี" : "What you hope for is coming. Keep doing good.",
            lucky_numbers: "09, 99"
        });
      }

      setTimeout(() => {
        setIsStickFalling(false);
        setShowFortuneModal(true);
        audioService.playSuccess('artmulet');
      }, 1500);

    }, 2500);
  };

  const handleShareFortune = async () => {
    if (!fortuneCardRef.current) return;
    setIsSharingFortune(true);

    try {
        // @ts-ignore
        if (typeof window.html2canvas === 'undefined') throw new Error("html2canvas not loaded");

        // @ts-ignore
        const canvas = await window.html2canvas(fortuneCardRef.current, {
            scale: 3, 
            useCORS: false, 
            backgroundColor: null,
            logging: false,
            allowTaint: true,
        });

        canvas.toBlob(async (blob: Blob | null) => {
            if (!blob) throw new Error("Canvas to Blob failed");
            const file = new File([blob], "fortune-slip.png", { type: "image/png" });
            if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Siamsi Fortune Slip',
                        text: 'My fortune from Luckystation',
                    });
                } catch (shareError) { console.log("Share cancelled", shareError); }
            } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = "fortune-slip.png";
                link.click();
            }
            setIsSharingFortune(false);
        }, 'image/png');

    } catch (err) {
        console.error("Capture failed:", err);
        alert("Could not save image (Browser limitation). Please take a screenshot instead.");
        setIsSharingFortune(false);
    }
  };

  const renderOfferingContent = (type: OfferingType) => {
    switch (type) {
        case 'garland':
            return (
                <div className="relative w-4 h-6 -mt-1 animate-[pulse_3s_infinite] flex flex-col items-center justify-center">
                    <div className="w-3 h-3 rounded-full border-[2px] border-slate-100 shadow-[0_0_5px_rgba(255,255,255,0.5)] bg-transparent relative z-10"></div>
                    <div className="absolute top-0.5 -left-1 text-[6px] drop-shadow-sm rotate-[-45deg]">🌸</div>
                    <div className="absolute top-0.5 -right-1 text-[6px] drop-shadow-sm rotate-[45deg]">🌸</div>
                    <div className="absolute top-2.5 flex flex-col items-center z-0">
                         <div className="w-0.5 h-1 bg-yellow-400"></div>
                         <div className="text-[6px] drop-shadow-md -mt-0.5">🌼</div>
                         <div className="text-[4px] drop-shadow-md -mt-0.5 text-red-500">🌹</div>
                    </div>
                </div>
            );
        case 'lotus':
             return (
                <div className="relative w-8 h-5 -mt-2 flex justify-center items-end">
                    <span className="text-[10px] drop-shadow-md -rotate-12 -mr-1 z-0 hover:scale-110 transition-transform">🪷</span>
                    <span className="text-sm drop-shadow-xl z-10 -mb-0.5 hover:scale-110 transition-transform">🪷</span>
                    <span className="text-[10px] drop-shadow-md rotate-12 -ml-1 z-0 hover:scale-110 transition-transform">🪷</span>
                </div>
             );
        case 'fruit':
            return (
                <div className="relative w-6 h-5 -mt-2 flex flex-col items-center justify-end">
                    <span className="text-[10px] drop-shadow-md -mb-1 z-20">🍊</span>
                    <div className="flex gap-[-2px] z-10">
                        <span className="text-xs drop-shadow-md -mr-0.5">🍊</span>
                        <span className="text-xs drop-shadow-md -ml-0.5">🍊</span>
                    </div>
                    <span className="absolute bottom-0 right-[-1px] text-[10px] drop-shadow-md z-0 -rotate-12">🍌</span>
                </div>
            );
        case 'jewelry':
            return (
                <div className="relative w-6 h-5 -mt-2 flex justify-center items-center">
                     <span className="text-lg drop-shadow-[0_0_5px_rgba(255,215,0,0.6)] animate-pulse">📿</span>
                     <span className="absolute bottom-0 right-0 text-[10px] drop-shadow-md">💎</span>
                     <span className="absolute top-0 left-0 text-[10px] drop-shadow-md">💍</span>
                </div>
            );
        default: return null;
    }
  }

  return (
    <div className={`
        relative w-full h-full min-h-[60vh] flex flex-col items-center justify-end overflow-hidden rounded-[32px] border border-amber-900/30 bg-[#1a0f0f] shadow-2xl animate-fadeIn
        ${isShaking ? 'animate-[shake_0.1s_ease-in-out_infinite]' : ''}
    `}>
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          25% { transform: translate(-2px, -2px) rotate(-1deg); }
          50% { transform: translate(-3px, 0px) rotate(1deg); }
          75% { transform: translate(3px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -1px) rotate(1deg); }
        }
        @keyframes stickDrop {
            0% { transform: translateY(-100px) rotate(-5deg); opacity: 0; }
            20% { opacity: 1; }
            60% { transform: translateY(0px) rotate(10deg); }
            80% { transform: translateY(-10px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-black via-[#2d1b15] to-[#462b22]"></div>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-amber-500/10 blur-[80px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full flex-1 flex items-center justify-center p-8 pb-32">
        {hasImage ? (
           <div className={`
              relative w-full max-w-sm aspect-[3/4] rounded-t-full rounded-b-lg overflow-hidden border-[6px] border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)] bg-black transition-transform duration-100
              ${isShaking ? 'scale-95' : 'scale-100'}
           `}>
              <img src={image!.url} alt="Deity" className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none"></div>
           </div>
        ) : (
           <div className="flex flex-col items-center gap-4 opacity-50">
              <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                 <span className="text-4xl">🙏</span>
              </div>
              <p className="text-sm text-gray-400">{t.no_deity}</p>
           </div>
        )}
      </div>

      {isStickFalling && (
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 z-40 animate-[stickDrop_1s_ease-out_forwards]">
              <div className="w-10 h-56 bg-gradient-to-b from-[#8B0000] to-[#500000] rounded-md border border-red-300/30 shadow-2xl flex items-end justify-center pb-6 relative transform rotate-6">
                  <span className="text-[#FFD700] font-bold text-2xl drop-shadow-md font-['Srisakdi']">{stickNumber}</span>
                  <div className="absolute top-2 w-full h-1 bg-red-900/30"></div>
              </div>
          </div>
      )}

      <div className="relative z-30 w-full bg-gradient-to-t from-black to-[#3e2723] pt-6 pb-6 px-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-amber-900/50">
         
         <div className="absolute -top-12 left-0 right-0 flex justify-between px-12">
            <div className="relative flex flex-col items-center">
               <div className="w-2 h-12 bg-yellow-100 rounded-sm shadow-lg"></div>
               <div className="absolute -top-4 w-4 h-6 bg-orange-400 rounded-full blur-[2px] animate-pulse"></div>
               <div className="absolute -top-4 w-2 h-4 bg-yellow-200 rounded-full blur-[1px] animate-bounce"></div>
            </div>
            <div className="relative flex flex-col items-center">
               <div className="w-2 h-12 bg-yellow-100 rounded-sm shadow-lg"></div>
               <div className="absolute -top-4 w-4 h-6 bg-orange-400 rounded-full blur-[2px] animate-pulse"></div>
               <div className="absolute -top-4 w-2 h-4 bg-yellow-200 rounded-full blur-[1px] animate-bounce"></div>
            </div>
         </div>

         <div className={`absolute -top-20 left-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none ${isShaking ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}>
            <div className="w-28 h-36 bg-gradient-to-r from-red-900 to-red-800 rounded-t-xl border-4 border-red-950 shadow-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute bottom-0 w-3 h-28 bg-[#D2B48C] rotate-12 left-6 border-r border-black/10"></div>
                <div className="absolute bottom-0 w-3 h-28 bg-[#D2B48C] -rotate-6 right-8 border-r border-black/10"></div>
                <div className="absolute bottom-0 w-3 h-32 bg-[#D2B48C] rotate-0 left-12 animate-bounce border-r border-black/10"></div>
                <div className="absolute bottom-0 w-3 h-26 bg-[#D2B48C] -rotate-12 left-4 border-r border-black/10"></div>
                <span className="absolute top-2 right-2 text-xl animate-ping">🔊</span>
            </div>
         </div>

         {currentOffering && (
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-20 animate-slideUp transition-all duration-500">
               <div className="relative flex flex-col items-center group cursor-pointer" onClick={() => setCurrentOffering(null)}>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 drop-shadow-2xl filter transition-transform duration-300 group-hover:-translate-y-1 flex justify-center">
                      {renderOfferingContent(currentOffering)}
                  </div>
                  <div className="flex flex-col items-center relative drop-shadow-2xl">
                      <div className="w-12 h-4 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-yellow-300 via-amber-500 to-yellow-300 rounded-b-full border-t-2 border-yellow-200 relative overflow-hidden shadow-inner">
                           <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
                           <div className="absolute top-0 left-1/4 w-1/2 h-full bg-white/30 blur-md skew-x-12"></div>
                      </div>
                      <div className="w-1.5 h-2.5 bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 -mt-0.5 z-0 relative">
                           <div className="w-full h-px bg-black/20 mt-0.5"></div>
                           <div className="w-full h-px bg-black/20 mt-0.5"></div>
                      </div>
                      <div className="w-8 h-2.5 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-amber-600 via-yellow-400 to-amber-600 rounded-t-md -mt-0.5 shadow-xl flex flex-col items-center">
                           <div className="w-10 h-1 bg-amber-800 rounded-full mt-auto opacity-50 blur-sm"></div>
                      </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-amber-200 transition-opacity whitespace-nowrap bg-black/80 px-2 py-0.5 rounded-full border border-amber-500/30 pointer-events-none">
                    Tap to collect
                  </div>
               </div>
            </div>
         )}

         <div className={`absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center transition-opacity duration-300 z-30 ${isShaking ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {isIncenseLit && (
              <div className="relative">
                 <div className="absolute -top-20 left-0 w-1 h-20 bg-gray-400/30 blur-sm rounded-full animate-[pulse_3s_infinite] origin-bottom transform skew-x-6"></div>
                 <div className="absolute -top-24 left-1 w-1 h-24 bg-gray-400/20 blur-sm rounded-full animate-[pulse_4s_infinite] delay-75 origin-bottom transform -skew-x-3"></div>
                 <div className="flex gap-1">
                    <div className="w-0.5 h-8 bg-gray-400 relative"><div className="absolute top-0 left-0 w-1 h-1 bg-red-500 rounded-full blur-[1px]"></div></div>
                    <div className="w-0.5 h-8 bg-gray-400 relative"><div className="absolute top-0 left-0 w-1 h-1 bg-red-500 rounded-full blur-[1px]"></div></div>
                    <div className="w-0.5 h-8 bg-gray-400 relative"><div className="absolute top-0 left-0 w-1 h-1 bg-red-500 rounded-full blur-[1px]"></div></div>
                 </div>
              </div>
            )}
            <div className="w-16 h-10 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-xl border-t-4 border-amber-500/50 shadow-lg"></div>
         </div>

         <div className="grid grid-cols-3 gap-3 mt-4 relative z-50">
             <button 
                onClick={handleLightIncense}
                disabled={isIncenseLit}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border ${isIncenseLit ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'} transition-all`}
             >
                <span className="text-2xl">🕯️</span>
                <span className="text-[10px] text-gray-300">{t.light_incense}</span>
             </button>

             <button 
                onClick={() => handleShakeSiamsi(false)}
                disabled={!hasImage || isShaking || isStickFalling}
                className={`
                  relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all active:scale-95
                  ${isShaking ? 'border-red-500 bg-red-900/50 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'border-red-500/30 bg-red-900/20 hover:bg-red-900/40'}
                `}
             >
                <span className={`text-2xl ${isShaking ? 'animate-[spin_0.5s_linear_infinite]' : ''}`}>🎋</span>
                <span className="text-[10px] text-red-200 font-bold">
                  {isShaking ? t.shaking : t.shake_siamsi}
                </span>
                {!isShaking && hasImage && (
                    <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                )}
             </button>

             <div className="relative">
                 {isOfferingMenuOpen && (
                     <div className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-2 max-w-[80vw] overflow-x-auto shadow-2xl z-50 animate-slideUp flex gap-2">
                         {OFFERINGS.map((off) => (
                             <button
                                key={off.id}
                                onClick={() => handleSelectOffering(off.id)}
                                className="flex flex-col items-center p-3 rounded-xl hover:bg-white/10 transition-colors gap-1 min-w-[70px] border border-transparent hover:border-amber-500/30 shrink-0"
                             >
                                <span className="text-3xl">{off.icon}</span>
                                <span className="text-[10px] text-amber-200 font-medium whitespace-nowrap">
                                  {language === 'th' ? off.label_th : off.label}
                                </span>
                             </button>
                         ))}
                     </div>
                 )}
                 <button 
                    onClick={() => setIsOfferingMenuOpen(!isOfferingMenuOpen)}
                    className={`w-full h-full flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border ${currentOffering ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'} transition-all`}
                 >
                    <span className="text-2xl">{currentOffering ? OFFERINGS.find(o => o.id === currentOffering)?.icon : '🌺'}</span>
                    <span className="text-[10px] text-gray-300">{currentOffering ? t.change_offering : t.offer_btn}</span>
                 </button>
             </div>
         </div>
         
         <div className="text-center mt-3 opacity-50 text-[10px] text-gray-400">
            {t.shake_hint}
         </div>
      </div>

      {showFortuneModal && fortune && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
            <div className="relative w-full max-w-sm my-auto">
                
                <div 
                    ref={fortuneCardRef} 
                    className="relative bg-[#2a1b15] p-6 rounded-2xl shadow-2xl border border-amber-900/50 flex flex-col items-center"
                >
                   <div 
                        className="w-full bg-[#fffdf0] text-black rounded-[2px] p-6 shadow-inner relative overflow-hidden" 
                        style={{ 
                           backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.1\'/%3E%3C/svg%3E"), radial-gradient(#d4c5a3 1px, transparent 1px)', 
                           backgroundBlendMode: 'multiply',
                           backgroundSize: 'auto, 20px 20px',
                           boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div className="absolute inset-2 border-2 border-red-900/20 pointer-events-none"></div>

                        <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-red-900 opacity-30"></div>
                        <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-red-900 opacity-30"></div>
                        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-red-900 opacity-30"></div>
                        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-red-900 opacity-30"></div>

                        <div className="absolute top-10 right-4 w-16 h-16 border-2 border-red-800/20 rounded-full flex items-center justify-center opacity-20 rotate-[-12deg] pointer-events-none">
                            <div className="text-[8px] text-red-900 font-bold text-center leading-tight uppercase">
                                Luckystation<br/>Official
                            </div>
                        </div>

                        <div className="text-center space-y-4 relative z-10">
                            <div className="flex flex-col items-center pt-2">
                                <div className="w-12 h-12 rounded-full border-2 border-red-900/60 flex items-center justify-center mb-2 bg-[#fffdf0] shadow-md">
                                     <span className="text-2xl text-red-900 font-bold font-['Srisakdi']">{stickNumber}</span>
                                </div>
                                <h3 className="text-red-900 font-bold text-lg tracking-widest font-['Pridi']">SIAMSI</h3>
                            </div>
                            
                            <div className="py-2 px-1 relative">
                                <span className="text-4xl text-red-900 absolute -top-3 left-0 opacity-10 font-serif">❝</span>
                                <p className="text-lg text-gray-900 leading-relaxed font-['Maitree'] font-bold drop-shadow-sm whitespace-pre-line">
                                   {fortune.verse}
                                </p>
                                <span className="text-4xl text-red-900 absolute -bottom-4 right-0 opacity-10 font-serif">❞</span>
                            </div>
                            
                            <div className="bg-red-900/5 p-3 rounded-lg border border-red-900/10">
                                <p className="text-xs font-medium text-gray-800 leading-relaxed font-['Pridi']">
                                    {fortune.prediction}
                                </p>
                            </div>
                            
                            <div className="pb-2">
                               <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-['Pridi']">Lucky Numbers</p>
                               <div className="flex justify-center gap-3">
                                   {fortune.lucky_numbers.split(',').map((num, i) => (
                                       <span key={i} className="text-xl font-black text-red-800 font-['Srisakdi'] px-2 py-1 bg-white/50 rounded border border-red-100">
                                            {num.trim()}
                                       </span>
                                   ))}
                               </div>
                            </div>

                             <div className="pt-2 border-t border-red-900/10 mt-1">
                                <p className="text-[10px] text-red-900/50 font-['Pridi'] uppercase tracking-wider">
                                    Luckystation
                                </p>
                             </div>
                        </div>
                   </div>
                </div>

                <button 
                    onClick={() => setShowFortuneModal(false)} 
                    className="absolute -top-3 -right-2 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-50 backdrop-blur-md"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mt-6 space-y-3">
                    <button 
                        onClick={handleShareFortune}
                        disabled={isSharingFortune}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-2xl font-bold text-md shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 font-['Pridi'] active:scale-95"
                    >
                        {isSharingFortune ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                            <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>{t.save_fortune}</span>
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-500">
                        {t.share_social}
                    </p>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default AltarView;
