
import React from 'react';
import { ColorReference } from '../types';
import { downloadFile } from '../services/lutGenerator';

interface Props {
  reference: ColorReference;
  onRegenerate: (id: string) => void;
  isLoading: boolean;
}

export const ReferenceCard: React.FC<Props> = ({ reference, onRegenerate, isLoading }) => {
  const handleDownloadLUT = () => {
    if (reference.lutData) {
      const safeName = reference.styleName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      downloadFile(reference.lutData, `LUT_${safeName}_65.cube`);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col group transition-all hover:border-blue-500/50">
      <div className="relative aspect-video bg-black overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-zinc-900">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-zinc-500 font-medium">Processing Grade...</p>
          </div>
        ) : (
          <>
            <img 
              src={reference.imageUrl} 
              alt={reference.styleName} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <button 
                onClick={() => onRegenerate(reference.id)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full transition-colors"
              >
                Regenerate
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">{reference.styleName}</h3>
        <p className="text-xs text-zinc-500 line-clamp-2 mb-4">
          Matched reference for Rec.709 workflows.
        </p>
        
        <div className="mt-auto">
          <button
            disabled={isLoading || !reference.lutData}
            onClick={handleDownloadLUT}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M208,80H176V48a16,16,0,0,0-16-16H96A16,16,0,0,0,80,48V80H48A16,16,0,0,0,32,96v96a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,48h64V80H96ZM208,192H48V96H80v32a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V96h32v96Zm-64-80H112V96h32Z"></path>
            </svg>
            <span>Download 3D LUT (.cube)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
