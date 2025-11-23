import { precisionBits } from './constants';

export const parseNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

export const getLayerSizeGB = (model) => {
    const bits = precisionBits[model.precision] || 4;
    const bytesPerParam = bits / 8;
    // modelSize is in Billions
    const totalWeights = (model.modelSize * 1e9 * bytesPerParam) / (1024 ** 3);
    return totalWeights / model.numLayers;
};

export const getKVCachePerLayerGB = (model) => {
    const kvBytes = (precisionBits[model.kvCachePrecision] || 16) / 8;
    return (2 * model.contextLength * model.hiddenSize * model.batchSize * kvBytes) / (1024 ** 3);
};

export const getActivationPerLayerGB = (model) => {
    // Batch size * Hidden size * 4 bytes (fp32 usually for activations) * 4 (overhead factor approximation)
    return (model.batchSize * model.hiddenSize * 4 * 4) / (1024 ** 3);
};

export const getMemoryOverhead = (gpuList, systemRAMAmount, operatingSystem) => {
    let baseOverhead = 1.0; // Default

    if (operatingSystem === 'windows') {
        // Windows is heavier on RAM and VRAM
        baseOverhead = 2.5 + (systemRAMAmount * 0.05);
    } else if (operatingSystem === 'macos') {
        // macOS uses significant RAM for the OS + Unified Memory management
        baseOverhead = 3.0 + (systemRAMAmount * 0.02);
    } else {
        // Linux is generally lighter
        baseOverhead = 0.8 + (systemRAMAmount * 0.01);
    }

    return baseOverhead;
};

export const getOffloadSpeedFactor = (ramSpeed, ramClRating, storageType, showDetailedSpecs) => {
    const baseRamFactor = (ramSpeed / 3200);
    const clAdjustment = Math.min(1.2, 16 / ramClRating);
    const ramFactor = showDetailedSpecs ? (baseRamFactor * clAdjustment) : 1.0;

    const storageSpeedMap = {
        'HDD': 0.1,
        'SATA': 0.5,
        'NVMeGen3': 0.8,
        'NVMeGen4': 1.0,
        'NVMeGen5': 1.3,
        'MicroSD': 0.05
    };
    const storageFactor = showDetailedSpecs ? (storageSpeedMap[storageType] || 1.0) : 1.0;

    return (ramFactor * storageFactor);
};

// Performance multipliers based on hardware configuration
export const getPerformanceMultiplier = (
    numGPUs,
    isUnified,
    operatingSystem,
    chipType,
    cpuCores = 8,
    cpuThreads = 16,
    totalVRAM = 0,
    inferenceSoftware = 'ollama'
) => {
    let multiplier = 1.0;

    // CPU-only mode (no GPU)
    if (totalVRAM === 0) {
        // Thread efficiency: optimal is ~1.5x cores
        const optimalThreads = cpuCores * 1.5;
        const threadEfficiency = Math.min(1.0, optimalThreads / Math.max(1, cpuThreads));

        // Base CPU multiplier: 0.05x - 0.2x (much slower than GPU)
        let baseCPUMultiplier = 0.1;

        // Architecture adjustments
        if (chipType === 'arm64' && operatingSystem !== 'macos') {
            // Raspberry Pi / Generic ARM is significantly slower than desktop x86
            baseCPUMultiplier = 0.02;
        } else if (chipType === 'intel' || chipType === 'amd') {
            // Desktop x86 - check for high core counts
            if (cpuCores >= 12) baseCPUMultiplier = 0.15;
            if (cpuCores >= 16) baseCPUMultiplier = 0.2;
        }

        multiplier = baseCPUMultiplier * threadEfficiency;
        return Math.max(0.01, multiplier);
    }

    // GPU/Hybrid modes
    if (isUnified) {
        if (operatingSystem === 'macos' && chipType === 'appleSilicon') {
            multiplier = 1.2; // Apple Silicon unified memory advantage
        }
    } else {
        // Discrete GPU scaling
        if (numGPUs === 1) {
            multiplier = 1.0;
        } else if (numGPUs === 2) {
            multiplier = 1.8; // Dual GPU with some overhead
        } else if (numGPUs >= 3) {
            multiplier = 1.7 + (numGPUs - 2) * 0.3; // Multi-GPU with diminishing returns
        }
    }

    // Software specific adjustments
    if (inferenceSoftware === 'vllm') {
        multiplier *= 1.2; // Optimized kernels
    } else if (inferenceSoftware === 'lmstudio') {
        multiplier *= 0.95; // GUI overhead
    }

    // OS Overhead for GPU inference
    if (operatingSystem === 'windows') {
        multiplier *= 0.9; // WDDM overhead
    }

    return multiplier;
};

// VRAM Overflow Penalty (GPU memory exceeded, offloading to CPU RAM)
export const getVRAMOverflowPenalty = (usedVRAM, totalVRAM) => {
    if (totalVRAM === 0 || usedVRAM <= totalVRAM) {
        return 1.0; // No penalty
    }

    const overflowRatio = usedVRAM / totalVRAM;

    // PCIe transfer bottleneck penalties
    if (overflowRatio < 1.3) {
        return 0.5; // Minor overflow: 2x slower
    } else if (overflowRatio < 1.8) {
        return 0.2; // Moderate overflow: 5x slower
    } else if (overflowRatio < 2.5) {
        return 0.1; // Heavy overflow: 10x slower
    } else {
        return 0.05; // Extreme overflow: 20x slower (worse than CPU-only)
    }
};

// RAM Overflow Penalty (RAM exceeded, swapping to disk)
export const getRAMOverflowPenalty = (usedRAM, totalRAM) => {
    if (usedRAM <= totalRAM) {
        return 1.0; // No penalty
    }

    const overflowRatio = usedRAM / totalRAM;

    // Disk swap penalties
    if (overflowRatio < 1.2) {
        return 1.0; // Minimal overflow, OS can handle
    } else if (overflowRatio < 1.5) {
        return 0.5; // Partial swap: 2x slower
    } else if (overflowRatio < 2.0) {
        return 0.1; // Heavy swap: 10x slower
    } else {
        return 0.01; // Extreme swap: 100x slower
    }
};

// Context Length Penalty (Longer context = slower attention mechanism)
export const getContextPenalty = (models) => {
    if (!models || models.length === 0) return 1.0;

    // Find maximum context length across all models
    const maxContext = Math.max(...models.map(m => m.contextLength || 2048));

    // Baseline: 4096 tokens = 1.0x
    // Research shows attention complexity impacts performance:
    // - 2048: ~1.0x (baseline)
    // - 4096: ~0.85x
    // - 8192: ~0.65x
    // - 16384: ~0.45x
    // - 32768: ~0.30x
    // - 65536+: ~0.20x

    // Using formula: 1.0 / (1 + (context / 10000)^1.2)
    const penalty = 1.0 / (1.0 + Math.pow(maxContext / 10000, 1.2));

    return Math.max(0.15, penalty); // Minimum 0.15x (6.7x slower at extreme contexts)
};

export const optimizeLayerSplit = (model, gpuList, systemRAMAmount, enforceConstraints) => {
    const layerSize = getLayerSizeGB(model);
    const kvSize = getKVCachePerLayerGB(model);
    const actSize = getActivationPerLayerGB(model);
    const vramPerLayer = layerSize + kvSize + actSize;

    // Reserve VRAM per GPU for display/overhead
    const reservedPerGpu = 0.5;

    let newGpuLayers = model.gpuLayers;
    let newCpuLayers = model.cpuLayers;

    if (model.mode === 'gpuOnly') {
        newGpuLayers = model.numLayers;
        newCpuLayers = 0;
    } else if (model.mode === 'cpuOnly') {
        newGpuLayers = 0;
        newCpuLayers = model.numLayers;
    } else if (model.mode === 'hybrid') {
        if (enforceConstraints) {
            let totalLayersFitting = 0;

            // Sequential allocation simulation
            gpuList.forEach(gpu => {
                const available = Math.max(0, gpu.vram - reservedPerGpu);
                const layersOnThisGpu = Math.floor(available / vramPerLayer);
                totalLayersFitting += layersOnThisGpu;
            });

            newGpuLayers = Math.min(model.numLayers, totalLayersFitting);
            newCpuLayers = model.numLayers - newGpuLayers;
        } else if (!model.gpuLayers && !model.cpuLayers) {
            // Default balanced split if undefined
            newGpuLayers = Math.floor(model.numLayers / 2);
        }

        // Always ensure CPU layers are consistent with GPU layers in hybrid mode
        newCpuLayers = Math.max(0, model.numLayers - newGpuLayers);
    }

    return { ...model, gpuLayers: newGpuLayers, cpuLayers: newCpuLayers };
};

export const calculatePerGpuUsage = (models, gpuList) => {
    // Initialize usage per GPU
    const gpuUsage = gpuList.map(gpu => ({
        id: gpu.id,
        name: gpu.name,
        vram: gpu.vram,
        used: 0,
        layers: 0,
        weights: 0,
        kv: 0,
        act: 0
    }));

    models.forEach(model => {
        const layerSize = getLayerSizeGB(model);
        const kvSize = getKVCachePerLayerGB(model);
        const actSize = getActivationPerLayerGB(model);
        const vramPerLayer = layerSize + kvSize + actSize;

        let remainingLayers = model.gpuLayers;

        // Sequential allocation
        for (let i = 0; i < gpuUsage.length; i++) {
            if (remainingLayers <= 0) break;

            const gpu = gpuUsage[i];
            const available = Math.max(0, gpu.vram - gpu.used - 0.5); // 0.5GB reserved
            const maxLayers = Math.floor(available / vramPerLayer);

            const layersToAlloc = Math.min(remainingLayers, maxLayers);

            if (layersToAlloc > 0) {
                gpu.layers += layersToAlloc;
                gpu.weights += layersToAlloc * layerSize;
                gpu.kv += layersToAlloc * kvSize;
                gpu.act += layersToAlloc * actSize;
                gpu.used += layersToAlloc * vramPerLayer;
                remainingLayers -= layersToAlloc;
            }
        }
    });

    return gpuUsage;
};
