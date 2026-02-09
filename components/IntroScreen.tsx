
import React, { useEffect, useState } from 'react';
import { AnimatedLogoIcon } from './icons/AnimatedLogoIcon';

interface IntroScreenProps {
  onAnimationComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onAnimationComplete }) => {
  const [stage, setStage] = useState('start');

  useEffect(() => {
    // Total animation duration before fading out the screen
    const totalDuration = 4000; // 4 seconds
    const fadeOutStartTime = 3500; // Start fading out at 3.5 seconds

    const timeoutId = setTimeout(() => {
      setStage('fading-out');
    }, fadeOutStartTime);

    const completeTimeoutId = setTimeout(() => {
      onAnimationComplete();
    }, totalDuration);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(completeTimeoutId);
    };
  }, [onAnimationComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-500 ${stage === 'fading-out' ? 'opacity-0' : 'opacity-100'}`}
    >
      <AnimatedLogoIcon className="w-32 h-32" />
      <div className="mt-6 text-center overflow-hidden">
        <h1 className="text-3xl font-bold text-white" style={{ animation: 'fade-in-up 0.8s 1.8s ease-out forwards', opacity: 0 }}>
          <span className="font-light">Video Recipe</span>{' '}
          <span className="text-rose-400">Extractor</span>
        </h1>
      </div>
    </div>
  );
};

export default IntroScreen;
