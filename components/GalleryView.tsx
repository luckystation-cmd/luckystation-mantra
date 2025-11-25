import React from 'react';
import { GeneratedImage, Language } from '../types';
import { UI_STRINGS, APP_NAME } from '../constants';

interface GalleryViewProps {
  images: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
  onDelete: (id: string) => void;
  language: Language;
}

const GalleryView: React.FC<GalleryViewProps> = ({ images, onSelect, onDelete, language }) => {
  const t = UI_STRINGS[language];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
      day: 'numeric', month: 'short', year: '2-digit'
    });
  };

  const handleShare = async (e: React.MouseEvent, img: GeneratedImage) => {
    e.stopPropagation();
    if (!navigator.share) {
      alert("Sharing is not supported on this device.");
      return;
    }
    
    try {
      if (img.url.startsWith('data:')) {
        const byteString = atob(img.url.split(',')[1]);
        const mimeString = img.url.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], {type: mimeString});
        const file = new File([blob], `${APP_NAME.replace(/\s+/g, '-')}-${img.id}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: APP_NAME,
            text: img.blessing || 'Sacred Image',
          });
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[60vh] overflow-hidden rounded-[32px] border-4 border-amber-700/50 shadow-2xl animate-slideUp">
        
      {/* Red Velvet Background (Radial Gradient) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900 via-red-950 to-black z-0"></div>
      
      {/* Pattern Overlay for Velvet Texture */}
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] z-0 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-0 pointer-events-none"></div>

      <div className="relative z-10 p-4 h-full flex flex-col">
        
        {/* Luxury Header */}
        <div className="flex flex-col items-center justify-center mb-6 pt-6 space-y-2">
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-400 to-amber-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center font-['Srisakdi'] tracking-wider">
                {language === 'th' ? 'ตู้พระมหาเศรษฐี' : 'Millionaire Cabinet'}
            </h3>
             <div className="flex items-center gap-2 opacity-80">
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-amber-500"></div>
                <div className="w-1 h-1 rotate-45 bg-amber-400"></div>
                <p className="text-[10px] text-amber-200 font-['Pridi'] uppercase tracking-widest">
                    {images.length} {language === 'th' ? 'องค์' : 'Items'}
                </p>
                <div className="w-1 h-1 rotate-45 bg-amber-400"></div>
                <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-amber-500"></div>
            </div>
        </div>

        {images.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center min-h-[300px] animate-fadeIn">
             <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-500/30 flex items-center justify-center relative bg-black/20">
                    <span className="text-4xl opacity-50 grayscale">📿</span>
                </div>
             </div>
             <div>
                <p className="text-amber-200/90 font-bold text-lg font-['Pridi']">{t.empty_gallery}</p>
                <p className="text-xs text-amber-500/60 mt-1">{t.empty_gallery_sub}</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-24 overflow-y-auto max-h-[65vh] no-scrollbar pr-1 content-start px-1">
            {images.map((img, index) => (
              <div 
                key={img.id}
                className="group relative aspect-[3/4] rounded-t-xl rounded-b-md overflow-hidden border-2 border-amber-400 bg-black/40 shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] hover:border-amber-300 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onSelect(img)}
              >
                
                {/* Image */}
                <img 
                  src={img.url} 
                  alt={img.prompt} 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  loading="lazy"
                />
                
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>

                {/* Bottom Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 pt-6 pb-2 px-2 z-20 flex flex-col items-center">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-1"></div>
                    <p className="text-[10px] text-amber-100 font-bold truncate font-['Pridi'] text-center w-full px-1 drop-shadow-sm">
                        {img.blessing || (language === 'th' ? 'วัตถุมงคล' : 'Sacred Item')}
                    </p>
                    <p className="text-[8px] text-amber-500/80 text-center font-['Pridi']">
                        {formatDate(img.timestamp)}
                    </p>
                </div>

                {/* Actions (Visible on hover or always visible on touch?) */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                    {/* Delete */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(t.confirm_delete || 'Delete this image?')) {
                                onDelete(img.id);
                            }
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-red-900 text-white/70 hover:text-red-200 rounded-full border border-white/10 hover:border-red-500 backdrop-blur-md transition-all transform hover:scale-110"
                        title={t.delete_card}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    {/* Share */}
                    <button
                        onClick={(e) => handleShare(e, img)}
                        className="w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-blue-900 text-white/70 hover:text-blue-200 rounded-full border border-white/10 hover:border-blue-500 backdrop-blur-md transition-all transform hover:scale-110"
                        title="Share"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                </div>
                
                {/* Ornaments (Corners) */}
                 <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl-sm pointer-events-none opacity-80"></div>
                 <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr-sm pointer-events-none opacity-80"></div>
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl-sm pointer-events-none opacity-80"></div>
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br-sm pointer-events-none opacity-80"></div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryView;