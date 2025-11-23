import React, { useState, useMemo, useEffect } from 'react';
import Logo from './components/Logo';
import { Save, Upload, Lock, Unlock, Trash2 } from 'lucide-react';
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
import { autoDetectHardware, getDetectionConfidence } from './utils/hardwareDetection';

const hardwarePresets = [
    {
        group: 'NVIDIA', options: [
            { label: 'RTX 4090 24GB', value: 'rtx4090' },
            { label: 'RTX 3090 24GB', value: 'rtx3090' },
            { label: 'RTX 4070 Ti 12GB', value: 'rtx4070ti' },
            { label: 'RTX 4060 Ti 16GB', value: 'rtx4060ti' },
            { label: 'RTX 3060 12GB', value: 'rtx3060' },
        ]
    },
    {
        group: 'AMD', options: [
            { label: 'RX 7900 XTX 24GB', value: 'rx7900xtx' },
            { label: 'RX 6800 XT 16GB', value: 'rx6800xt' },
        ]
    },
    {
        group: 'Intel Arc', options: [
            { label: 'Arc A770 16GB', value: 'arca770' },
            { label: 'Arc A750 8GB', value: 'arca750' },
        ]
    },
    {
        group: 'Mac', options: [
            { label: 'Studio M3 Ultra 512GB', value: 'macStudioM3Ultra' },
            { label: 'Studio Ultra 192GB', value: 'macStudioUltra' },
            { label: 'Pro W6800X 32GB', value: 'macpro2020_w6800x' },
            { label: 'Pro W5700X 16GB', value: 'macpro2020_w5700x' },
            { label: 'iMac 5700 XT', value: 'imac_5700xt' },
            { label: 'iMac Vega 48', value: 'imac_vega48' },
            { label: 'MBP 5600M 8GB', value: 'macbookpro2019_5600m' },
            { label: 'MBP 5500M 8GB', value: 'macbookpro2019_5500m' },
            { label: 'MBP Vega 20', value: 'macbookpro2019_vega20' },
        ]
    },
    {
        group: 'CPU Presets', options: [
            { label: 'Ryzen 9 7950X (16c/32t)', value: 'ryzen9' },
            { label: 'Ryzen 7 7700X (8c/16t)', value: 'ryzen7' },
            { label: 'Ryzen 5 7600X (6c/12t)', value: 'ryzen5' },
            { label: 'Ryzen 3 4100 (4c/8t)', value: 'ryzen3' },
            { label: 'Core i9-14900K (24c/32t)', value: 'corei9' },
            { label: 'Core i7-14700K (20c/28t)', value: 'corei7' },
            { label: 'Core i5-14600K (14c/20t)', value: 'corei5' },
            { label: 'Core i3-14100 (4c/8t)', value: 'corei3' },
            { label: 'Raspberry Pi 5 (8GB)', value: 'rpi5_8gb' },
            { label: 'Raspberry Pi 4 (8GB)', value: 'rpi4_8gb' },
            { label: 'Generic No GPU', value: 'noGPU' },
        ]
    },
];

const VRAMVisualizerV5 = () => {
    // --- STATE ---
    const [operatingSystem, setOperatingSystem] = useState('macos');
    const [chipType, setChipType] = useState('appleSilicon');

    // Replaced single VRAM/GPU state with gpuList
    const [gpuList, setGpuList] = useState([{ id: 1, name: 'GPU 1', vram: 24, brand: 'nvidia' }]);
    const [gpuEnabled, setGpuEnabled] = useState(true);
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
    const hasGPU = isUnified || gpuEnabled;

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

    const [selectedPresetId, setSelectedPresetId] = useState('');

    // --- CUSTOM PRESETS ---
    const [customPresets, setCustomPresets] = useState(() => {
        const saved = localStorage.getItem('vivi_custom_presets');
        return saved ? JSON.parse(saved) : [];
    });

    const saveCustomPreset = () => {
        const name = prompt("Enter a name for this hardware preset:");
        if (!name) return;

        const newPreset = {
            id: `custom_${Date.now()}`,
            label: name,
            config: {
                operatingSystem, chipType, gpuList, mismatchedEnabled,
                systemRAMAmount, cpuCores, cpuThreads,
                gpuVendor, ramType, ramSpeed, storageType, ramClRating,
                gpuEnabled, totalVRAM, numGPUs // Legacy support
            }
        };

        const updated = [...customPresets, newPreset];
        setCustomPresets(updated);
        localStorage.setItem('vivi_custom_presets', JSON.stringify(updated));
    };

    const deleteCustomPreset = (id) => {
        if (window.confirm("Are you sure you want to delete this preset?")) {
            const updated = customPresets.filter(p => p.id !== id);
            setCustomPresets(updated);
            localStorage.setItem('vivi_custom_presets', JSON.stringify(updated));
        }
    };

    // --- AUTO-DETECT HARDWARE ---
    const handleAutoDetect = () => {
        const detected = autoDetectHardware();
        const confidence = getDetectionConfidence(detected);

        let message = `🔍 Hardware Detection Results\n\n`;

        if (detected.systemRAM) {
            message += `RAM: ${detected.systemRAM} GB (detected)\n`;
            setSystemRAMAmount(detected.systemRAM);
        } else {
            message += `RAM: Could not detect\n`;
        }

        if (detected.cpuCores) {
            message += `CPU Cores: ${detected.cpuCores} (${detected.cpuThreads} threads)\n`;
            setCpuCores(detected.cpuCores);
            setCpuThreads(detected.cpuThreads);
        }

        if (detected.operatingSystem) {
            message += `OS: ${detected.operatingSystem}\n`;
            setOperatingSystem(detected.operatingSystem);
        }

        if (detected.chipType) {
            message += `Chip: ${detected.chipType}\n`;
            setChipType(detected.chipType);
        }

        if (detected.gpu.detected) {
            message += `\nGPU Detected:\n`;
            message += `  Vendor: ${detected.gpu.vendor}\n`;
            message += `  Renderer: ${detected.gpu.renderer}\n`;

            if (detected.estimatedVRAM) {
                message += `  Est. VRAM: ${detected.estimatedVRAM} GB\n`;
                setTotalVRAM(detected.estimatedVRAM);
            } else {
                message += `  VRAM: Could not estimate\n`;
            }
        } else {
            message += `\nGPU: Not detected\n`;
        }

        message += `\nConfidence: ${confidence.level} (${confidence.percentage}%)\n`;
        message += `\n⚠️ Browser detection is approximate.\nPlease verify the values.`;

        alert(message);
    };

    // --- HARDWARE PRESETS ---
    const applyHardwarePreset = (presetValue) => {
        setSelectedPresetId(presetValue);

        // Check for Custom Preset
        if (presetValue.startsWith('custom_')) {
            const custom = customPresets.find(p => p.id === presetValue);
            if (custom) {
                const c = custom.config;
                setOperatingSystem(c.operatingSystem);
                setChipType(c.chipType);
                setGpuList(c.gpuList);
                setMismatchedEnabled(c.mismatchedEnabled);
                setSystemRAMAmount(c.systemRAMAmount);
                setCpuCores(c.cpuCores);
                setCpuThreads(c.cpuThreads);
                setGpuVendor(c.gpuVendor);
                setRamType(c.ramType);
                setRamSpeed(c.ramSpeed);
                setStorageType(c.storageType);
                setRamClRating(c.ramClRating);
                setGpuEnabled(c.gpuEnabled);
                // Legacy/derived
                if (c.totalVRAM !== undefined) setTotalVRAM(c.totalVRAM);
                if (c.numGPUs !== undefined) setNumGPUs(c.numGPUs);
            }
            return;
        }

        // Default to enabling GPU for most presets
        setGpuEnabled(true);
        setMismatchedEnabled(false); // Reset mismatched state on preset change

        // Default Advanced Specs
        setRamType('DDR5');
        setRamSpeed(5600);
        setGpuVendor('nvidia');
        setStorageType('NVMeGen4');
        setRamClRating(36);

        switch (presetValue) {
            case 'rtx4090':
                setOperatingSystem('linux');
                setTotalVRAM(24);
                setNumGPUs(1);
                setSystemRAMAmount(64);
                setGpuVendor('nvidia');
                setRamSpeed(6000);
                break;
            case 'rtx3090':
                setOperatingSystem('linux');
                setTotalVRAM(24);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setGpuVendor('nvidia');
                setRamType('DDR4');
                setRamSpeed(3600);
                setRamClRating(16);
                break;
            case 'rtx4070ti':
                setOperatingSystem('linux');
                setTotalVRAM(12);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setGpuVendor('nvidia');
                setRamSpeed(6000);
                break;
            case 'rtx4060ti':
                setOperatingSystem('linux');
                setTotalVRAM(16);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setGpuVendor('nvidia');
                setRamSpeed(5600);
                break;
            case 'rtx3060':
                setOperatingSystem('linux');
                setTotalVRAM(12);
                setNumGPUs(1);
                setSystemRAMAmount(16);
                setGpuVendor('nvidia');
                setRamType('DDR4');
                setRamSpeed(3200);
                setRamClRating(16);
                break;
            // AMD GPUs
            case 'rx7900xtx':
                setOperatingSystem('linux');
                setTotalVRAM(24);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setGpuVendor('amd');
                setRamSpeed(6000);
                break;
            case 'rx6800xt':
                setOperatingSystem('linux');
                setTotalVRAM(16);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setGpuVendor('amd');
                setRamType('DDR4');
                setRamSpeed(3600);
                setRamClRating(16);
                break;
            // Intel Arc
            case 'arca770':
                setOperatingSystem('linux');
                setTotalVRAM(16);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setGpuVendor('intel');
                setRamType('DDR4');
                setRamSpeed(3200);
                setRamClRating(16);
                break;
            case 'arca750':
                setOperatingSystem('linux');
                setTotalVRAM(8);
                setNumGPUs(1);
                setSystemRAMAmount(16);
                setGpuVendor('intel');
                setRamType('DDR4');
                setRamSpeed(3200);
                setRamClRating(16);
                break;
            // Mac Configurations
            case 'macStudioUltra':
                setOperatingSystem('macos');
                setChipType('appleSilicon');
                setSystemRAMAmount(192);
                setRamType('LPDDR5'); // Unified
                setRamSpeed(6400);
                break;
            case 'macStudioM3Ultra':
                setOperatingSystem('macos');
                setChipType('appleSilicon');
                setSystemRAMAmount(512);
                setRamType('LPDDR5');
                setRamSpeed(6400);
                break;
            case 'macbookpro2019_5500m':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(8);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setRamType('DDR4');
                setRamSpeed(2666);
                setGpuVendor('amd');
                break;
            case 'macbookpro2019_vega20':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(4);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setRamType('DDR4');
                setRamSpeed(2400);
                setGpuVendor('amd');
                break;
            case 'macbookpro2019_5600m':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(8);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setRamType('DDR4');
                setRamSpeed(2666);
                setGpuVendor('amd');
                break;
            case 'macpro2020_w5700x':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(16);
                setNumGPUs(1);
                setSystemRAMAmount(96);
                setRamType('DDR4');
                setRamSpeed(2933);
                setGpuVendor('amd');
                break;
            case 'macpro2020_w6800x':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(32);
                setNumGPUs(1);
                setSystemRAMAmount(96);
                setRamType('DDR4');
                setRamSpeed(2933);
                setGpuVendor('amd');
                break;
            case 'imac_5700xt':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(16);
                setNumGPUs(1);
                setSystemRAMAmount(64);
                setRamType('DDR4');
                setRamSpeed(2666);
                setGpuVendor('amd');
                break;
            case 'imac_vega48':
                setOperatingSystem('macos');
                setChipType('intel');
                setTotalVRAM(8);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setRamType('DDR4');
                setRamSpeed(2666);
                setGpuVendor('amd');
                break;
            // CPU Presets
            case 'ryzen9':
                setOperatingSystem('linux');
                setChipType('intel'); // x86
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(64);
                setCpuCores(16);
                setCpuThreads(32);
                setRamType('DDR5');
                setRamSpeed(6000);
                setRamClRating(30);
                break;
            case 'ryzen7':
                setOperatingSystem('linux');
                setChipType('intel');
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setCpuCores(8);
                setCpuThreads(16);
                setRamType('DDR5');
                setRamSpeed(6000);
                setRamClRating(30);
                break;
            case 'ryzen5':
                setOperatingSystem('linux');
                setChipType('intel');
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setCpuCores(6);
                setCpuThreads(12);
                setRamType('DDR5');
                setRamSpeed(5200);
                setRamClRating(36);
                break;
            case 'ryzen3':
                setOperatingSystem('linux');
                setChipType('intel');
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(16);
                setCpuCores(4);
                setCpuThreads(8);
                setRamType('DDR4');
                setRamSpeed(3200);
                setRamClRating(16);
                break;
            case 'corei9':
                setOperatingSystem('linux');
                setChipType('intel');
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(64);
                setCpuCores(24);
                setCpuThreads(32);
                setRamType('DDR5');
                setRamSpeed(6000);
                setRamClRating(30);
                break;
            case 'corei7':
                setOperatingSystem('linux');
                setChipType('intel');
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setCpuCores(20);
                setCpuThreads(28);
                setRamType('DDR5');
                setRamSpeed(5600);
                setRamClRating(32);
                break;
            case 'corei5':
                setOperatingSystem('linux');
                setChipType('intel');
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setCpuCores(14);
                setCpuThreads(20);
                setRamType('DDR5');
                setRamSpeed(5600);
                setRamClRating(36);
                break;
            case 'corei3':
                setOperatingSystem('linux');
                setChipType('intel');
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(16);
                setCpuCores(4);
                setCpuThreads(8);
                setRamType('DDR4');
                setRamSpeed(3200);
                setRamClRating(16);
                break;
            case 'rpi5_8gb':
                setOperatingSystem('linux');
                setChipType('arm64');
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(8);
                setCpuCores(4);
                setCpuThreads(4);
                setRamType('LPDDR4X');
                setRamSpeed(4267);
                setStorageType('MicroSD');
                break;
            case 'rpi4_8gb':
                setOperatingSystem('linux');
                setChipType('arm64');
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(8);
                setCpuCores(4);
                setCpuThreads(4);
                setRamType('LPDDR4');
                setRamSpeed(3200); // Often 2400/3200 depending on rev
                setStorageType('MicroSD');
                break;
            case 'noGPU':
                setOperatingSystem('linux');
                setChipType('intel');
                setGpuEnabled(false);
                setTotalVRAM(0);
                setNumGPUs(1);
                setSystemRAMAmount(32);
                setCpuCores(8);
                setCpuThreads(16);
                setRamType('DDR4');
                setRamSpeed(3200);
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

                // Force CPU mode if no GPU is available
                if (!hasGPU && field === 'mode' && value !== 'cpuOnly') {
                    updatedModel.mode = 'cpuOnly';
                }

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

    // Force CPU mode when GPU is disabled
    useEffect(() => {
        if (!hasGPU) {
            setModels(prev => prev.map(m => ({
                ...m,
                mode: 'cpuOnly',
                gpuLayers: 0
            })));
        }
    }, [hasGPU]);

    const applyPreset = (id, preset) => {
        setModels(prev => prev.map(m => {
            if (m.id !== id) return m;
            let newM = { ...m };

            // If GPU is disabled, force CPU settings regardless of preset intent
            if (!hasGPU) {
                newM.mode = 'cpuOnly';
                newM.gpuLayers = 0;
                if (preset === 'speed') {
                    newM.precision = 'q4_0'; // Faster on CPU
                    newM.contextLength = 2048;
                } else if (preset === 'balance') {
                    newM.precision = 'q4_k_m';
                    newM.contextLength = 4096;
                } else if (preset === 'context') {
                    newM.precision = 'q3_k_m'; // Save RAM for context
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

        const globalOverhead = getMemoryOverhead(gpuList, systemRAMAmount, operatingSystem);
        const gpuUsageDetails = calculatePerGpuUsage(models, gpuList);
        const finalRamTotal = totalRamUsage + (globalOverhead * 0.8);

        // Calculate total VRAM used across all GPUs
        const totalVRAMUsed = hasGPU ? gpuUsageDetails.reduce((acc, gpu) => acc + gpu.used, 0) : 0;
        const totalVRAMAvailable = hasGPU ? gpuList.reduce((acc, gpu) => acc + gpu.vram, 0) : 0;

        // Base performance multiplier (hardware-based)
        const basePerformance = getPerformanceMultiplier(
            numGPUs,
            isUnified,
            operatingSystem,
            chipType,
            cpuCores,
            cpuThreads,
            totalVRAMAvailable,
            inferenceSoftware
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
    }, [models, gpuList, systemRAMAmount, isUnified, operatingSystem, chipType, cpuCores, cpuThreads, numGPUs, ramSpeed, ramClRating, storageType, showDetailedSpecs, hasGPU, inferenceSoftware]);

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
        <div className="min-h-screen bg-slate-900 text-white p-2 sm:p-4 font-sans relative overflow-hidden">
            {/* Circuit Board Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(45, 212, 191, 0.15) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
            }}></div>
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
                        <p className="text-slate-400 text-sm mt-1 ml-1">
                            {isUnified ? 'Unified Memory' : `Discrete GPU (${numGPUs}x)`} | {operatingSystem} | {ramSpeed} MHz
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0 flex-wrap justify-center">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700 shadow-lg">
                            <span className="text-xs font-medium text-slate-400">Hardware</span>
                            <div className="flex items-center gap-1">
                                <select
                                    value={selectedPresetId}
                                    onChange={(e) => applyHardwarePreset(e.target.value)}
                                    className="bg-slate-900 text-teal-400 text-xs font-bold rounded px-2 py-1 border border-slate-600 focus:outline-none focus:border-teal-500 max-w-[150px]"
                                >
                                    <option value="" disabled>Select Preset...</option>
                                    {customPresets.length > 0 && (
                                        <optgroup label="User Presets">
                                            {customPresets.map(p => (
                                                <option key={p.id} value={p.id}>{p.label}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                    {hardwarePresets.map(group => (
                                        <optgroup key={group.group} label={group.group}>
                                            {group.options.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <button
                                    onClick={saveCustomPreset}
                                    className="p-1 bg-slate-700 hover:bg-slate-600 rounded border border-slate-600 text-slate-300 hover:text-white transition-colors"
                                    title="Save Current Config as Preset"
                                >
                                    <Save className="w-3 h-3" />
                                </button>
                                {selectedPresetId.startsWith('custom_') && (
                                    <button
                                        onClick={() => deleteCustomPreset(selectedPresetId)}
                                        className="p-1 bg-red-900/30 hover:bg-red-900/50 rounded border border-red-900/50 text-red-400 hover:text-red-300 transition-colors"
                                        title="Delete Selected Preset"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleAutoDetect}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg border border-purple-500 shadow-lg text-white text-xs font-bold transition-all"
                            title="Auto-detect hardware using browser APIs"
                        >
                            <span>🔍</span> Auto-Detect
                        </button>
                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700 shadow-lg">
                            <span className="text-xs font-medium text-slate-400">Software</span>
                            <select
                                value={inferenceSoftware}
                                onChange={(e) => setInferenceSoftware(e.target.value)}
                                className="bg-slate-900 text-teal-400 text-xs font-bold rounded px-2 py-1 border border-slate-600 focus:outline-none focus:border-teal-500"
                            >
                                <option value="ollama">Ollama</option>
                                <option value="llama.cpp">Llama.cpp</option>
                                <option value="lmstudio">LM Studio</option>
                                <option value="vllm">vLLM</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700 shadow-lg">
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

                        <div className="flex gap-2">
                            <button onClick={saveConfig} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors shadow-lg" title="Save Config">
                                <Save className="w-4 h-4" />
                            </button>
                            <button onClick={loadConfig} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors shadow-lg" title="Load Config">
                                <Upload className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Full Width Results Panel */}
                <div className="mb-8">
                    <ResultsPanel
                        calculations={calculations}
                        gpuList={gpuList}
                        systemRAMAmount={systemRAMAmount}
                        isUnified={isUnified}
                        cpuCores={cpuCores}
                        cpuThreads={cpuThreads}
                        gpuEnabled={gpuEnabled}
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1 space-y-6">
                        {viewMode === 'advanced' ? (
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
                                isUnified={isUnified} hasGPU={hasGPU}
                                gpuEnabled={gpuEnabled} setGpuEnabled={setGpuEnabled}
                                mismatchedEnabled={mismatchedEnabled} setMismatchedEnabled={setMismatchedEnabled}
                                gpuList={gpuList} updateGpu={updateGpu} addGpu={addGpu} removeGpu={removeGpu}
                                cpuCores={cpuCores} setCpuCores={setCpuCores}
                                cpuThreads={cpuThreads} setCpuThreads={setCpuThreads}
                            />
                        ) : (
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
                                inferenceSoftware,
                                gpuEnabled
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VRAMVisualizerV5;
