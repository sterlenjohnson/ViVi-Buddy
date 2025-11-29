import React from 'react';
import { useHardware } from '../contexts/HardwareContext';
import { Cpu, Zap, Server, Monitor, LucideIcon } from 'lucide-react';

interface PresetConfig {
    selectedHardwareId: string;
    gpuCount: number;
    systemRamSize: number;
    benchmarkMode: 'gpu' | 'cpu' | 'offloading';
    isNvlink?: boolean;
}

interface Preset {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    config: PresetConfig;
}

const PRESETS: Preset[] = [
    {
        id: 'budget_ai',
        title: 'Budget AI Starter',
        description: 'Great for 7B/8B models',
        icon: Zap,
        config: {
            selectedHardwareId: 'rtx_3060_12gb',
            gpuCount: 1,
            systemRamSize: 32,
            benchmarkMode: 'gpu'
        }
    },
    {
        id: 'high_end_consumer',
        title: 'High-End Consumer',
        description: 'Run 70B models (quantized)',
        icon: Monitor,
        config: {
            selectedHardwareId: 'rtx_4090',
            gpuCount: 1,
            systemRamSize: 64,
            benchmarkMode: 'gpu'
        }
    },
    {
        id: 'dual_3090',
        title: 'Dual 3090 Setup',
        description: '48GB VRAM for larger models',
        icon: Server,
        config: {
            selectedHardwareId: 'rtx_3090',
            gpuCount: 2,
            isNvlink: true,
            systemRamSize: 128,
            benchmarkMode: 'gpu'
        }
    },
    {
        id: 'mac_studio_ultra',
        title: 'Mac Studio Ultra',
        description: 'Unified Memory Powerhouse',
        icon: Cpu,
        config: {
            selectedHardwareId: 'm2_ultra_192',
            gpuCount: 1,
            systemRamSize: 192,
            benchmarkMode: 'cpu' // Mac is treated as CPU/SoC in benchmarks usually
        }
    }
];

const QuickPresets: React.FC = () => {
    const {
        setSelectedHardwareId,
        setGpuCount,
        setIsNvlink,
        setSystemRamSize,
        setBenchmarkMode
    } = useHardware();

    const applyPreset = (preset: Preset) => {
        setSelectedHardwareId(preset.config.selectedHardwareId);
        setGpuCount(preset.config.gpuCount);
        if (preset.config.isNvlink !== undefined) setIsNvlink(preset.config.isNvlink);
        setSystemRamSize(preset.config.systemRamSize);
        setBenchmarkMode(preset.config.benchmarkMode);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {PRESETS.map(preset => (
                <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="flex flex-col items-start p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-500 rounded-xl transition-all group text-left shadow-lg"
                >
                    <div className="p-2 bg-slate-900 rounded-lg mb-3 group-hover:bg-teal-500/20 group-hover:text-teal-400 transition-colors border border-slate-800 group-hover:border-teal-500/30">
                        <preset.icon size={20} className="text-slate-400 group-hover:text-teal-400" />
                    </div>
                    <h3 className="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">{preset.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">{preset.description}</p>
                </button>
            ))}
        </div>
    );
};

export default QuickPresets;
