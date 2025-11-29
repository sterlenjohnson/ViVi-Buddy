import React from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
    text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
    return (
        <div className="relative group inline-block ml-1">
            <HelpCircle className="w-4 h-4 text-slate-400 hover:text-blue-400 cursor-help transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-xl border border-slate-700">
                    {text}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="border-4 border-transparent border-t-slate-900"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tooltip;
