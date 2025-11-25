
import React, { useState, useEffect } from 'react';
import { GeneratedImage, Language } from '../types';
import { APP_NAME, UI_STRINGS } from '../constants';

interface ResultViewProps {
  image: GeneratedImage;
  onClose: () => void;
  onDelete?: () => void; // Optional delete handler
  onRemix?: (prompt: string) => void; // New Remix handler
  language: Language;
}

const ResultView: React.FC<ResultViewProps> = ({ image, onClose, onDelete, onRemix, language }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [showPromptInfo, setShowPromptInfo] = useState(false);

  const t = UI_STRINGS[language];

  useEffect(() => {
    if (!image.url) return;
    const img = new Image();
    if (!image.url.startsWith('data:')) img.crossOrigin = "anonymous";
    img.src = image.url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // --- Background Gradients ---
      // Only bottom gradient for the watermark visibility
      const bottomGrad = ctx.createLinearGradient(0, canvas.height * 0.85, 0, canvas.height);
      bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
      bottomGrad.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, canvas.height * 0.85, canvas.width, canvas.height * 0.15);

      // Branding (Watermark Only - No Blessing Text)
      const brandFontSize = Math.floor(canvas.width * 0.025); 
      ctx.font = `300 ${brandFontSize}px Prompt, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.letterSpacing = '2px';
      
      // Add subtle shadow for better readability
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(APP_NAME.toUpperCase(), canvas.width / 2, canvas.height * 0.96);

      setFinalImageUrl(canvas.toDataURL('image/png'));
      setIsLoaded(true);
    };
  }, [image, language]);

  const displayUrl = finalImageUrl || image.url;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = displayUrl;
    link.download = `${APP_NAME.toLowerCase().replace(/\s+/g, '-')}-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert("Sharing not supported on this browser/device");
      return;
    }
    setIsSharing(true);
    try {
      if (displayUrl.startsWith('data:')) {
        const byteString = atob(displayUrl.split(',')[1]);
        const mimeString = displayUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], {type: mimeString});
        const file = new File([blob], `${APP_NAME}-image-${image.id}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${APP_NAME} Image`,
            text: image.blessing || `${APP_NAME} - Sacred Image Generator`,
          });
        }
      } 
    } catch (error: any) {
      console.error("Error sharing:", error);
      if (error.name !== 'AbortError') alert("Unable to share image. Please try downloading instead.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
      if (confirm(t.confirm_delete || "Delete this sacred image?")) {
          if (onDelete) onDelete();
      }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col animate-fadeIn">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between p-6">
         <button 
           onClick={() => setShowPromptInfo(true)}
           className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
           title="Show Info"
         >
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
         </button>
         <button 
           onClick={onClose}
           className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
         >
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className={`
          relative max-w-2xl w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40
          transition-all duration-700 transform
          ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}>
          <img src={displayUrl} alt={image.prompt} className="w-full h-full object-contain bg-black"/>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
        </div>
      </div>

      <div className="pb-10 pt-4 px-6 flex flex-col items-center gap-4">
        {/* Main Actions Row */}
        <div className="flex gap-3 w-full max-w-md">
          <button 
            onClick={handleDownload}
            disabled={!isLoaded}
            className="flex-[2] bg-white text-black font-semibold py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t.save_image}
          </button>
          
          <button 
            onClick={handleShare}
            disabled={isSharing || !isLoaded}
            className="flex-1 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSharing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>

          {onDelete && (
             <button 
                onClick={handleDelete}
                className="flex-1 bg-red-900/40 text-red-200 border border-red-500/30 rounded-2xl flex items-center justify-center hover:bg-red-900/60 active:scale-95 transition-all"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
             </button>
          )}
        </div>
        
        {image.blessing && (
          <p 
            className="text-xl font-bold text-center tracking-wide drop-shadow-lg max-w-md"
            style={{ 
              color: '#FFD700', 
              fontFamily: 
                (language === 'en' && ['sacred-deity', 'luckystation', 'naga-king', 'artmulet', 'dark-sorcery', 'thai-literature', 'lucky-charm', 'mystic-forest'].includes(image.styleId || '')) ? 'Cinzel, serif' :
                (language !== 'en' && ['sacred-deity', 'luckystation', 'naga-king', 'artmulet', 'dark-sorcery', 'thai-literature', 'lucky-charm', 'mystic-forest'].includes(image.styleId || '')) ? 'Maitree, serif' :
                image.styleId === 'chibi-pastel' ? 'Mali, cursive' : 
                'Prompt, sans-serif'
            }}
          >
            "{image.blessing}"
          </p>
        )}
      </div>

      {/* Info Overlay (Prompt Details) */}
      {showPromptInfo && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl p-6 flex items-center justify-center animate-fadeIn">
              <div className="w-full max-w-md bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center">
                      <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm">{t.prompt_details}</h3>
                      <button onClick={() => setShowPromptInfo(false)} className="text-gray-400 hover:text-white">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                      </button>
                  </div>
                  <div className="bg-black/50 p-4 rounded-xl max-h-[60vh] overflow-y-auto border border-white/5">
                      <p className="text-gray-300 text-sm font-mono leading-relaxed">
                          {image.prompt}
                      </p>
                  </div>
                  
                  <div className="flex gap-3">
                      <button 
                        onClick={() => {
                            navigator.clipboard.writeText(image.prompt);
                            setShowPromptInfo(false);
                        }}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
                      >
                          {t.copy_btn}
                      </button>
                      
                      {onRemix && (
                        <button 
                          onClick={() => onRemix(image.prompt)}
                          className="flex-[2] py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-bold transition-all shadow-lg active:scale-95"
                        >
                            {t.remix_btn}
                        </button>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ResultView;
