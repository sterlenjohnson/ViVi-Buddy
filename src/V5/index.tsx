// V5/index.tsx - Refactored for shared HardwareContext & ModelContext integration
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './components/Logo';
import { Save, Upload, HardDrive, Settings, Cpu, Server } from 'lucide-react';
import ModelList from './components/ModelList';
import ResultsPanel from './components/ResultsPanel';
import HelpTooltip from '../components/HelpTooltip';
import { defaultModel } from './utils/constants';
import {
    getLayerSizeGB,
    getKVCachePerLayerGB,
    getActivationPerLayerGB,
    getMemoryOverhead,
    getOffloadSpeedFactor,
    getPerformanceMultiplier,
    getVRAMOverflowPenalty,
    getRAMOverflowPenalty,
    getContextPenalty,
    optimizeLayerSplit,
    calculatePerGpuUsage,
} from './utils/calculations';
import { useHardware } from '../contexts/HardwareContext';
import { getHardwareById } from '../database/db_interface';

// Type Definitions
interface GpuItem {
    id: number;
    name: string;
    vram: number;
    brand: string;
}

const VRAMVisualizerV5: React.FC = () => {
    // Navigation
    const navigate = useNavigate();

    // Global Hardware Context
    const {
        selectedHardwareId,
        gpuCount,
        isNvlink,
        systemRamSize,
        operatingSystem,
        ramType,
        ramSpeed,
        storageType,
        customHardware
    } = useHardware();

    // Local state for Model Configuration only
    const [enforceConstraints, setEnforceConstraints] = useState<boolean>(true);
    const [models, setModels] = useState<any[]>([defaultModel]);


    // Derived hardware state for calculation compatibility
    const [gpuList, setGpuList] = useState<GpuItem[]>([]);
    const [gpuVendor, setGpuVendor] = useState<string>('nvidia');
    const [chipType, setChipType] = useState<string>('gpu');

    // Sync global hardware context to local calculation format
    useEffect(() => {
        // This effect transforms the global context data into the format expected by the calculator logic
        // FIXED: Now properly reads RAM, detects unified memory, and preserves exact GPU names

        // 1. Determine Hardware Specs from selected preset or custom hardware
        let vram = 24; // Default VRAM
        let name = ''; // GPU/System name - FIXED: no longer defaults to "Unknown GPU"
        let brand = 'nvidia';
        let isUnified = false; // FIXED: Track if this is unified memory (Apple Silicon)

        // Check custom hardware first
        const custom = customHardware.find(h => h.id === selectedHardwareId);
        if (custom) {
            vram = custom.vram_gb || 24;
            name = custom.name; // FIXED: Preserve exact custom name
            brand = custom.brand || (custom.type === 'gpu' ? 'nvidia' : custom.type === 'soc' ? 'apple' : 'cpu');
            isUnified = custom.isUnifiedMemory || false;
        } else {
            // Check database
            const hw = getHardwareById(selectedHardwareId);
            if (hw) {
                vram = hw.vram_gb || 0;
                name = hw.name; // FIXED: Preserve exact preset name (e.g., "MacBook Pro 16\" 2019 (i7-9750H + 5300M)")
                isUnified = (hw as any).isUnifiedMemory || false; // FIXED: Read unified memory flag

                // Infer brand
                if (hw.brand) {
                    brand = hw.brand;
                } else {
                    const lowerName = hw.name.toLowerCase();
                    if (lowerName.includes('rtx') || lowerName.includes('gtx') || lowerName.includes('nvidia')) brand = 'nvidia';
                    else if (lowerName.includes('rx') || lowerName.includes('radeon') || lowerName.includes('amd')) brand = 'amd';
                    else if (lowerName.includes('arc') || lowerName.includes('intel')) brand = 'intel';
                    else if (lowerName.includes('m1') || lowerName.includes('m2') || lowerName.includes('m3') || lowerName.includes('m4') || lowerName.includes('m5')) brand = 'apple';
                }
            }
        }

        setGpuVendor(brand);

        // FIXED: Properly detect chip type.
        // Only set 'appleSilicon' if it's actually unified memory (M-series)
        // Intel Macs (macOS + Intel CPU) should be treated as 'gpu' (discrete) or 'cpu'
        if (isUnified) {
            setChipType('appleSilicon');
        } else if (brand === 'cpu') {
            setChipType('cpu');
        } else {
            setChipType('gpu');
        }

        // Construct GPU List with exact names
        const newGpuList: GpuItem[] = [];
        for (let i = 0; i < gpuCount; i++) {
            // Clean up name display: avoid redundant "GPU #1: GPU #1"
            // If name is present, use it directly. If not, fallback to generic.
            // We append index only if there are multiple GPUs to distinguish them.
            let displayName = name || `GPU`;
            if (gpuCount > 1) {
                displayName = `${displayName} #${i + 1}`;
            }

            newGpuList.push({
                id: i,
                name: displayName,
                vram: vram,
                brand: brand
            });
        }
        setGpuList(newGpuList);

        // VALIDATION: Log warnings for incomplete hardware specs (Phase 8A Task D-02)
        // Note: Calculator now automatically uses systemRamSize, ramType, ramSpeed from context
        if (selectedHardwareId && selectedHardwareId !== 'custom_quick') {
            const spec = custom || getHardwareById(selectedHardwareId);
            if (spec) {
                // Validate complete specs
                if (!spec.name || spec.name.trim() === '') {
                    console.error(`⚠️ Hardware preset "${selectedHardwareId}" missing name field. Update HARDWARE_DATABASE.`);
                }
                if (!isUnified && (!spec.vram_gb || spec.vram_gb === 0)) {
                    console.error(`⚠️ Discrete GPU "${selectedHardwareId}" missing vram_gb field. Update HARDWARE_DATABASE.`);
                }
                if (!spec.brand) {
                    console.error(`⚠️ Hardware preset "${selectedHardwareId}" missing brand field. Recommendation: Add explicit brand.`);
                }
            }
        }
    }, [selectedHardwareId, gpuCount, customHardware, operatingSystem, systemRamSize, ramType, ramSpeed]);


    // Derived values
    const numGPUs = gpuList.length;
    const isUnified = chipType === 'appleSilicon';
    const hasGPU = isUnified || (gpuList.length > 0 && gpuVendor !== 'cpu');

    // Navigation helper
    const goToBenchmarks = () => {
        navigate('/benchmarks');
    };

    // --- MODEL ACTIONS ---
    const addModel = () => {
        const newId = Math.max(...models.map((m) => m.id), 0) + 1;
        let newM = { ...defaultModel, id: newId, name: `Model ${newId}` };
        if (enforceConstraints) {
            newM = optimizeLayerSplit(newM, gpuList, systemRamSize, enforceConstraints);
        }
        setModels([...models, newM]);
    };

    const removeModel = (id: number) => {
        if (models.length > 1) setModels(models.filter((m) => m.id !== id));
    };

    const updateModel = (id: number, field: string, value: any) => {
        setModels((prev) =>
            prev.map((model) => {
                if (model.id !== id) return model;
                let updated = { ...model, [field]: value };
                if (!hasGPU && field === 'mode' && value !== 'cpuOnly') {
                    updated.mode = 'cpuOnly';
                }
                if (
                    enforceConstraints ||
                    ['mode', 'precision', 'contextLength', 'numLayers', 'gpuLayers'].includes(field)
                ) {
                    if (field === 'numLayers' && updated.gpuLayers > value) {
                        updated.gpuLayers = value;
                    }
                    updated = optimizeLayerSplit(updated, gpuList, systemRamSize, enforceConstraints);
                }
                return updated;
            })
        );
    };

    // Force CPU mode when GPU disabled
    useEffect(() => {
        if (!hasGPU) {
            setModels((prev) =>
                prev.map((m) => ({ ...m, mode: 'cpuOnly', gpuLayers: 0 }))
            );
        }
    }, [hasGPU]);

    // Sync models when constraints toggle changes
    useEffect(() => {
        if (enforceConstraints) {
            setModels((prev) => prev.map((m) => optimizeLayerSplit(m, gpuList, systemRamSize, enforceConstraints)));
        }
    }, [enforceConstraints, gpuList, systemRamSize]);


    // --- CALCULATIONS ---
    const calculations = useMemo(() => {
        let totalRamUsage = 0;
        let totalGpuWeights = 0;
        let totalCpuWeights = 0;
        let totalKv = 0;
        let totalAct = 0;
        models.forEach((model) => {
            const layerSize = getLayerSizeGB(model);
            const kvSize = getKVCachePerLayerGB(model);
            const actSize = getActivationPerLayerGB(model);
            const gpuW = layerSize * model.gpuLayers;
            const cpuW = layerSize * model.cpuLayers;
            const kv = kvSize * model.gpuLayers;
            const act = actSize * model.gpuLayers;
            totalGpuWeights += gpuW;
            totalCpuWeights += cpuW;
            totalKv += kv;
            totalAct += act;
            totalRamUsage += cpuW;
        });
        const globalOverhead = getMemoryOverhead(gpuList, systemRamSize, operatingSystem);
        const gpuUsageDetails = calculatePerGpuUsage(models, gpuList);
        const finalRamTotal = totalRamUsage + globalOverhead * 0.8;
        const totalVRAMUsed = hasGPU ? gpuUsageDetails.reduce((a, g) => a + g.used, 0) : 0;
        const totalVRAMAvailable = hasGPU ? gpuList.reduce((a, g) => a + g.vram, 0) : 0;

        // Mock CPU cores/threads for now since we removed local state
        const cpuCores = 16;
        const cpuThreads = 32;

        const basePerformance = getPerformanceMultiplier(
            numGPUs,
            isUnified,
            operatingSystem,
            chipType,
            cpuCores,
            cpuThreads,
            totalVRAMAvailable,
            'ollama' // Default inference software
        );
        const vramPenalty = getVRAMOverflowPenalty(totalVRAMUsed, totalVRAMAvailable);
        const ramPenalty = getRAMOverflowPenalty(finalRamTotal, systemRamSize);
        const contextPenalty = getContextPenalty(models);
        const finalPerformance = basePerformance * vramPenalty * ramPenalty * contextPenalty;

        // Mock ram cl rating
        const ramClRating = 16;

        return {
            totalRamUsage: finalRamTotal,
            gpuWeights: totalGpuWeights,
            cpuWeights: totalCpuWeights,
            kvCache: totalKv,
            activations: totalAct,
            overhead: globalOverhead,
            performanceMultiplier: basePerformance,
            vramOverflowPenalty: vramPenalty,
            ramOverflowPenalty: ramPenalty,
            contextPenalty: contextPenalty,
            finalPerformance: finalPerformance,
            offloadSpeed: getOffloadSpeedFactor(ramSpeed, ramClRating, storageType, false),
            gpuUsageDetails,
            totalVRAMUsed,
            totalVRAMAvailable,
        };
    }, [models, gpuList, systemRamSize, isUnified, operatingSystem, chipType, numGPUs, ramSpeed, storageType, hasGPU]);

    // --- SAVE / LOAD CONFIG ---
    // Only saving model config now, hardware is global
    useEffect(() => {
        const config = {
            models,
            enforceConstraints,
        };
        localStorage.setItem('vivi_calculator_autosave', JSON.stringify(config));
    }, [models, enforceConstraints]);

    const saveConfig = () => {
        const config = {
            models,
            enforceConstraints,
        };
        localStorage.setItem('vram_visualizer_v5_config', JSON.stringify(config));
        alert('Model configuration saved!');
    };

    const loadConfig = () => {
        const saved = localStorage.getItem('vram_visualizer_v5_config');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                setModels(config.models);
                setEnforceConstraints(config.enforceConstraints);
                alert('Model configuration loaded!');
            } catch (e) {
                console.error('Failed to load config', e);
                alert('Failed to load configuration.');
            }
        } else {
            alert('No saved configuration found.');
        }
    };

    // Model preset (speed/balance/context)
    const applyPreset = (id: number, preset: string) => {
        setModels((prev) =>
            prev.map((m) => {
                if (m.id !== id) return m;
                let newM = { ...m };
                if (!hasGPU) {
                    newM.mode = 'cpuOnly';
                    newM.gpuLayers = 0;
                    if (preset === 'speed') {
                        newM.precision = 'q4_0';
                        newM.contextLength = 2048;
                    } else if (preset === 'balance') {
                        newM.precision = 'q4_k_m';
                        newM.contextLength = 4096;
                    } else if (preset === 'context') {
                        newM.precision = 'q3_k_m';
                        newM.contextLength = 8192;
                    }
                } else {
                    if (preset === 'speed') {
                        newM.mode = 'gpuOnly';
                        newM.precision = 'q4_k_m';
                        newM.contextLength = 2048;
                    } else if (preset === 'balance') {
                        newM.mode = 'hybrid';
                        newM.precision = 'q5_k_m';
                        newM.contextLength = 4096;
                    } else if (preset === 'context') {
                        newM.mode = 'hybrid';
                        newM.precision = 'q3_k_m';
                        newM.contextLength = 16384;
                    }
                }
                return optimizeLayerSplit(newM, gpuList, systemRamSize, enforceConstraints);
            })
        );
    };

    // Construct Hardware object for ModelList
    const hardwareObj = {
        operatingSystem,
        chipType,
        gpuVendor,
        gpuList,
        inferenceSoftware: 'ollama', // Default
        gpuEnabled: hasGPU
    };

    // --- UI RENDER ---
    return (
        <div className="min-h-screen bg-slate-900 text-white p-2 sm:p-4 font-sans relative overflow-hidden">
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

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 rounded-b-xl px-4">
                    <div className="mt-2 md:mt-0">
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 flex items-center gap-3">
                            <Logo className="w-10 h-10" /> ViVi Buddy
                        </h1>
                        <p className="text-xs text-slate-500 italic ml-14">Video RAM Visualizer</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0 flex-wrap justify-center">
                        <div className="flex gap-2">
                            <button onClick={saveConfig} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors shadow-lg" title="Save Config">
                                <Save className="w-4 h-4" />
                            </button>
                            <button onClick={loadConfig} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors shadow-lg" title="Load Config">
                                <Upload className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={goToBenchmarks}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg border border-blue-500 shadow-lg text-white text-xs font-bold transition-all"
                            title="Go to Benchmarks & Testing"
                        >
                            <span>📊</span> Benchmarks
                        </button>
                    </div>
                </header>

                {/* Hardware Summary Card */}
                <div className="bg-gray-800/80 backdrop-blur rounded-xl border border-gray-700 p-6 shadow-lg mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <HardDrive className="text-teal-400" />
                            System Hardware
                        </h2>
                        <Link
                            to="/hardware"
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2 shadow-lg"
                        >
                            <Settings size={16} />
                            Configure Hardware
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <div className="text-gray-400 text-xs uppercase font-bold mb-1">GPU Config</div>
                            {gpuList[0]?.name ? (
                                <>
                                    <div className="text-white font-semibold text-lg truncate" title={gpuList[0].name}>
                                        {gpuList[0].name}
                                    </div>
                                    <div className="text-teal-400 text-sm">
                                        {gpuCount}x GPU {isNvlink ? '(NVLink)' : ''}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    to="/hardware"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <HardDrive className="w-4 h-4" />
                                    Configure Hardware
                                </Link>
                            )}
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <div className="text-gray-400 text-xs uppercase font-bold mb-1">
                                {isUnified ? 'Unified Memory' : 'System Memory'}
                            </div>
                            <div className="text-white font-semibold text-lg">
                                {systemRamSize} GB
                            </div>
                            {!isUnified && gpuList[0]?.vram && (
                                <div className="text-gray-400 text-xs mt-1">
                                    + {gpuList[0].vram} GB VRAM
                                </div>
                            )}
                            <div className="text-teal-400 text-sm">
                                {ramType.toUpperCase()} @ {ramSpeed} MT/s
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <div className="text-gray-400 text-xs uppercase font-bold mb-1">Storage</div>
                            <div className="text-white font-semibold text-lg">
                                {storageType === 'nvme_gen4' ? 'NVMe Gen 4' :
                                    storageType === 'nvme_gen3' ? 'NVMe Gen 3' :
                                        storageType === 'sata' ? 'SATA SSD' : 'HDD'}
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <div className="text-gray-400 text-xs uppercase font-bold mb-1">OS</div>
                            <div className="text-white font-semibold text-lg capitalize">
                                {operatingSystem === 'macos' ? 'macOS' : operatingSystem}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="mb-8">
                    <ResultsPanel
                        calculations={calculations}
                        gpuList={gpuList}
                        systemRAMAmount={systemRamSize}
                        isUnified={isUnified}
                        cpuCores={16} // Mocked
                        cpuThreads={32} // Mocked
                        gpuEnabled={hasGPU}
                    />
                </div>

                {/* Model Configuration */}
                <ModelList
                    models={models}
                    addModel={addModel}
                    removeModel={removeModel}
                    updateModel={updateModel}
                    applyPreset={applyPreset}
                    isUnified={isUnified}
                    hardware={hardwareObj}
                />
            </div>
        </div>
    );
};

export default VRAMVisualizerV5;
