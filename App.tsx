
import React, { useState, useRef, useCallback } from 'react';
import { GeminiService } from './services/gemini';
import { generateLUT } from './services/lutGenerator';
import { ColorReference, ProcessingState, GradingStyle } from './types';
import { ReferenceCard } from './components/ReferenceCard';

const STYLES = [
  GradingStyle.TEAL_ORANGE,
  GradingStyle.GOLDEN_HOUR,
  GradingStyle.VINTAGE_KODAK,
  GradingStyle.NOIR,
  GradingStyle.BLEACH_BYPASS,
  GradingStyle.MODERN_COMMERCIAL
];

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [references, setReferences] = useState<ColorReference[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    message: '',
    progress: 0
  });

  const gemini = useRef(new GeminiService());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setOriginalImage(base64);
      setReferences([]);
      processAllStyles(base64);
    };
    reader.readAsDataURL(file);
  };

  const processStyle = async (base64: string, style: GradingStyle, id?: string) => {
    const styleId = id || Math.random().toString(36).substr(2, 9);
    
    setLoadingStates(prev => ({ ...prev, [styleId]: true }));
    
    try {
      const cleanBase64 = base64.split(',')[1];
      const stylizedUrl = await gemini.current.generateStyleReference(cleanBase64, style);
      const lutContent = await generateLUT(base64, stylizedUrl, style);

      const newRef: ColorReference = {
        id: styleId,
        styleName: style,
        imageUrl: stylizedUrl,
        description: `Cinematic reference for ${style}`,
        lutData: lutContent
      };

      setReferences(prev => {
        const index = prev.findIndex(r => r.id === styleId);
        if (index > -1) {
          const next = [...prev];
          next[index] = newRef;
          return next;
        }
        return [...prev, newRef];
      });
    } catch (err) {
      console.error(err);
      setProcessing({ status: 'error', message: 'Failed to generate reference for ' + style, progress: 0 });
    } finally {
      setLoadingStates(prev => ({ ...prev, [styleId]: false }));
    }
  };

  const processAllStyles = async (base64: string) => {
    setProcessing({ status: 'generating', message: 'Analyzing scene and generating references...', progress: 10 });
    
    // Process in batches or parallel
    const promises = STYLES.map(style => processStyle(base64, style));
    await Promise.all(promises);
    
    setProcessing({ status: 'completed', message: 'All references ready.', progress: 100 });
  };

  const handleRegenerate = (id: string) => {
    const ref = references.find(r => r.id === id);
    if (ref && originalImage) {
      processStyle(originalImage, ref.styleName as GradingStyle, id);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setReferences([]);
    setProcessing({ status: 'idle', message: '', progress: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">C</div>
            <h1 className="font-bold text-lg tracking-tight">AI Color Reference <span className="text-zinc-500 font-normal">v2.5</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            {originalImage && (
              <button 
                onClick={reset}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                New Project
              </button>
            )}
            <div className="hidden md:flex items-center space-x-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              <span>Rec.709</span>
              <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
              <span>Gamma 2.4</span>
              <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
              <span>65-Precision</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {!originalImage ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-2xl aspect-video border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center space-y-4 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-all group"
            >
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#52525b" viewBox="0 0 256 256">
                  <path d="M208,56H180.28L166.65,35.56A15.91,15.91,0,0,0,153.28,28H102.72A15.91,15.91,0,0,0,89.35,35.56L75.72,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.67-3.56L100.28,44h55.44l13.61,24.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"></path>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-zinc-300">Upload Video Still</p>
                <p className="text-sm text-zinc-500">JPG, PNG or TIFF from your timeline</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Source Display */}
            <section className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/3 space-y-4">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Input Analysis</h2>
                <div className="aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-black">
                  <img src={originalImage} alt="Source" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Status</span>
                    <span className="text-xs font-bold text-green-500 flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      {processing.message || 'Ready'}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-500" 
                      style={{ width: `${processing.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Generated Grading References</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => processAllStyles(originalImage)}
                      className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Regenerate All
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {STYLES.map((style, idx) => {
                    const ref = references.find(r => r.styleName === style);
                    return (
                      <ReferenceCard 
                        key={style}
                        reference={ref || { id: `loading-${idx}`, styleName: style, imageUrl: '', description: '' }}
                        onRegenerate={handleRegenerate}
                        isLoading={loadingStates[ref?.id || `loading-${idx}`] || (!ref && processing.status === 'generating')}
                      />
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-900 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest gap-4">
          <p>© 2024 AI Color Labs • Oklab Color-Matching Engine</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">LUT Precision Guide</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
