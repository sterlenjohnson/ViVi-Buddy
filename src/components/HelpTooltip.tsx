import React from 'react';

interface HelpTooltipProps {
  text: string;
  children: React.ReactNode;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ text, children }) => {
  return (
    <span className="relative group cursor-help underline decoration-dotted flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-600 transition-colors" data-tip={text}>
      {children}
      {/* Tooltip styling */}
      <span className="absolute hidden group-hover:block w-64 bg-slate-800 text-slate-100 text-xs rounded p-2 left-1/2 transform -translate-x-1/2 translate-y-full top-full mt-2 whitespace-pre-wrap shadow-xl border border-slate-600 z-50">
        {text}
        {/* Arrow */}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></span>
      </span>
    </span>
  );
};

export default HelpTooltip;
