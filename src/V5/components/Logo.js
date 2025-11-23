import React from 'react';

const Logo = ({ className = "w-10 h-10" }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="chipGradient" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#2dd4bf" /> {/* teal-400 */}
                    <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Outer Circuit Traces */}
            <path
                d="M10 30 L10 10 L30 10 M70 10 L90 10 L90 30 M90 70 L90 90 L70 90 M30 90 L10 90 L10 70"
                stroke="#94a3b8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
            />

            {/* Connecting Lines */}
            <path d="M50 10 L50 20" stroke="#2dd4bf" strokeWidth="3" />
            <path d="M50 90 L50 80" stroke="#2dd4bf" strokeWidth="3" />
            <path d="M10 50 L20 50" stroke="#2dd4bf" strokeWidth="3" />
            <path d="M90 50 L80 50" stroke="#2dd4bf" strokeWidth="3" />

            {/* Main Chip Body */}
            <rect
                x="20"
                y="20"
                width="60"
                height="60"
                rx="10"
                fill="#1e293b" // slate-800
                stroke="url(#chipGradient)"
                strokeWidth="3"
            />

            {/* Inner VRAM Modules */}
            <rect x="28" y="28" width="18" height="18" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <rect x="54" y="28" width="18" height="18" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <rect x="28" y="54" width="18" height="18" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <rect x="54" y="54" width="18" height="18" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />

            {/* Central Core / V Shape */}
            <path
                d="M40 45 L50 65 L60 45"
                stroke="url(#chipGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
            />

            {/* Data Dots */}
            <circle cx="50" cy="37" r="2" fill="#2dd4bf" className="animate-pulse" />
            <circle cx="37" cy="50" r="2" fill="#3b82f6" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            <circle cx="63" cy="50" r="2" fill="#3b82f6" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        </svg>
    );
};

export default Logo;
