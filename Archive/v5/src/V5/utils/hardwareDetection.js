/**
 * Auto-detect hardware using browser APIs
 * Note: Some APIs have limited browser support and privacy restrictions
 */

/**
 * Detect system RAM (approximate)
 * Uses Device Memory API - returns power-of-2 values
 */
export const detectRAM = () => {
    if ('deviceMemory' in navigator) {
        // Returns approximate GB (0.25, 0.5, 1, 2, 4, 8, 16...)
        const detectedGB = navigator.deviceMemory;
        return Math.max(4, detectedGB); // Minimum 4GB for LLMs
    }
    return null; // Could not detect
};

/**
 * Detect CPU cores
 */
export const detectCPUCores = () => {
    if ('hardwareConcurrency' in navigator) {
        // Returns logical processor count (includes hyperthreading)
        return navigator.hardwareConcurrency || 8;
    }
    return 8; // Default fallback
};

/**
 * Detect GPU information (limited)
 * WebGL provides some GPU info but is heavily obfuscated for privacy
 */
export const detectGPU = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            return {
                detected: false,
                vendor: 'unknown',
                renderer: 'unknown',
                hasGPU: false
            };
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

            // Try to infer VRAM (very approximate - often not possible)
            // This is just a heuristic based on renderer string
            let estimatedVRAM = null;
            const rendererLower = renderer.toLowerCase();

            // NVIDIA patterns
            if (rendererLower.includes('rtx 4090')) estimatedVRAM = 24;
            else if (rendererLower.includes('rtx 3090') || rendererLower.includes('rtx 4080')) estimatedVRAM = 24;
            else if (rendererLower.includes('rtx 4070')) estimatedVRAM = 12;
            else if (rendererLower.includes('rtx 3060')) estimatedVRAM = 12;
            else if (rendererLower.includes('rtx 4060')) estimatedVRAM = 8;

            // AMD patterns
            else if (rendererLower.includes('7900 xtx')) estimatedVRAM = 24;
            else if (rendererLower.includes('7900 xt')) estimatedVRAM = 20;
            else if (rendererLower.includes('6800 xt') || rendererLower.includes('6900 xt')) estimatedVRAM = 16;

            // Intel Arc
            else if (rendererLower.includes('arc a770')) estimatedVRAM = 16;
            else if (rendererLower.includes('arc a750')) estimatedVRAM = 8;

            // Apple Silicon detection
            else if (rendererLower.includes('apple')) {
                // Cannot determine VRAM as it's unified memory
                estimatedVRAM = null; // Will be handled by RAM detection
            }

            return {
                detected: true,
                vendor,
                renderer,
                estimatedVRAM,
                hasGPU: true,
                isNVIDIA: vendor.toLowerCase().includes('nvidia'),
                isAMD: vendor.toLowerCase().includes('amd') || vendor.toLowerCase().includes('ati'),
                isIntel: vendor.toLowerCase().includes('intel'),
                isApple: vendor.toLowerCase().includes('apple')
            };
        }

        return {
            detected: true,
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            hasGPU: true,
            estimatedVRAM: null
        };
    } catch (e) {
        console.warn('GPU detection failed:', e);
        return {
            detected: false,
            hasGPU: false
        };
    }
};

/**
 * Detect Operating System
 */
export const detectOS = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/Mac|iPhone|iPad|iPod/.test(userAgent)) {
        return 'macos';
    }
    if (/Win/.test(userAgent)) {
        return 'windows';
    }
    if (/Linux/.test(userAgent)) {
        return 'linux';
    }

    return 'unknown';
};

/**
 * Detect chip type (Apple Silicon vs Intel vs AMD)
 */
export const detectChipType = () => {
    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';

    // Check for Apple Silicon
    if (platform === 'MacIntel') {
        // M1/M2/M3 Macs still report as Intel in user agent
        // We need to check max touch points as a heuristic
        // or check for specific features

        // More reliable: check WebGL renderer
        const gpuInfo = detectGPU();
        if (gpuInfo.isApple) {
            return 'appleSilicon';
        }
        return 'intel'; // Intel Mac
    }

    if (platform.includes('ARM') || userAgent.includes('ARM')) {
        return 'arm64';
    }

    if (userAgent.includes('AMD') || platform.includes('AMD')) {
        return 'amd';
    }

    return 'intel'; // Default to Intel for x86/x64
};

/**
 * Full auto-detection
 */
export const autoDetectHardware = () => {
    const ram = detectRAM();
    const cpuCores = detectCPUCores();
    const gpuInfo = detectGPU();
    const os = detectOS();
    const chipType = detectChipType();

    // Determine if unified memory (Apple Silicon)
    const isUnified = os === 'macos' && chipType === 'appleSilicon';

    return {
        systemRAM: ram,
        cpuCores,
        cpuThreads: cpuCores, // Estimate threads = cores for now
        gpu: gpuInfo,
        estimatedVRAM: gpuInfo.estimatedVRAM,
        operatingSystem: os,
        chipType,
        isUnified,
        detectionMethod: {
            ram: ram !== null ? 'Navigator.deviceMemory' : 'Not detected',
            cpu: 'Navigator.hardwareConcurrency',
            gpu: gpuInfo.detected ? 'WebGL' : 'Not detected',
            os: 'Navigator.userAgent',
            chip: 'Platform detection'
        }
    };
};

/**
 * Get detection confidence level
 */
export const getDetectionConfidence = (autoDetected) => {
    let confidence = 0;
    let total = 0;

    if (autoDetected.systemRAM !== null) { confidence++; total++; }
    else total++;

    if (autoDetected.cpuCores > 0) { confidence++; total++; }
    else total++;

    if (autoDetected.gpu.detected) { confidence++; total++; }
    else total++;

    if (autoDetected.estimatedVRAM) { confidence++; total++; }
    else total++;

    const percentage = (confidence / total) * 100;

    return {
        percentage: Math.round(percentage),
        level: percentage >= 75 ? 'High' : percentage >= 50 ? 'Medium' : 'Low',
        confidence,
        total
    };
};

export default {
    detectRAM,
    detectCPUCores,
    detectGPU,
    detectOS,
    detectChipType,
    autoDetectHardware,
    getDetectionConfidence
};
