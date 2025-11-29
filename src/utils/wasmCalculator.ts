/**
 * WebAssembly Performance Calculator
 * High-performance calculations using AssemblyScript/WASM
 */

interface WasmExports {
    memory: WebAssembly.Memory;
    calculateVRAM(paramCount: number, bitsPerWeight: number, contextLength: number, batchSize: number): number;
    calculatePerformance(bandwidth: number, modelSizeGB: number, cpuFactor: number): number;
    batchCalculatePerformance(bandwidth: number, paramCount: number, minBits: number, maxBits: number, step: number, resultsPtr: number): number;
    calculateOffloadBandwidth(gpuBandwidth: number, ramBandwidth: number, gpuLayers: number, totalLayers: number): number;
    isOutOfMemory(modelSizeGB: number, vramGB: number, systemRAMGB: number, allowOffload: boolean): number;
    getCPUFactor(generation: number, coreCount: number, isHighEnd: boolean): number;
    __new(size: number, classId: number): number;
    __release(ptr: number): void;
}

let wasmModule: WasmExports | null = null;
let isLoading: boolean = false;
let loadPromise: Promise<WasmExports | null> | null = null;

/**
 * Load the WASM module (call once at app startup)
 */
export async function initWASM(): Promise<WasmExports | null> {
    if (wasmModule) return wasmModule;
    if (isLoading && loadPromise) return loadPromise;

    isLoading = true;
    loadPromise = (async () => {
        try {
            const response = await fetch('/build/release.wasm');
            const buffer = await response.arrayBuffer();
            const compiled = await WebAssembly.compile(buffer);
            const instance = await WebAssembly.instantiate(compiled, {
                env: {
                    abort: () => console.error('WASM abort called'),
                },
            });

            wasmModule = instance.exports as unknown as WasmExports;
            console.log('✅ WASM Performance Module loaded');
            return wasmModule;
        } catch (error) {
            console.warn('⚠️ WASM failed to load, falling back to JS:', error);
            return null;
        } finally {
            isLoading = false;
        }
    })();

    return loadPromise;
}

/**
 * Calculate VRAM usage
 */
export function calculateVRAM(paramCount: number, bitsPerWeight: number, contextLength: number = 4096, batchSize: number = 1): number {
    if (wasmModule?.calculateVRAM) {
        return wasmModule.calculateVRAM(paramCount, bitsPerWeight, contextLength, batchSize);
    }

    // Fallback JS implementation
    const modelSize = (paramCount * bitsPerWeight) / 8.0;
    const kvCache = (paramCount * contextLength * batchSize * 0.000002);
    const activations = modelSize * 0.05;
    return modelSize + kvCache + activations;
}

/**
 * Calculate inference performance (tokens/sec)
 */
export function calculatePerformance(bandwidth: number, modelSizeGB: number, cpuFactor: number = 1.0): number {
    if (wasmModule?.calculatePerformance) {
        return wasmModule.calculatePerformance(bandwidth, modelSizeGB, cpuFactor);
    }

    // Fallback JS implementation
    if (modelSizeGB <= 0) return 0;
    let tps = bandwidth / modelSizeGB;
    if (cpuFactor < 1.0) tps *= cpuFactor;
    return Math.max(0, Math.min(1000, tps));
}

interface PerformanceResult {
    bits: number;
    modelSize: number;
    tps: number;
}

/**
 * Batch calculate performance curve for graphing
 */
export function batchCalculatePerformance(bandwidth: number, paramCount: number, minBits: number = 2, maxBits: number = 16, step: number = 0.5): PerformanceResult[] {
    if (wasmModule?.batchCalculatePerformance) {
        // Pre-allocate Float64Array for results
        const numResults = Math.ceil((maxBits - minBits) / step) + 1;
        const resultsPtr = wasmModule.__new(numResults * 3 * 8, 1); // 3 values per result, 8 bytes each
        const resultsArray = new Float64Array(
            wasmModule.memory.buffer,
            resultsPtr,
            numResults * 3
        );

        const count = wasmModule.batchCalculatePerformance(
            bandwidth,
            paramCount,
            minBits,
            maxBits,
            step,
            resultsPtr
        );

        // Convert to JS array
        const results: PerformanceResult[] = [];
        for (let i = 0; i < count; i++) {
            results.push({
                bits: resultsArray[i * 3],
                modelSize: resultsArray[i * 3 + 1],
                tps: resultsArray[i * 3 + 2],
            });
        }

        wasmModule.__release(resultsPtr);
        return results;
    }

    // Fallback JS implementation
    const results: PerformanceResult[] = [];
    for (let bits = minBits; bits <= maxBits; bits += step) {
        const modelSize = (paramCount * bits) / 8.0;
        const tps = calculatePerformance(bandwidth, modelSize, 1.0);
        results.push({ bits, modelSize, tps });
    }
    return results;
}

/**
 * Calculate effective bandwidth with offloading
 */
export function calculateOffloadBandwidth(gpuBandwidth: number, ramBandwidth: number, gpuLayers: number, totalLayers: number): number {
    if (wasmModule?.calculateOffloadBandwidth) {
        return wasmModule.calculateOffloadBandwidth(gpuBandwidth, ramBandwidth, gpuLayers, totalLayers);
    }

    // Fallback JS implementation
    if (totalLayers <= 0) return gpuBandwidth;
    if (gpuLayers >= totalLayers) return gpuBandwidth;
    if (gpuLayers <= 0) return ramBandwidth;

    const gpuRatio = gpuLayers / totalLayers;
    const ramRatio = 1.0 - gpuRatio;

    // Harmonic mean (bottleneck model)
    return 1.0 / ((gpuRatio / gpuBandwidth) + (ramRatio / ramBandwidth));
}

/**
 * Check if configuration is out of memory
 */
export function isOutOfMemory(modelSizeGB: number, vramGB: number, systemRAMGB: number, allowOffload: boolean = false): boolean {
    if (wasmModule?.isOutOfMemory) {
        return wasmModule.isOutOfMemory(modelSizeGB, vramGB, systemRAMGB, allowOffload) === 1;
    }

    // Fallback JS implementation
    if (modelSizeGB <= vramGB) return false;
    if (allowOffload && modelSizeGB <= (vramGB + systemRAMGB)) return false;
    return true;
}

/**
 * Get CPU performance factor
 */
export function getCPUFactor(generation: number, coreCount: number, isHighEnd: boolean = false): number {
    if (wasmModule?.getCPUFactor) {
        return wasmModule.getCPUFactor(generation, coreCount, isHighEnd);
    }

    // Fallback JS implementation
    let baseFactor = 0.15;

    if (generation >= 1 && generation <= 5) {
        if (generation === 5) baseFactor = 0.45;
        else if (generation === 4) baseFactor = 0.40;
        else if (generation === 3) baseFactor = 0.35;
        else if (generation === 2) baseFactor = 0.28;
        else baseFactor = 0.22;
    } else if (generation >= 10 && generation <= 15) {
        if (generation >= 13) baseFactor = 0.42;
        else if (generation >= 12) baseFactor = 0.38;
        else baseFactor = 0.30;
    }

    let coreBonus = 0.0;
    if (coreCount >= 16) coreBonus = 0.10;
    else if (coreCount >= 12) coreBonus = 0.07;
    else if (coreCount >= 8) coreBonus = 0.05;
    else if (coreCount >= 6) coreBonus = 0.03;

    const skuBonus = isHighEnd ? 0.05 : 0.0;

    return Math.max(0.1, Math.min(1.0, baseFactor + coreBonus + skuBonus));
}

/**
 * Check if WASM is available
 */
export function isWASMAvailable(): boolean {
    return wasmModule !== null;
}

const wasmCalculator = {
    initWASM,
    calculateVRAM,
    calculatePerformance,
    batchCalculatePerformance,
    calculateOffloadBandwidth,
    isOutOfMemory,
    getCPUFactor,
    isWASMAvailable,
};

export default wasmCalculator;
