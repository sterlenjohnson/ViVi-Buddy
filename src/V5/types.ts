export interface GPU {
    id: string | number;
    brand?: string;
    name: string;
    vram: number;
    [key: string]: any; // Allow other properties for now
}

export interface Hardware {
    operatingSystem: string;
    chipType: string;
    gpuVendor: string;
    gpuList: GPU[];
    inferenceSoftware: string;
    gpuEnabled?: boolean;
    [key: string]: any; // Allow other properties
}

export interface Model {
    id: number;
    name: string;
    mode: string;
    precision: string;
    kvCachePrecision: string;
    contextLength: number;
    batchSize: number;
    flashAttention: boolean;
    numLayers: number;
    gpuLayers: number;
    modelSize: number;
    hiddenSize?: number;
    useKVF16?: boolean;
    useMmap?: boolean;
    useMlock?: boolean;
    ropeFrequencyBase?: number;
    ropeFrequencyScale?: number;
    numThreads?: number;
    gpuBackend?: string;
    cpuLayers?: number;
    useSystemRAM?: boolean;
    [key: string]: any; // Allow other properties
}
