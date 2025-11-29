import { Model } from '../types';

export const colorMap: Record<string, string> = {
    blue: '#3b82f6',     // Model Weights (GPU)
    purple: '#8b5cf6',   // KV Cache
    cyan: '#06b6d4',     // Activations
    orange: '#f97316',   // Overhead
    indigo: '#6366f1',   // Optimization
    emerald: '#10b981',  // System RAM
    red: '#ef4444',      // Warning
    green: '#22c5e5',    // Good status
    yellow: '#f59e0b',
    slate: '#64748b',
    teal: '#14b8a6'
};

export const precisionBits: Record<string, number> = {
    'fp32': 32,
    'fp16': 16,
    'bf16': 16,
    'q8_0': 8.5, // GGUF approximations
    'q6_k': 6.6,
    'q5_k_m': 5.7,
    'q4_k_m': 4.8,
    'q4_0': 4.5,
    'q3_k_m': 3.9,
    'q2_k': 2.6,
    'int8': 8,
    'int4': 4
};

export const defaultModel: Model = {
    id: 1,
    name: 'Model 1',
    modelSize: 7,
    precision: 'q4_k_m',
    contextLength: 4096,
    kvCachePrecision: 'fp16',
    batchSize: 1,
    numLayers: 32,
    hiddenSize: 4096,
    gpuLayers: 32,
    cpuLayers: 0,
    useSystemRAM: false,
    mode: 'hybrid',
    flashAttention: false,
    // LM Studio specific settings
    useKVF16: true,           // KV cache in FP16 (reduces memory)
    useMmap: true,            // Memory-mapped file access
    useMlock: false,          // Prevent swapping to disk
    ropeFrequencyBase: 10000, // RoPE scaling base
    ropeFrequencyScale: 1.0,  // RoPE scaling factor
    numThreads: 0,            // 0 = auto-detect
    // llama.cpp GPU backend
    gpuBackend: 'auto',       // auto, cuda, metal, vulkan, rocm, sycl
};
