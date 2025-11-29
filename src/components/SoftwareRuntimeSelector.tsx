import React from 'react';
import { Info, Cpu, Zap } from 'lucide-react';
import { RuntimeSupport } from '../database/db_interface';

interface SoftwareRuntimeSelectorProps {
    runtimeSupport?: RuntimeSupport;
    isIntelMac?: boolean;
    isAppleSilicon?: boolean;
    selectedRuntime?: string;
    onRuntimeChange?: (runtime: string) => void;
}

export const SoftwareRuntimeSelector: React.FC<SoftwareRuntimeSelectorProps> = ({
    runtimeSupport,
    isIntelMac,
    isAppleSilicon,
    selectedRuntime = 'llamacpp',
    onRuntimeChange
}) => {
    // Determine runtime availability based on hardware
    const runtimes = [
        {
            id: 'llamacpp',
            name: 'llama.cpp',
            description: 'Official GGUF runner',
            gpuAcceleration: runtimeSupport?.llamaCpp?.gpuAcceleration ?? true,
            supported: true,
            icon: Zap
        },
        {
            id: 'ollama',
            name: 'Ollama',
            description: 'Easy-to-use model runtime',
            gpuAcceleration: runtimeSupport?.ollama?.gpuAcceleration ?? true,
            supported: true,
            icon: Cpu,
            constraint: isIntelMac && !runtimeSupport?.ollama?.gpuAcceleration ? 'CPU-only on Intel Mac' : undefined
        },
        {
            id: 'lmstudio',
            name: 'LM Studio',
            description: 'GUI-based model runner',
            gpuAcceleration: true,
            supported: runtimeSupport?.lmStudio?.supported ?? true,
            icon: Info,
            constraint: isIntelMac && runtimeSupport?.lmStudio?.supported === false
                ? (runtimeSupport?.lmStudio?.reason || 'Not supported on Intel Mac')
                : undefined
        }
    ];

    const handleSelect = (runtimeId: string) => {
        const runtime = runtimes.find(r => r.id === runtimeId);
        if (runtime?.supported && onRuntimeChange) {
            onRuntimeChange(runtimeId);
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-teal-400" />
                <h3 className="font-semibold text-white">Model Runtime</h3>
            </div>

            <div className="space-y-2">
                {runtimes.map((runtime) => {
                    const Icon = runtime.icon;
                    const isDisabled = !runtime.supported;
                    const isSelected = selectedRuntime === runtime.id;

                    return (
                        <button
                            key={runtime.id}
                            onClick={() => handleSelect(runtime.id)}
                            disabled={isDisabled}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${isDisabled
                                    ? 'border-gray-700 bg-gray-900/30 opacity-50 cursor-not-allowed'
                                    : isSelected
                                        ? 'border-teal-500 bg-teal-900/30'
                                        : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                                }`}
                            title={runtime.constraint || runtime.description}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={`w-5 h-5 mt-0.5 ${isDisabled ? 'text-gray-600' : 'text-teal-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`font-semibold ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
                                            {runtime.name}
                                        </div>
                                        {!runtime.gpuAcceleration && (
                                            <span className="text-xs px-2 py-0.5 bg-orange-600/30 border border-orange-500/50 rounded text-orange-300">
                                                CPU-only
                                            </span>
                                        )}
                                        {isDisabled && (
                                            <span className="text-xs px-2 py-0.5 bg-red-600/30 border border-red-500/50 rounded text-red-300">
                                                Unsupported
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-xs mt-1 ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {runtime.constraint || runtime.description}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {(isIntelMac || isAppleSilicon) && (
                <div className="mt-3 p-2 bg-blue-900/20 border border-blue-700/50 rounded text-xs text-blue-300">
                    <Info className="w-3 h-3 inline mr-1" />
                    {isIntelMac && 'Intel Mac: Limited GPU acceleration support'}
                    {isAppleSilicon && 'Apple Silicon: Full Metal GPU acceleration available'}
                </div>
            )}
        </div>
    );
};

export default SoftwareRuntimeSelector;
