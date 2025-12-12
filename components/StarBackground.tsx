import React from 'react';

const StarBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#0b0b0b,#0c223d,#000)]">
      {/* Stars Layer */}
      <div 
        className="absolute inset-0 opacity-20 animate-twinkle pointer-events-none"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}
      ></div>
      
      {/* Beam Layer */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(0,188,212,0.18),transparent_70%)] blur-[80px] animate-beam"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default StarBackground;
