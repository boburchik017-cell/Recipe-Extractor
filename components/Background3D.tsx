
import React from 'react';

const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ perspective: '1200px' }}>
      <style>{`
        .cooking-item-3d {
          position: absolute;
          transform-style: preserve-3d;
          will-change: transform;
        }

        /* --- 3D CHEF HAT (Top Right - Emerald) --- */
        .chef-hat-3d {
          top: 5%;
          right: 8%;
          width: 120px;
          height: 120px;
          animation: float-rotate-hat 20s infinite ease-in-out;
        }

        .hat-band {
          position: absolute;
          width: 80px;
          height: 30px;
          background: rgba(20, 184, 166, 0.2);
          border: 1px solid rgba(20, 184, 166, 0.4);
          transform: translateZ(20px);
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }

        .hat-puff {
          position: absolute;
          width: 100px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(20, 184, 166, 0.2);
          border-radius: 50% 50% 10% 10%;
          transform: translateY(-40px) translateZ(10px);
          backdrop-filter: blur(8px);
        }

        /* --- 3D SPATULA (Bottom Left - Sapphire) --- */
        .spatula-3d {
          bottom: 15%;
          left: 10%;
          width: 150px;
          height: 40px;
          animation: rotate-spatula 25s infinite linear;
        }

        .spatula-handle {
          position: absolute;
          width: 100px;
          height: 8px;
          background: rgba(59, 130, 246, 0.3);
          border: 1px solid rgba(59, 130, 246, 0.5);
          transform: rotateY(90deg);
        }

        .spatula-head {
          position: absolute;
          width: 50px;
          height: 35px;
          left: 100px;
          top: -12.5px;
          background: rgba(30, 64, 175, 0.2);
          border: 2px solid rgba(59, 130, 246, 0.4);
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }

        /* --- 3D WHISK (Mid Right - Cyan) --- */
        .whisk-3d {
          top: 40%;
          right: 5%;
          width: 60px;
          height: 140px;
          animation: rotate-whisk 15s infinite linear;
        }

        .whisk-wire {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1.5px solid rgba(45, 212, 191, 0.4);
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        }

        .wire-1 { transform: rotateY(0deg); }
        .wire-2 { transform: rotateY(45deg); }
        .wire-3 { transform: rotateY(90deg); }
        .wire-4 { transform: rotateY(135deg); }

        .whisk-handle {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 50px;
          background: rgba(45, 212, 191, 0.3);
          border-radius: 4px;
        }

        /* --- ANIMATIONS --- */
        @keyframes float-rotate-hat {
          0% { transform: translateY(0) rotateX(20deg) rotateY(0); }
          50% { transform: translateY(-30px) rotateX(40deg) rotateY(180deg); }
          100% { transform: translateY(0) rotateX(20deg) rotateY(360deg); }
        }

        @keyframes rotate-spatula {
          from { transform: rotateX(0) rotateY(0) rotateZ(0); }
          to { transform: rotateX(360deg) rotateY(720deg) rotateZ(360deg); }
        }

        @keyframes rotate-whisk {
          from { transform: rotateY(0) rotateZ(-10deg); }
          to { transform: rotateY(360deg) rotateZ(10deg); }
        }

        html.dark .hat-puff { background: rgba(255, 255, 255, 0.03); }
        html.dark .spatula-head { background: rgba(30, 64, 175, 0.4); }
      `}</style>
      
      {/* 3D Chef Hat */}
      <div className="cooking-item-3d chef-hat-3d">
        <div className="hat-band"></div>
        <div className="hat-puff"></div>
      </div>
      
      {/* 3D Spatula */}
      <div className="cooking-item-3d spatula-3d">
        <div className="spatula-handle"></div>
        <div className="spatula-head"></div>
      </div>
      
      {/* 3D Whisk */}
      <div className="cooking-item-3d whisk-3d">
        <div className="whisk-wire wire-1"></div>
        <div className="whisk-wire wire-2"></div>
        <div className="whisk-wire wire-3"></div>
        <div className="whisk-wire wire-4"></div>
        <div className="whisk-handle"></div>
      </div>
    </div>
  );
};

export default Background3D;
