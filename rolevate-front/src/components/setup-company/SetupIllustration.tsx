import React from 'react';

export default function SetupIllustration() {
  return (
    <div className="hidden lg:flex items-center justify-center lg:col-span-4 ">
      <div className="relative w-80 h-64 lg:w-[28rem] lg:h-[20rem] group">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#13ead9]/10 via-white/20 to-[#0891b2]/10 rounded-sm shadow-xl backdrop-blur-sm border border-white/30 group-hover:shadow-2xl"></div>
        <div className="absolute inset-3 rounded-sm overflow-hidden shadow-inner ring-1 ring-white/20">
          <img
            src="/images/hero.png"
            alt="Setup Illustration"
            className="object-cover rounded-sm group-hover:scale-105 transition-transform duration-700"
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent rounded-sm"></div>
        </div>
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full shadow-xl animate-pulse flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-[#0891b2] to-[#13ead9] rounded-full shadow-xl animate-pulse delay-1000 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}


