
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-24 h-24 mb-4">
        {/* Pan Handle */}
        <div className="absolute bottom-4 left-1/2 w-12 h-2 bg-gray-400 dark:bg-gray-600 rounded-full origin-left -rotate-12 animate-pan-swing"></div>
        
        {/* Pan Body */}
        <div className="absolute bottom-0 left-1/4 w-16 h-6 bg-gray-500 dark:bg-gray-400 rounded-b-2xl border-b-4 border-gray-600 dark:border-gray-500"></div>
        
        {/* Flipping Food */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-rose-500 rounded-lg shadow-md animate-food-flip"></div>
      </div>
      
      <style>{`
        @keyframes pan-swing {
          0%, 100% { transform: rotate(-12deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes food-flip {
          0% { transform: translate(-50%, 40px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translate(-50%, -20px) rotate(180deg); }
          80% { opacity: 1; }
          100% { transform: translate(-50%, 40px) rotate(360deg); opacity: 0; }
        }
        .animate-pan-swing {
          animation: pan-swing 1.2s ease-in-out infinite;
        }
        .animate-food-flip {
          animation: food-flip 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
