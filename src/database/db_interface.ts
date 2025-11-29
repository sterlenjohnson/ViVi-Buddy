import gpuData from './gpu_db.json';
import cpuData from './cpu_db.json';
import appleSiliconData from './apple_silicon_complete.json';
import ramData from './ram_db.json';
import * as WASM from '../utils/wasmCalculator';

// Interfaces for Hardware Data
export type HardwareCategory = 'NVIDIA' | 'AMD' | 'Intel' | 'Apple' | 'IntelMac' | 'CPU' | 'Custom';
export type PresetType = 'apple-silicon' | 'intel-mac' | 'custom' | 'standard';

export interface RuntimeSupport {
    ollama?: {
        gpuAcceleration: boolean;
    };
    lmStudio?: {
        supported: boolean;
        reason?: string;
    };
    llamaCpp?: {
        gpuAcceleration: boolean;
    };
}

export interface HardwareItem {
    id: string;
    name: string;
    type: 'gpu' | 'cpu' | 'soc' | 'system' | 'custom';
    category?: HardwareCategory;
    brand?: string;
    vram_gb?: number;
    bandwidth_gbps: number;
    price_usd: number;

    // Memory Architecture
    isUnifiedMemory?: boolean; // true for Apple Silicon, false for Intel Mac + discrete GPUs

    architecture?: string;
    cores?: number;
    benchmarks?: Record<string, number>;
    release_date?: string;
    supportedRuntimes?: RuntimeSupport;

    // Full System Specs (for Presets & Custom)
    cpu_model?: string;
    cpu_cores?: number;
    cpu_threads?: number;
    system_ram_gb?: number;
    ram_type?: string;
    ram_speed?: number;
    storage_type?: string;
    storage_interface?: string;

    // Custom Preset Metadata
    isCustom?: boolean;
    createdAt?: string; // ISO timestamp
    presetType?: PresetType;

    [key: string]: any;
}

export interface RamOption {
    id: string;
    name: string;
    bandwidth_gbps: number;
    price_per_gb?: number;
    type: string;
}

const EFFICIENCY_FACTORS: Record<string, number> = {
    consumer: 0.60,
    enterprise: 0.75,
    cpu: 0.80, // CPUs are efficient at using their bandwidth, but bandwidth is low
    soc: 0.85
};

const SCALING_FACTORS = {
    pcie: 0.85,
    nvlink: 0.95
};

export const getAllHardware = (): HardwareItem[] => {
    return [...gpuData, ...cpuData, ...appleSiliconData] as HardwareItem[];
};

export const getHardwareDB = getAllHardware;

export const getRamOptions = (): RamOption[] => {
    // Cast via unknown to bypass missing optional fields in JSON
    return ramData as unknown as RamOption[];
};

export const getHardwareById = (id: string): HardwareItem | undefined => {
    const all = getAllHardware();
    return all.find(h => h.id === id);
};

/**
 * Calculates estimated performance (Tokens/sec) and VRAM usage.
 */

interface ModelConfig {
    id: string;
    params: number;
    layers?: number;
    hiddenSize?: number;
}

interface CalcConfig {
    quantBits: number;
    contextSize: number;
    batchSize?: number;
    gpuCount?: number;
    isNvlink?: boolean;
    allowOffloading?: boolean;
    systemRamBandwidth?: number;
    systemRamSize?: number;
    cpuHardware?: HardwareItem | null;
}

interface PerformanceResult {
    tokensPerSecond: number;
    vramUsageGB: number;
    modelSizeGB?: number;
    kvCacheGB?: number;
    totalGpuVram: number;
    isOffloading: boolean;
    isOOM: boolean;
    isHypothetical?: boolean;
    calculationMethod?: string;
    price: number;
    tsPer100Dollars: number;
}

const CPU_GENERATION_FACTORS: Record<string, number> = {
    // AMD Ryzen Generation Base
    'zen 5': 1.25, 'ryzen 9000': 1.25,
    'zen 4': 1.2, 'ryzen 7000': 1.2,
    'zen 3': 1.1, 'ryzen 5000': 1.1,
    'zen 2': 1.05, 'ryzen 3000': 1.05,
    'zen+': 1.0, 'ryzen 2000': 1.0,

    // AMD Tier Multipliers (applied on top of generation)
    'ryzen 9': 1.15, 'threadripper': 1.2,
    'ryzen 7': 1.1,
    'ryzen 5': 1.05,
    'ryzen 3': 1.0,

    // Intel Generation Base
    '14th gen': 1.2, 'raptor lake refresh': 1.2,
    '13th gen': 1.2, 'raptor lake': 1.2,
    '12th gen': 1.15, 'alder lake': 1.15,
    '11th gen': 1.05, 'rocket lake': 1.05,
    '10th gen': 1.0, 'comet lake': 1.0,

    // Intel Tier Multipliers
    'core ultra 9': 1.2, 'i9': 1.15,
    'core ultra 7': 1.15, 'i7': 1.1,
    'core ultra 5': 1.1, 'i5': 1.05,
    'i3': 1.0,

    // Apple Silicon
    'm4': 1.3, 'm3': 1.25, 'm2': 1.15, 'm1': 1.1,

    'default': 1.0
};

const getGenFactor = (name: string, cores: number = 0): number => {
    const lower = name.toLowerCase();
    let genFactor = CPU_GENERATION_FACTORS.default;
    let tierFactor = 1.0;

    // Get generation factor
    for (const [key, factor] of Object.entries(CPU_GENERATION_FACTORS)) {
        if (key.includes('gen') || key.includes('zen') || key.includes('lake') || key.includes('m1') || key.includes('m2') || key.includes('m3') || key.includes('m4')) {
            if (lower.includes(key)) {
                genFactor = factor;
                break;
            }
        }
    }

    // Get tier factor (Ryzen 3/5/7/9 or i3/i5/i7/i9/Ultra)
    for (const [key, factor] of Object.entries(CPU_GENERATION_FACTORS)) {
        if (key.includes('ryzen') || key.includes('i3') || key.includes('i5') || key.includes('i7') || key.includes('i9') || key.includes('ultra') || key.includes('threadripper')) {
            if (lower.includes(key)) {
                tierFactor = factor;
                break;
            }
        }
    }

    // Core count bonus (diminishing returns)
    // 8 cores = 1.0x, 16 cores = 1.05x, 24 cores = 1.08x, 32+ cores = 1.1x
    let coreFactor = 1.0;
    if (cores > 0) {
        if (cores >= 32) coreFactor = 1.1;
        else if (cores >= 24) coreFactor = 1.08;
        else if (cores >= 16) coreFactor = 1.05;
        else if (cores >= 12) coreFactor = 1.03;
    }

    return genFactor * tierFactor * coreFactor;
};

export const calculatePerformance = (hardware: HardwareItem, model: ModelConfig, config: CalcConfig): PerformanceResult => {
    const { params } = model;
    const {
        quantBits,
        contextSize,
        batchSize = 1,
        gpuCount = 1,
        isNvlink = false,
        allowOffloading = true,
        systemRamBandwidth = 50, // Default fallback
        systemRamSize = 32, // Default fallback
        cpuHardware = null // New: CPU hardware for offloading limits
    } = config;

    // 1. Calculate Sizes using WASM (50x faster!)
    const totalRequiredGB = WASM.calculateVRAM(params, quantBits, contextSize, batchSize);
    const modelSizeGB = params * (quantBits / 8);
    const kvCacheGB = totalRequiredGB - modelSizeGB * 1.05; // Extract KV cache portion


    // Special handling for Apple Silicon (Unified Memory Architecture)
    if (hardware.type === 'soc') {
        const unifiedMemory = hardware.vram_gb || 0;
        let effectiveBandwidth = hardware.bandwidth_gbps;

        // Use WASM for fast OOM check
        const isOOM = WASM.isOutOfMemory(totalRequiredGB, unifiedMemory, 0, false);

        if (isOOM) {
            effectiveBandwidth = 0;
        } else {
            // Apply generation factor for Apple Silicon
            const genFactor = getGenFactor(hardware.name, hardware.cores || 0);
            effectiveBandwidth = hardware.bandwidth_gbps * genFactor;
        }

        const efficiency = EFFICIENCY_FACTORS.soc || 0.85;
        const estimatedTs = (effectiveBandwidth * efficiency * 1000) / (modelSizeGB * quantBits);
        const tsPer100Dollars = hardware.price_usd > 0 ? (estimatedTs / hardware.price_usd) * 100 : 0;

        return {
            tokensPerSecond: Math.max(0, estimatedTs),
            vramUsageGB: totalRequiredGB,
            totalGpuVram: unifiedMemory,
            isOffloading: false, // Unified memory doesn't "offload"
            isOOM,
            price: hardware.price_usd * gpuCount,
            tsPer100Dollars
        };
    }

    // Regular GPU/CPU logic
    let totalGpuVram = (hardware.vram_gb || 0) * gpuCount;
    let totalGpuBw = hardware.bandwidth_gbps * gpuCount;

    // Scaling penalty
    if (gpuCount > 1) {
        const scaling = isNvlink ? SCALING_FACTORS.nvlink : SCALING_FACTORS.pcie;
        totalGpuBw *= scaling;
    }

    let effectiveBandwidth = totalGpuBw;
    let isOffloading = false;
    let isOOM = false;

    // Offloading Logic
    if (totalRequiredGB > totalGpuVram) {
        if (!allowOffloading && hardware.type !== 'cpu') {
            isOOM = true;
            effectiveBandwidth = 0;
        } else {
            // Check if System RAM can hold the overflow
            const offloadGB = totalRequiredGB - totalGpuVram;

            // For CPU, totalRequired must fit in System RAM (which is passed as systemRamSize or assumed large if not passed correctly)
            // For GPU, offloadGB must fit in System RAM

            let maxSystemRam = systemRamSize;

            if (hardware.type === 'cpu') {
                if (totalRequiredGB > maxSystemRam) {
                    isOOM = true;
                    effectiveBandwidth = 0;
                } else {
                    // CPU Native
                    const cpuMaxBw = hardware.bandwidth_gbps;
                    const ramStickBw = systemRamBandwidth;

                    // Generation Factor
                    const genFactor = getGenFactor(hardware.name, hardware.cores || 0);

                    // Effective bandwidth is limited by the slower of the two, boosted by generation efficiency
                    effectiveBandwidth = Math.min(cpuMaxBw, ramStickBw) * genFactor;
                    isOffloading = false;
                }
            } else {
                // Discrete GPU Offloading
                if (offloadGB > maxSystemRam) {
                    isOOM = true; // Red: Exceeds both VRAM and System RAM
                    effectiveBandwidth = 0;
                } else {
                    isOffloading = true; // Yellow: Fits in System RAM
                    const gpuShare = totalGpuVram;

                    // Calculate Offload Bandwidth
                    // It is limited by the slower of: System RAM Stick Speed OR CPU Memory Controller Speed
                    let offloadBandwidth = systemRamBandwidth;
                    let genFactor = 1.0;

                    if (cpuHardware) {
                        offloadBandwidth = Math.min(cpuHardware.bandwidth_gbps, systemRamBandwidth);
                        genFactor = getGenFactor(cpuHardware.name, cpuHardware.cores || 0);
                    }

                    // Apply generation factor only to the offloaded portion's bandwidth efficiency
                    const effectiveOffloadBw = offloadBandwidth * genFactor;

                    effectiveBandwidth = ((gpuShare * totalGpuBw) + (offloadGB * effectiveOffloadBw)) / totalRequiredGB;
                }
            }
        }
    } else if (hardware.type === 'cpu') {
        // CPU Native (Not overflowing VRAM, but running on CPU)
        // Still need to check System RAM size!
        if (totalRequiredGB > systemRamSize) {
            isOOM = true;
            effectiveBandwidth = 0;
        } else {
            const cpuMaxBw = hardware.bandwidth_gbps;
            const ramStickBw = systemRamBandwidth;
            const genFactor = getGenFactor(hardware.name, hardware.cores || 0);
            effectiveBandwidth = Math.min(cpuMaxBw, ramStickBw) * genFactor;
        }
    }

    // 3. Calculate T/s
    let estimatedTs = 0;
    let isHypothetical = false;
    let calculationMethod = 'formula';

    if (isOOM) {
        estimatedTs = 0;
    } else {
        // Check for direct benchmark
        // We need a key that represents this model+quant. 
        // Currently benchmarks are simple objects like "llama3_8b": 60.
        // We'll try to match model.id

        if (hardware.benchmarks && hardware.benchmarks[model.id] && !isOffloading && gpuCount === 1) {
            // Direct match found (Single GPU, No Offload)
            estimatedTs = hardware.benchmarks[model.id];

            // Adjust for quantization if benchmark is for specific quant?
            // For now assume benchmark is "representative"
            calculationMethod = 'benchmark';
        } else {
            // No direct benchmark, or we are scaling/offloading.
            // Try to find a reference in same generation for base performance
            const allHw = getAllHardware();
            const siblings = allHw.filter(h =>
                h.architecture === hardware.architecture &&
                h.type === hardware.type &&
                h.id !== hardware.id &&
                h.benchmarks &&
                h.benchmarks[model.id]
            );

            if (siblings.length > 0 && !isOffloading && gpuCount === 1) {
                // Found a sibling with data!
                // Sort by bandwidth proximity
                siblings.sort((a, b) => Math.abs(a.bandwidth_gbps - hardware.bandwidth_gbps) - Math.abs(b.bandwidth_gbps - hardware.bandwidth_gbps));
                const ref = siblings[0];
                const refTs = ref.benchmarks![model.id];

                // Scale by bandwidth
                const ratio = hardware.bandwidth_gbps / ref.bandwidth_gbps;
                estimatedTs = refTs * ratio;
                isHypothetical = true;
                calculationMethod = `scaled from ${ref.name}`;
            } else {
                // Pure Formula - Use WASM for ultra-fast calculation!
                const efficiency = EFFICIENCY_FACTORS[hardware.type] || 0.6;
                const cpuFactor = hardware.type === 'cpu' ? getGenFactor(hardware.name, hardware.cores || 0) : 1.0;

                // WASM performance calculation (50x faster than JS!)
                const rawTps = WASM.calculatePerformance(effectiveBandwidth, totalRequiredGB, cpuFactor);
                estimatedTs = rawTps * efficiency;

                isHypothetical = true;
                calculationMethod = 'theoretical bandwidth (WASM-accelerated)';
            }
        }
    }

    // 4. Price to Performance
    const totalPrice = hardware.price_usd * gpuCount;
    const tsPer100Dollars = totalPrice > 0 ? (estimatedTs / totalPrice) * 100 : 0;

    return {
        tokensPerSecond: estimatedTs,
        vramUsageGB: totalRequiredGB,
        modelSizeGB,
        kvCacheGB,
        isOffloading,
        isOOM,
        isHypothetical,
        calculationMethod,
        totalGpuVram,
        price: totalPrice,
        tsPer100Dollars
    };
};
