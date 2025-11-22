import React, { useState, useMemo, useEffect } from 'react';
import { Maximize, Save, Upload, Lock, Unlock } from 'lucide-react';
import HardwareConfig from './components/HardwareConfig';
import ModelList from './components/ModelList';
import ResultsPanel from './components/ResultsPanel';
import BasicModeToggle from './components/BasicModeToggle';
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
    calculatePerGpuUsage
} from './utils/calculations';

const VRAMVisualizerV5 = () => {
    // --- STATE ---
    const [operatingSystem, setOperatingSystem] = useState('macos');
    const [chipType, setChipType] = useState('appleSilicon');

    // Replaced single VRAM/GPU state with gpuList
    const [gpuList, setGpuList] = useState([{ id: 1, name: 'GPU 1', vram: 24, brand: 'nvidia' }]);
    const [mismatchedEnabled, setMismatchedEnabled] = useState(false);

    // Legacy state wrappers for backward compatibility with HardwareConfig (if needed) or just sync them
    const numGPUs = gpuList.length;
    const totalVRAM = gpuList.length > 0 ? gpuList[0].vram : 0; // Representative value

    const [systemRAMAmount, setSystemRAMAmount] = useState(64);

    const [showDetailedSpecs, setShowDetailedSpecs] = useState(false);
    const [gpuVendor, setGpuVendor] = useState('nvidia');
    const [ramType, setRamType] = useState('DDR4');
    const [ramSpeed, setRamSpeed] = useState(3200);
    const [storageType, setStorageType] = useState('NVMeGen4');
    const [ramClRating, setRamClRating] = useState(16);
    const [inferenceSoftware, setInferenceSoftware] = useState('ollama');

    // CPU Configuration
    const [cpuCores, setCpuCores] = useState(8);
    const [cpuThreads, setCpuThreads] = useState(16);

    const [enforceConstraints, setEnforceConstraints] = useState(true);
    const [models, setModels] = useState([defaultModel]);
    const [viewMode, setViewMode] = useState('advanced'); // 'basic' or 'advanced'

    // --- CONSTANTS ---
    const isUnified = operatingSystem === 'macos' && chipType === 'appleSilicon';
    const hasGPU = isUnified || (operatingSystem !== 'macos' || chipType !== 'intel');

    // --- GPU ACTIONS ---
    const setNumGPUs = (num) => {
        const n = Math.max(1, Math.min(8, num));
        setGpuList(prev => {
            if (n > prev.length) {
                const newGpus = [];
                for (let i = prev.length; i < n; i++) {
                    newGpus.push({ id: Date.now() + i, name: `GPU ${i + 1}`, vram: prev[0].vram, brand: 'nvidia' });
                }
                return [...prev, ...newGpus];
            } else {
                return prev.slice(0, n);
            }
        });
    };

    const setTotalVRAM = (vram) => {
        setGpuList(prev => prev.map(g => ({ ...g, vram })));
    };

    const addGpu = () => {
        setGpuList(prev => [...prev, { id: Date.now(), name: `GPU ${prev.length + 1}`, vram: 8, brand: 'nvidia' }]);
    };

    const removeGpu = (id) => {
        if (gpuList.length > 1) {
            setGpuList(prev => prev.filter(g => g.id !== id));
        }
    };

    const updateGpu = (id, field, value) => {
        setGpuList(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
    };

    // --- HARDWARE PRESETS ---
    const applyHardwarePreset = (preset) => {
        switch (preset) {
            case 'rtx4090':
                setOperatingSystem('linux');
                setTotalVRAM(24);
                setNumGPUs(1);
                setSystemRAMAmount(64);
                break;
            case 'rtx3090':
                setOperatingSystem('linux');
                setTotalVRAM(24);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            case 'rtx4070ti':
                setOperatingSystem('linux');
                setTotalVRAM(12);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            case 'rtx4060ti':
                setOperatingSystem('linux');
                setTotalVRAM(16);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            case 'rtx3060':
                setOperatingSystem('linux');
                setTotalVRAM(12);
                setNumGPUs(1);
                setSystemRAMAmount(16);
                break;
            // AMD GPUs
            case 'rx7900xtx':
                setOperatingSystem('linux');
                setTotalVRAM(24);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            case 'rx6800xt':
                setOperatingSystem('linux');
                setTotalVRAM(16);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            // Intel Arc
            case 'arca770':
                setOperatingSystem('linux');
                setTotalVRAM(16);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            case 'arca750':
                setOperatingSystem('linux');
                setTotalVRAM(8);
                setNumGPUs(1);
                setSystemRAMAmount(16);
                break;
            // Mac Configurations
            case 'macStudioUltra':
                setOperatingSystem('macos');
                setChipType('appleSilicon');
                setSystemRAMAmount(192);
                break;
            case 'macStudioM3Ultra':
                setOperatingSystem('macos');
                setChipType('appleSilicon');
                setSystemRAMAmount(512);
                break;
            case 'macbookpro2019_5500m':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(8);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            case 'macbookpro2019_vega20':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(4);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            case 'macbookpro2019_5600m':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(8);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            case 'macpro2020_w5700x':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(16);
                setNumGPUs(1);
                setSystemRAMAmount(96);
                break;
            case 'macpro2020_w6800x':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(32);
                setNumGPUs(1);
                setSystemRAMAmount(96);
                break;
            case 'imac_5700xt':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(16);
                setNumGPUs(1);
                setSystemRAMAmount(64);
                break;
            case 'imac_vega48':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(8);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            // CPU Only
            case 'noGPU':
                setOperatingSystem('linux');
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                break;
            default:
                break;
        }
    };

    // --- UNIFIED MEMORY TOGGLE (for Basic Mode) ---
    const toggleUnifiedMemory = () => {
        if (isUnified) {
            // Switch to discrete GPU (Linux/Windows)
            setOperatingSystem('linux');
            setChipType('appleSilicon'); // Not used for non-macOS
        } else {
            // Switch to unified (macOS + Apple Silicon)
            setOperatingSystem('macos');
            setChipType('appleSilicon');
        }
    };

    // --- MODEL ACTIONS ---
    const addModel = () => {
        const newId = Math.max(...models.map(m => m.id), 0) + 1;
        let newM = { ...defaultModel, id: newId, name: `Model ${newId}` };
        if (enforceConstraints) {
            newM = optimizeLayerSplit(newM, gpuList, systemRAMAmount, enforceConstraints);
        }
        setModels([...models, newM]);
    };

    const removeModel = (id) => {
        if (models.length > 1) setModels(models.filter(m => m.id !== id));
    };

    const updateModel = (id, field, value) => {
        setModels(prevModels => {
            return prevModels.map(model => {
                if (model.id !== id) return model;
                let updatedModel = { ...model, [field]: value };

                // Re-run optimization if needed
                if (enforceConstraints || field === 'mode' || field === 'precision' || field === 'contextLength' || field === 'numLayers' || field === 'gpuLayers') {
                    // Ensure gpuLayers doesn't exceed new numLayers
                    if (field === 'numLayers' && updatedModel.gpuLayers > value) {
                        updatedModel.gpuLayers = value;
                    }
                    updatedModel = optimizeLayerSplit(updatedModel, gpuList, systemRAMAmount, enforceConstraints);
                }
                return updatedModel;
            });
        });
    };

    const applyPreset = (id, preset) => {
        setModels(prev => prev.map(m => {
            if (m.id !== id) return m;
            let newM = { ...m };
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
            // Always optimize to update cpuLayers
            newM = optimizeLayerSplit(newM, gpuList, systemRAMAmount, enforceConstraints);
            return newM;
        }));
    };

    // Sync models when global constraints toggle changes
    useEffect(() => {
        if (enforceConstraints) {
            setModels(prev => prev.map(m => optimizeLayerSplit(m, gpuList, systemRAMAmount, enforceConstraints)));
        }
    }, [enforceConstraints, gpuList, systemRAMAmount]);

    // --- CALCULATIONS ---
    const calculations = useMemo(() => {
        let totalRamUsage = 0;
        let totalGpuWeights = 0;
        let totalCpuWeights = 0;
        let totalKv = 0;
        let totalAct = 0;

        models.forEach(model => {
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

        const globalOverhead = getMemoryOverhead(gpuList, systemRAMAmount);
        const gpuUsageDetails = calculatePerGpuUsage(models, gpuList);
        const finalRamTotal = totalRamUsage + (globalOverhead * 0.8);

        // Calculate total VRAM used across all GPUs
        const totalVRAMUsed = gpuUsageDetails.reduce((acc, gpu) => acc + gpu.used, 0);
        const totalVRAMAvailable = gpuList.reduce((acc, gpu) => acc + gpu.vram, 0);

        // Base performance multiplier (hardware-based)
        const basePerformance = getPerformanceMultiplier(
            numGPUs,
            isUnified,
            operatingSystem,
            chipType,
            cpuCores,
            cpuThreads,
            totalVRAMAvailable
        );

        // Calculate all penalties
        const vramPenalty = getVRAMOverflowPenalty(totalVRAMUsed, totalVRAMAvailable);
        const ramPenalty = getRAMOverflowPenalty(finalRamTotal, systemRAMAmount);
        const contextPenalty = getContextPenalty(models);

        // Final performance score (multiplicative penalties)
        const finalPerformance = basePerformance * vramPenalty * ramPenalty * contextPenalty;

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
            offloadSpeed: getOffloadSpeedFactor(ramSpeed, ramClRating, storageType, showDetailedSpecs),
            gpuUsageDetails,
            totalVRAMUsed,
            totalVRAMAvailable
        };
    }, [models, gpuList, systemRAMAmount, isUnified, operatingSystem, chipType, cpuCores, cpuThreads, numGPUs, ramSpeed, ramClRating, storageType, showDetailedSpecs]);

    // --- SAVE / LOAD ---
    const saveConfig = () => {
        const config = {
            operatingSystem, chipType, gpuList, mismatchedEnabled, systemRAMAmount,
            showDetailedSpecs, gpuVendor, ramType, ramSpeed, models, enforceConstraints, viewMode
        };
        localStorage.setItem('vram_visualizer_v5_config', JSON.stringify(config));
        alert('Configuration saved!');
    };

    const loadConfig = () => {
        const saved = localStorage.getItem('vram_visualizer_v5_config');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                setOperatingSystem(config.operatingSystem);
                setChipType(config.chipType);

                // Handle legacy config migration if needed
                if (config.gpuList) {
                    setGpuList(config.gpuList);
                    setMismatchedEnabled(config.mismatchedEnabled);
                } else {
                    // Migrate old single VRAM to list
                    setGpuList([{ id: 1, name: 'GPU 1', vram: config.totalVRAM }]);
                    setNumGPUs(config.numGPUs); // This will expand the list
                }

                setSystemRAMAmount(config.systemRAMAmount);
                setShowDetailedSpecs(config.showDetailedSpecs);
                setGpuVendor(config.gpuVendor);
                setRamType(config.ramType);
                setRamSpeed(config.ramSpeed);
                setModels(config.models);
                setEnforceConstraints(config.enforceConstraints);
                setViewMode(config.viewMode || 'advanced');
                alert('Configuration loaded!');
            } catch (e) {
                alert('Failed to load configuration.');
            }
        } else {
            alert('No saved configuration found.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-2 sm:p-4 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-4 pb-3 border-b border-slate-700">
                    <div>
                        <h1 className="text-3xl font-extrabold text-teal-400 flex items-center gap-2">
                            <Maximize className="w-8 h-8" /> ViVi Buddy
                        </h1>
                        <p className="text-xs text-slate-500 italic ml-10">Video RAM Visualizer</p>
                        <p className="text-slate-400 text-sm mt-1">
                            {isUnified ? 'Unified Memory' : `Discrete GPU (${numGPUs}x)`} | {operatingSystem} | {ramSpeed} MHz
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
                            <span className={`text-xs font-medium transition-colors ${viewMode === 'basic' ? 'text-purple-400' : 'text-slate-500'}`}>Basic</span>
                            <button
                                onClick={() => setViewMode(viewMode === 'basic' ? 'advanced' : 'basic')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${viewMode === 'advanced' ? 'bg-teal-500' : 'bg-purple-500'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${viewMode === 'advanced' ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                            <span className={`text-xs font-medium transition-colors ${viewMode === 'advanced' ? 'text-teal-400' : 'text-slate-500'}`}>Advanced</span>
                        </div>
                        <button
                            onClick={() => setEnforceConstraints(!enforceConstraints)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${enforceConstraints ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                        >
                            {enforceConstraints ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />} Constraints: {enforceConstraints ? 'ON' : 'OFF'}
                        </button>
                        <button onClick={saveConfig} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-600 transition-colors">
                            <Save className="w-4 h-4" /> Save
                        </button>
                        <button onClick={loadConfig} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-600 transition-colors">
                            <Upload className="w-4 h-4" /> Load
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1 space-y-6">
                        <ResultsPanel
                            calculations={calculations}
                            gpuList={gpuList}
                            systemRAMAmount={systemRAMAmount}
                            isUnified={isUnified}
                            cpuCores={cpuCores}
                            cpuThreads={cpuThreads}
                        />
                        {viewMode === 'advanced' ? (
                            <>
                                <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                                    <div className="text-xs font-medium text-slate-300 mb-3">Hardware Presets:</div>

                                    <div className="mb-3">
                                        <div className="text-xs text-slate-400 mb-1">NVIDIA</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => applyHardwarePreset('rtx4090')} className="px-2 py-1 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded text-xs text-green-300 transition-colors">RTX 4090 24GB</button>
                                            <button onClick={() => applyHardwarePreset('rtx3090')} className="px-2 py-1 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded text-xs text-green-300 transition-colors">RTX 3090 24GB</button>
                                            <button onClick={() => applyHardwarePreset('rtx4070ti')} className="px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/30 rounded text-xs text-yellow-300 transition-colors">RTX 4070 Ti 12GB</button>
                                            <button onClick={() => applyHardwarePreset('rtx4060ti')} className="px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/30 rounded text-xs text-yellow-300 transition-colors">RTX 4060 Ti 16GB</button>
                                            <button onClick={() => applyHardwarePreset('rtx3060')} className="px-2 py-1 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 rounded text-xs text-orange-300 transition-colors">RTX 3060 12GB</button>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="text-xs text-slate-400 mb-1">AMD</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => applyHardwarePreset('rx7900xtx')} className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded text-xs text-red-300 transition-colors">RX 7900 XTX 24GB</button>
                                            <button onClick={() => applyHardwarePreset('rx6800xt')} className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded text-xs text-red-300 transition-colors">RX 6800 XT 16GB</button>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="text-xs text-slate-400 mb-1">Intel Arc</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => applyHardwarePreset('arca770')} className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded text-xs text-blue-300 transition-colors">Arc A770 16GB</button>
                                            <button onClick={() => applyHardwarePreset('arca750')} className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded text-xs text-blue-300 transition-colors">Arc A750 8GB</button>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-400 mb-1">Mac</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => applyHardwarePreset('macStudioM3Ultra')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">Studio M3 Ultra 512GB</button>
                                            <button onClick={() => applyHardwarePreset('macStudioUltra')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">Studio Ultra 192GB</button>
                                            <button onClick={() => applyHardwarePreset('macpro2020_w6800x')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">Pro W6800X 32GB</button>
                                            <button onClick={() => applyHardwarePreset('macpro2020_w5700x')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">Pro W5700X 16GB</button>
                                            <button onClick={() => applyHardwarePreset('imac_5700xt')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">iMac 5700 XT</button>
                                            <button onClick={() => applyHardwarePreset('imac_vega48')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">iMac Vega 48</button>
                                            <button onClick={() => applyHardwarePreset('macbookpro2019_5600m')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">MBP 5600M 8GB</button>
                                            <button onClick={() => applyHardwarePreset('macbookpro2019_5500m')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">MBP 5500M 8GB</button>
                                            <button onClick={() => applyHardwarePreset('macbookpro2019_vega20')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">MBP Vega 20</button>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-400 mb-1">CPU Only</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => applyHardwarePreset('noGPU')} className="px-2 py-1 bg-slate-600/20 hover:bg-slate-600/40 border border-slate-500/30 rounded text-xs text-slate-300 transition-colors">No GPU</button>
                                        </div>
                                    </div>
                                </div>
                                <HardwareConfig
                                    operatingSystem={operatingSystem} setOperatingSystem={setOperatingSystem}
                                    chipType={chipType} setChipType={setChipType}
                                    totalVRAM={totalVRAM} setTotalVRAM={setTotalVRAM}
                                    numGPUs={numGPUs} setNumGPUs={setNumGPUs}
                                    systemRAMAmount={systemRAMAmount} setSystemRAMAmount={setSystemRAMAmount}
                                    showDetailedSpecs={showDetailedSpecs} setShowDetailedSpecs={setShowDetailedSpecs}
                                    gpuVendor={gpuVendor} setGpuVendor={setGpuVendor}
                                    ramType={ramType} setRamType={setRamType}
                                    ramSpeed={ramSpeed} setRamSpeed={setRamSpeed}
                                    storageType={storageType} setStorageType={setStorageType}
                                    ramClRating={ramClRating} setRamClRating={setRamClRating}
                                    inferenceSoftware={inferenceSoftware} setInferenceSoftware={setInferenceSoftware}
                                    isUnified={isUnified} hasGPU={hasGPU}
                                    mismatchedEnabled={mismatchedEnabled} setMismatchedEnabled={setMismatchedEnabled}
                                    gpuList={gpuList} updateGpu={updateGpu} addGpu={addGpu} removeGpu={removeGpu}
                                    cpuCores={cpuCores} setCpuCores={setCpuCores}
                                    cpuThreads={cpuThreads} setCpuThreads={setCpuThreads}
                                />
                            </>
                        ) : (
                            <>
                                <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                                    <div className="text-xs font-medium text-slate-300 mb-3">Hardware Presets:</div>

                                    <div className="mb-3">
                                        <div className="text-xs text-slate-400 mb-1">NVIDIA</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => applyHardwarePreset('rtx4090')} className="px-2 py-1 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded text-xs text-green-300 transition-colors">RTX 4090 24GB</button>
                                            <button onClick={() => applyHardwarePreset('rtx3090')} className="px-2 py-1 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded text-xs text-green-300 transition-colors">RTX 3090 24GB</button>
                                            <button onClick={() => applyHardwarePreset('rtx4070ti')} className="px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/30 rounded text-xs text-yellow-300 transition-colors">RTX 4070 Ti 12GB</button>
                                            <button onClick={() => applyHardwarePreset('rtx4060ti')} className="px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/30 rounded text-xs text-yellow-300 transition-colors">RTX 4060 Ti 16GB</button>
                                            <button onClick={() => applyHardwarePreset('rtx3060')} className="px-2 py-1 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 rounded text-xs text-orange-300 transition-colors">RTX 3060 12GB</button>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="text-xs text-slate-400 mb-1">AMD</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => applyHardwarePreset('rx7900xtx')} className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded text-xs text-red-300 transition-colors">RX 7900 XTX 24GB</button>
                                            <button onClick={() => applyHardwarePreset('rx6800xt')} className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded text-xs text-red-300 transition-colors">RX 6800 XT 16GB</button>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="text-xs text-slate-400 mb-1">Intel Arc</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => applyHardwarePreset('arca770')} className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded text-xs text-blue-300 transition-colors">Arc A770 16GB</button>
                                            <button onClick={() => applyHardwarePreset('arca750')} className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded text-xs text-blue-300 transition-colors">Arc A750 8GB</button>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-400 mb-1">Mac</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => applyHardwarePreset('macStudioM3Ultra')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">Studio M3 Ultra 512GB</button>
                                            <button onClick={() => applyHardwarePreset('macStudioUltra')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">Studio Ultra 192GB</button>
                                            <button onClick={() => applyHardwarePreset('macpro2020_w6800x')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">Pro W6800X 32GB</button>
                                            <button onClick={() => applyHardwarePreset('macpro2020_w5700x')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">Pro W5700X 16GB</button>
                                            <button onClick={() => applyHardwarePreset('imac_5700xt')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">iMac 5700 XT</button>
                                            <button onClick={() => applyHardwarePreset('imac_vega48')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">iMac Vega 48</button>
                                            <button onClick={() => applyHardwarePreset('macbookpro2019_5600m')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">MBP 5600M 8GB</button>
                                            <button onClick={() => applyHardwarePreset('macbookpro2019_5500m')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">MBP 5500M 8GB</button>
                                            <button onClick={() => applyHardwarePreset('macbookpro2019_vega20')} className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded text-xs text-purple-300 transition-colors">MBP Vega 20</button>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-400 mb-1">CPU Only</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => applyHardwarePreset('noGPU')} className="px-2 py-1 bg-slate-600/20 hover:bg-slate-600/40 border border-slate-500/30 rounded text-xs text-slate-300 transition-colors">No GPU</button>
                                        </div>
                                    </div>
                                </div>
                                <BasicModeToggle
                                    isUnified={isUnified}
                                    onToggle={toggleUnifiedMemory}
                                    systemRAMAmount={systemRAMAmount}
                                    setSystemRAMAmount={setSystemRAMAmount}
                                    totalVRAM={totalVRAM}
                                    setTotalVRAM={setTotalVRAM}
                                    numGPUs={numGPUs}
                                    setNumGPUs={setNumGPUs}
                                />
                            </>
                        )}
                    </div>

                    <div className="xl:col-span-2 space-y-6">
                        <ModelList
                            models={models}
                            updateModel={updateModel}
                            addModel={addModel}
                            removeModel={removeModel}
                            applyPreset={applyPreset}
                            isUnified={isUnified}
                            hardware={{
                                operatingSystem,
                                chipType,
                                gpuVendor,
                                gpuList,
                                inferenceSoftware
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VRAMVisualizerV5;
