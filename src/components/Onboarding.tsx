import React, { useState, useEffect, ReactNode } from 'react';
import { X, Calculator, BarChart2, BookOpen, GitCompare, ArrowRight } from 'lucide-react';

interface Step {
    title: string;
    description: string;
    icon: ReactNode;
}

const Onboarding: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [step, setStep] = useState<number>(0);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('vivi_onboarding_seen');
        if (!hasSeenOnboarding) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('vivi_onboarding_seen', 'true');
    };

    const steps: Step[] = [
        {
            title: "Welcome to ViVi-Buddy V5.2",
            description: "Your ultimate companion for LLM hardware planning. Let's take a quick tour of what's new.",
            icon: <div className="text-4xl">👋</div>
        },
        {
            title: "Calculator",
            description: "Estimate memory usage for different models and hardware configurations. Now with auto-hardware detection!",
            icon: <Calculator size={48} className="text-blue-400" />
        },
        {
            title: "Benchmarks",
            description: "See estimated inference speeds (tokens/sec) based on real-world data and theoretical bandwidth.",
            icon: <BarChart2 size={48} className="text-purple-400" />
        },
        {
            title: "Learn",
            description: "New to LLMs? Master the basics of VRAM, quantization, and offloading in our interactive guide.",
            icon: <BookOpen size={48} className="text-green-400" />
        },
        {
            title: "Compare",
            description: "Side-by-side hardware comparison to help you make the best buying decision.",
            icon: <GitCompare size={48} className="text-orange-400" />
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                    <div className="h-20 flex items-center justify-center mb-6">
                        {steps[step].icon}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">
                        {steps[step].title}
                    </h2>

                    <p className="text-slate-300 mb-8 leading-relaxed">
                        {steps[step].description}
                    </p>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mb-8">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-blue-500 w-6' : 'bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleNext}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {step === steps.length - 1 ? 'Get Started' : 'Next'}
                        {step < steps.length - 1 && <ArrowRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
