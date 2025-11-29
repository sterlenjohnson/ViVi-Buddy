import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calculator, BarChart3, BookOpen, GitCompare, HardDrive, Menu, X, LucideIcon } from 'lucide-react';

import Onboarding from './Onboarding';

interface SharedLayoutProps {
    children: ReactNode;
}

interface NavItem {
    path: string;
    label: string;
    icon: LucideIcon;
}

const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const navItems: NavItem[] = [
        { path: '/hardware', label: 'Hardware', icon: HardDrive },
        { path: '/', label: 'Calculator', icon: Calculator },
        { path: '/benchmarks', label: 'Benchmarks', icon: BarChart3 },
        { path: '/compare', label: 'Compare', icon: GitCompare },
        { path: '/learn', label: 'Learn', icon: BookOpen },
    ];

    const isActive = (path: string): boolean => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
            {/* Circuit Board Background */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(45, 212, 191, 0.15) 1px, transparent 0)`,
                backgroundSize: '40px 40px',
            }} />
            <div className="absolute inset-0 z-0 pointer-events-none">
                <svg className="absolute w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M10 10 L90 10 M10 50 L90 50 M50 10 L50 90" stroke="#2dd4bf" strokeWidth="0.5" fill="none" />
                            <circle cx="10" cy="10" r="2" fill="#2dd4bf" />
                            <circle cx="90" cy="50" r="2" fill="#3b82f6" />
                            <circle cx="50" cy="90" r="2" fill="#2dd4bf" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Onboarding />
                {/* Header */}
                <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-white tracking-tighter">
                                    ViVi<span className="text-blue-500">Buddy</span>
                                </div>
                                <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded font-medium">
                                    v5.2
                                </span>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex gap-2">
                                {navItems.map(({ path, label, icon: Icon }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive(path)
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="font-medium">{label}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Mobile Navigation (Hamburger Menu) */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="text-white focus:outline-none"
                                >
                                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <nav className="md:hidden bg-slate-800">
                            <div className="container mx-auto px-4 pb-4">
                                {navItems.map(({ path, label, icon: Icon }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${isActive(path)
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="font-medium">{label}</span>
                                    </Link>
                                ))}
                            </div>
                        </nav>
                    )}
                </header>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-slate-800 border-t border-slate-700 py-8 mt-8">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Column 1: About */}
                            <div className="text-center md:text-left">
                                <p className="text-slate-300 font-bold mb-2">ViVi Buddy</p>
                                <p className="text-xs text-slate-500 mb-2">LLM Hardware Calculator & Benchmarking Tool</p>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Calculations based on <a href="https://github.com/ggerganov/llama.cpp" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">llama.cpp</a> architecture and <a href="https://huggingface.co/docs/transformers/perf_infer_gpu_one" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Transformer</a> memory models.
                                </p>
                            </div>

                            {/* Column 2: Community & Tools */}
                            <div className="text-center md:text-left">
                                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Community & Tools</p>
                                <div className="flex flex-col gap-2 text-xs text-slate-500">
                                    <a href="https://github.com/ggerganov/llama.cpp" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">llama.cpp GitHub</a>
                                    <a href="https://huggingface.co/docs/transformers/perf_infer_gpu_one" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">Hugging Face Performance Docs</a>
                                    <a href="https://timdettmers.com/2023/01/30/which-gpu-for-deep-learning/" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">Tim Dettmers' Deep Learning Blog</a>
                                    <a href="https://www.reddit.com/r/LocalLLaMA/" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">r/LocalLLaMA Community</a>
                                </div>
                            </div>

                            {/* Column 3: Research Papers */}
                            <div className="text-center md:text-left">
                                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Research Papers</p>
                                <div className="flex flex-col gap-2 text-xs text-slate-500">
                                    <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors flex items-center gap-2 justify-center md:justify-start">
                                        <span>Attention Is All You Need</span>
                                        <span className="text-[10px] bg-slate-700 px-1 rounded text-slate-400">2017</span>
                                    </a>
                                    <a href="https://arxiv.org/abs/2302.13971" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors flex items-center gap-2 justify-center md:justify-start">
                                        <span>LLaMA: Open Foundation Models</span>
                                        <span className="text-[10px] bg-slate-700 px-1 rounded text-slate-400">2023</span>
                                    </a>
                                    <a href="https://arxiv.org/abs/2205.14135" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors flex items-center gap-2 justify-center md:justify-start">
                                        <span>FlashAttention: Fast & Memory-Efficient</span>
                                        <span className="text-[10px] bg-slate-700 px-1 rounded text-slate-400">2022</span>
                                    </a>
                                    <a href="https://arxiv.org/abs/2305.14314" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors flex items-center gap-2 justify-center md:justify-start">
                                        <span>QLoRA: Efficient Finetuning</span>
                                        <span className="text-[10px] bg-slate-700 px-1 rounded text-slate-400">2023</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-700/50 text-center text-[10px] text-slate-600">
                            <p>© 2025 ViVi Buddy. Open Source Educational Tool.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default SharedLayout;
