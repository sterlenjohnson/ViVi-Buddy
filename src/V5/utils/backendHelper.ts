// @ts-nocheck
// @ts-nocheck
// Helper function for backend recommendations
const getBackendRecommendation = (hardware, backend) => {
    const os = hardware.operatingSystem;
    const chip = hardware.chipType;
    const isIntelMac = os === 'macos' && chip === 'intel';

    if (backend === 'auto') {
        if (os === 'macos' && chip === 'appleSilicon') return '✓ Will use Metal (optimal for Apple Silicon)';
        if (isIntelMac) return '⚠ Will likely use CPU or Vulkan (if AMD eGPU)';
        if (os === 'linux') return '✓ Will detect CUDA/ROCm/Vulkan';
        return '✓ Will auto-detect best backend';
    }
    if (backend === 'cuda') return 'NVIDIA GPUs on Linux/Windows. ~10% faster than Vulkan.';
    if (backend === 'metal') {
        if (chip === 'appleSilicon') return '✓ Optimal for M1/M2/M3/M4 chips';
        if (isIntelMac) return '⚠ Poor performance on Intel Macs. Use Vulkan.';
        return '✗ macOS only';
    }
    if (backend === 'vulkan') {
        if (isIntelMac) return '✓ Best for Intel Mac with AMD eGPU';
        return '✓ Works on NVIDIA/AMD/Intel GPUs. Universal compatibility.';
    }
    if (backend === 'rocm') return 'AMD GPUs on Linux. Optimal for RDNA3 (RX 7000).';
    if (backend === 'sycl') return 'Intel GPUs. Requires Intel oneAPI toolkit.';
    return '';
};

export default getBackendRecommendation;
