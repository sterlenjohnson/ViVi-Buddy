import React, { useState, useEffect } from 'react';
import { useHardware, type OperatingSystem, type RamType, type StorageType } from '../contexts/HardwareContext';
import { autoDetectHardware, getDetectionConfidence } from '../V5/utils/hardwareDetection';
import { type HardwareItem } from '../database/db_interface';
import { Cpu, Zap, HardDrive, Gauge, Monitor, Sparkles, Search, Server, Laptop, Settings, Lock, Sliders, X } from 'lucide-react';
import cpuDatabase from '../database/cpu_db.json';
import CustomHardwareForm from '../components/CustomHardwareForm';
import { SoftwareRuntimeSelector } from '../components/SoftwareRuntimeSelector';

interface HardwareOption {
    id: string;
    name: string;
    vram_gb?: number;
    bandwidth_gbps?: number;
    category: 'NVIDIA' | 'AMD' | 'Intel' | 'Apple' | 'CPU' | 'IntelMac';
    generation?: string;
    price_usd?: number;
    intelMacCompatible?: boolean; // True for Radeon Pro 5000/W6800X series

    // Memory Architecture
    isUnifiedMemory?: boolean;

    // Intel Mac enforcement
    maxRam?: number;
    enforcedCpu?: string;
    enforcedStorage?: 'nvme_gen3' | 'nvme_gen4' | 'sata' | 'hdd';
    enforcedRamType?: 'ddr4' | 'ddr5';

    // Full System Specs (for Presets)
    cpu_model?: string;
    cpu_cores?: number;
    cpu_threads?: number;
    system_ram_gb?: number;
    ram_type?: string;
    ram_speed?: number;
    storage_type?: string;
    storage_interface?: string;

    // Runtime Support
    supportedRuntimes?: {
        ollama?: { gpuAcceleration: boolean };
        lmStudio?: { supported: boolean; reason?: string };
        llamaCpp?: { gpuAcceleration: boolean };
    };
}

type AnyHardware = HardwareOption | HardwareItem;

const HARDWARE_DATABASE: HardwareOption[] = [
    // NVIDIA RTX 50 Series
    { id: 'rtx_5090', name: 'RTX 5090 32GB', vram_gb: 32, bandwidth_gbps: 1792, category: 'NVIDIA', generation: '50-Series (Blackwell)', price_usd: 1999 },
    { id: 'rtx_5080', name: 'RTX 5080 16GB', vram_gb: 16, bandwidth_gbps: 960, category: 'NVIDIA', generation: '50-Series (Blackwell)', price_usd: 999 },

    // NVIDIA RTX 40 Series
    { id: 'rtx_4090', name: 'RTX 4090 24GB', vram_gb: 24, bandwidth_gbps: 1008, category: 'NVIDIA', generation: '40-Series (Ada)', price_usd: 1599 },
    { id: 'rtx_4080_super', name: 'RTX 4080 Super 16GB', vram_gb: 16, bandwidth_gbps: 736, category: 'NVIDIA', generation: '40-Series (Ada)', price_usd: 999 },
    { id: 'rtx_4070_ti', name: 'RTX 4070 Ti 12GB', vram_gb: 12, bandwidth_gbps: 504, category: 'NVIDIA', generation: '40-Series (Ada)', price_usd: 799 },
    { id: 'rtx_4060_ti_16gb', name: 'RTX 4060 Ti 16GB', vram_gb: 16, bandwidth_gbps: 288, category: 'NVIDIA', generation: '40-Series (Ada)', price_usd: 499 },

    // NVIDIA RTX 30 Series
    { id: 'rtx_3090', name: 'RTX 3090 24GB', vram_gb: 24, bandwidth_gbps: 936, category: 'NVIDIA', generation: '30-Series (Ampere)', price_usd: 1499 },
    { id: 'rtx_3090_ti', name: 'RTX 3090 Ti 24GB', vram_gb: 24, bandwidth_gbps: 1008, category: 'NVIDIA', generation: '30-Series (Ampere)', price_usd: 1999 },
    { id: 'rtx_3060_12gb', name: 'RTX 3060 12GB', vram_gb: 12, bandwidth_gbps: 360, category: 'NVIDIA', generation: '30-Series (Ampere)', price_usd: 329 },

    // NVIDIA RTX 20 Series
    { id: 'rtx_2080_ti', name: 'RTX 2080 Ti 11GB', vram_gb: 11, bandwidth_gbps: 616, category: 'NVIDIA', generation: '20-Series (Turing)', price_usd: 999 },

    // AMD RDNA 3
    { id: 'rx_7900xtx', name: 'RX 7900 XTX 24GB', vram_gb: 24, bandwidth_gbps: 960, category: 'AMD', generation: 'RDNA 3', price_usd: 999 },
    { id: 'rx_7900xt', name: 'RX 7900 XT 20GB', vram_gb: 20, bandwidth_gbps: 800, category: 'AMD', generation: 'RDNA 3', price_usd: 799 },
    { id: 'rx_7800xt', name: 'RX 7800 XT 16GB', vram_gb: 16, bandwidth_gbps: 624, category: 'AMD', generation: 'RDNA 3', price_usd: 499 },
    { id: 'rx_7700xt', name: 'RX 7700 XT 12GB', vram_gb: 12, bandwidth_gbps: 432, category: 'AMD', generation: 'RDNA 3', price_usd: 449 },

    // AMD RDNA 2
    { id: 'rx_6900xt', name: 'RX 6900 XT 16GB', vram_gb: 16, bandwidth_gbps: 512, category: 'AMD', generation: 'RDNA 2', price_usd: 999 },
    { id: 'rx_6800xt', name: 'RX 6800 XT 16GB', vram_gb: 16, bandwidth_gbps: 512, category: 'AMD', generation: 'RDNA 2', price_usd: 649 },

    // Intel Arc
    { id: 'arc_a770', name: 'Arc A770 16GB', vram_gb: 16, bandwidth_gbps: 560, category: 'Intel', generation: 'Arc Alchemist', price_usd: 349 },
    { id: 'arc_a750', name: 'Arc A750 8GB', vram_gb: 8, bandwidth_gbps: 512, category: 'Intel', generation: 'Arc Alchemist', price_usd: 289 },

    // Apple Silicon M5 Series
    { id: 'm5_max_128', name: 'M5 Max 128GB', vram_gb: 128, bandwidth_gbps: 546, category: 'Apple', generation: 'M5 (2025)', isUnifiedMemory: true },

    // Apple Silicon M4 Series
    { id: 'm4_max_128', name: 'M4 Max 128GB', vram_gb: 128, bandwidth_gbps: 546, category: 'Apple', generation: 'M4 (2024-2025)', isUnifiedMemory: true },
    { id: 'm4_pro_64', name: 'M4 Pro 64GB', vram_gb: 64, bandwidth_gbps: 273, category: 'Apple', generation: 'M4 (2024-2025)', isUnifiedMemory: true },

    // Apple Silicon M1 Series (New entries and updated existing ones)
    { id: 'm1_max_32gb', name: 'M1 Max 32GB', category: 'Apple', generation: 'M1', vram_gb: 32, bandwidth_gbps: 400, isUnifiedMemory: true },
    {
        id: 'm1_max_64', name: 'M1 Max 64GB', vram_gb: 64, bandwidth_gbps: 400, category: 'Apple', generation: 'M1 (2020-2021)',
        cpu_model: 'M1 Max (10-core)', cpu_cores: 10, cpu_threads: 10, system_ram_gb: 64, ram_type: 'lpddr5', ram_speed: 6400, storage_type: 'nvme_gen4', storage_interface: 'Soldered', isUnifiedMemory: true
    },
    { id: 'm1_ultra_64gb', name: 'M1 Ultra 64GB', category: 'Apple', generation: 'M1', vram_gb: 64, bandwidth_gbps: 800, isUnifiedMemory: true },
    {
        id: 'm1_ultra_128', name: 'M1 Ultra 128GB', vram_gb: 128, bandwidth_gbps: 800, category: 'Apple', generation: 'M1 (2020-2021)',
        cpu_model: 'M1 Ultra (20-core)', cpu_cores: 20, cpu_threads: 20, system_ram_gb: 128, ram_type: 'lpddr5', ram_speed: 6400, storage_type: 'nvme_gen4', storage_interface: 'Soldered', isUnifiedMemory: true
    },

    // Apple Silicon M3 Series
    {
        id: 'm3_max_128', name: 'M3 Max 128GB', vram_gb: 128, bandwidth_gbps: 400, category: 'Apple', generation: 'M3 (2023-2024)',
        cpu_model: 'M3 Max (16-core)', cpu_cores: 16, cpu_threads: 16, system_ram_gb: 128, ram_type: 'lpddr5', ram_speed: 6400, storage_type: 'nvme_gen4', storage_interface: 'Soldered', isUnifiedMemory: true
    },
    {
        id: 'm3_pro_36', name: 'M3 Pro 36GB', vram_gb: 36, bandwidth_gbps: 150, category: 'Apple', generation: 'M3 (2023-2024)',
        cpu_model: 'M3 Pro (12-core)', cpu_cores: 12, cpu_threads: 12, system_ram_gb: 36, ram_type: 'lpddr5', ram_speed: 6400, storage_type: 'nvme_gen4', storage_interface: 'Soldered'
    },

    // Apple Silicon M2 Series
    {
        id: 'm2_ultra_192', name: 'M2 Ultra 192GB', vram_gb: 192, bandwidth_gbps: 800, category: 'Apple', generation: 'M2 (2022-2023)',
        cpu_model: 'M2 Ultra (24-core)', cpu_cores: 24, cpu_threads: 24, system_ram_gb: 192, ram_type: 'lpddr5', ram_speed: 6400, storage_type: 'nvme_gen4', storage_interface: 'Soldered'
    },
    {
        id: 'm2_max_96', name: 'M2 Max 96GB', vram_gb: 96, bandwidth_gbps: 400, category: 'Apple', generation: 'M2 (2022-2023)',
        cpu_model: 'M2 Max (12-core)', cpu_cores: 12, cpu_threads: 12, system_ram_gb: 96, ram_type: 'lpddr5', ram_speed: 6400, storage_type: 'nvme_gen4', storage_interface: 'Soldered'
    },

    // Apple Silicon M1 Series
    {
        id: 'm1_ultra_128', name: 'M1 Ultra 128GB', vram_gb: 128, bandwidth_gbps: 800, category: 'Apple', generation: 'M1 (2020-2021)',
        cpu_model: 'M1 Ultra (20-core)', cpu_cores: 20, cpu_threads: 20, system_ram_gb: 128, ram_type: 'lpddr5', ram_speed: 6400, storage_type: 'nvme_gen4', storage_interface: 'Soldered'
    },
    {
        id: 'm1_max_64', name: 'M1 Max 64GB', vram_gb: 64, bandwidth_gbps: 400, category: 'Apple', generation: 'M1 (2020-2021)',
        cpu_model: 'M1 Max (10-core)', cpu_cores: 10, cpu_threads: 10, system_ram_gb: 64, ram_type: 'lpddr5', ram_speed: 6400, storage_type: 'nvme_gen4', storage_interface: 'Soldered'
    },

    // Intel Mac System Presets (Combined CPU + GPU + RAM + Storage)
    {
        id: 'mac_pro_2019_w6800x_duo', name: 'Mac Pro 2019 (Xeon W 28-core + W6800X Duo)', category: 'IntelMac', generation: 'Intel Mac',
        vram_gb: 64, bandwidth_gbps: 512,
        cpu_model: 'Intel Xeon W-3275M', cpu_cores: 28, cpu_threads: 56,
        system_ram_gb: 1536, ram_type: 'ddr4', ram_speed: 2933,
        storage_type: 'nvme_gen3', storage_interface: 'PCIe',
        isUnifiedMemory: false,
        supportedRuntimes: { ollama: { gpuAcceleration: false }, lmStudio: { supported: false, reason: 'Not supported on Intel Mac' } },
        enforcedCpu: 'xeon_w_3275m', enforcedStorage: 'nvme_gen3', enforcedRamType: 'ddr4', maxRam: 1536
    },
    {
        id: 'mac_pro_2019_vega_ii', name: 'Mac Pro 2019 (Xeon W 12-core + Vega II)', category: 'IntelMac', generation: 'Intel Mac',
        vram_gb: 32, bandwidth_gbps: 1024,
        cpu_model: 'Intel Xeon W-3235', cpu_cores: 12, cpu_threads: 24,
        system_ram_gb: 96, ram_type: 'ddr4', ram_speed: 2933,
        storage_type: 'nvme_gen3', storage_interface: 'PCIe',
        isUnifiedMemory: false,
        supportedRuntimes: { ollama: { gpuAcceleration: false }, lmStudio: { supported: false, reason: 'Not supported on Intel Mac' } },
        enforcedCpu: 'xeon_w_3235', enforcedStorage: 'nvme_gen3', enforcedRamType: 'ddr4', maxRam: 768
    },
    {
        id: 'imac_27_2020_5700xt', name: 'iMac 27" 2020 (i9-10910 + 5700 XT)', category: 'IntelMac', generation: 'Intel Mac',
        vram_gb: 16, bandwidth_gbps: 448,
        cpu_model: 'Intel Core i9-10910', cpu_cores: 10, cpu_threads: 20,
        system_ram_gb: 128, ram_type: 'ddr4', ram_speed: 2666,
        storage_type: 'nvme_gen3', storage_interface: 'Soldered',
        isUnifiedMemory: false,
        supportedRuntimes: { ollama: { gpuAcceleration: false }, lmStudio: { supported: false, reason: 'Not supported on Intel Mac' } },
        enforcedCpu: 'i9_10910', enforcedStorage: 'nvme_gen3', enforcedRamType: 'ddr4', maxRam: 128
    },
    {
        id: 'mbp_16_2019_5500m', name: 'MacBook Pro 16" 2019 (i9-9980HK + 5500M)', category: 'IntelMac', generation: 'Intel Mac',
        vram_gb: 8, bandwidth_gbps: 192,
        cpu_model: 'Intel Core i9-9980HK', cpu_cores: 8, cpu_threads: 16,
        system_ram_gb: 64, ram_type: 'ddr4', ram_speed: 2666,
        storage_type: 'nvme_gen3', storage_interface: 'Soldered',
        isUnifiedMemory: false,
        supportedRuntimes: { ollama: { gpuAcceleration: false }, lmStudio: { supported: false, reason: 'Not supported on Intel Mac' } },
        enforcedCpu: 'i9_9980hk', enforcedStorage: 'nvme_gen3', enforcedRamType: 'ddr4', maxRam: 64
    },
    {
        id: 'mbp_16_2019_5300m', name: 'MacBook Pro 16" 2019 (i7-9750H + 5300M)', category: 'IntelMac', generation: 'Intel Mac',
        vram_gb: 4, bandwidth_gbps: 192,
        cpu_model: 'Intel Core i7-9750H', cpu_cores: 6, cpu_threads: 12,
        system_ram_gb: 16, ram_type: 'ddr4', ram_speed: 2666,
        storage_type: 'nvme_gen3', storage_interface: 'Soldered',
        isUnifiedMemory: false,
        supportedRuntimes: { ollama: { gpuAcceleration: false }, lmStudio: { supported: false, reason: 'Not supported on Intel Mac' } },
        enforcedCpu: 'i7_9750h', enforcedStorage: 'nvme_gen3', enforcedRamType: 'ddr4', maxRam: 64
    },
    {
        id: 'mbp_16_2019_5600m', name: 'MacBook Pro 16" 2019 (i9-9980HK + 5600M HBM2)', category: 'IntelMac', generation: 'Intel Mac',
        vram_gb: 8, bandwidth_gbps: 394,
        cpu_model: 'Intel Core i9-9980HK', cpu_cores: 8, cpu_threads: 16,
        system_ram_gb: 64, ram_type: 'ddr4', ram_speed: 2666,
        storage_type: 'nvme_gen3', storage_interface: 'Soldered',
        isUnifiedMemory: false,
        supportedRuntimes: { ollama: { gpuAcceleration: false }, lmStudio: { supported: false, reason: 'Not supported on Intel Mac' } },
        enforcedCpu: 'i9_9980hk', enforcedStorage: 'nvme_gen3', enforcedRamType: 'ddr4', maxRam: 64
    },

    // CPUs
    { id: 'ryzen9_7950x', name: 'Ryzen 9 7950X (16C/32T)', category: 'CPU', generation: 'Zen 4' },
    { id: 'i9_14900k', name: 'Intel Core i9-14900K (24C/32T)', category: 'CPU', generation: 'Raptor Lake' },
    { id: 'threadripper_7995wx', name: 'Threadripper PRO 7995WX (96C/192T)', category: 'CPU', generation: 'Zen 4' },
];

// Simple icon component for macOS command key
const CommandIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
);

const HardwareConfigPage: React.FC = () => {
    const {
        selectedHardwareId,
        setSelectedHardwareId,
        selectedCpuId,
        setSelectedCpuId,
        gpuCount,
        setGpuCount,
        isNvlink,
        setIsNvlink,
        operatingSystem,
        setOperatingSystem,
        systemRamSize,
        setSystemRamSize,
        ramType,
        setRamType,
        ramSpeed,
        setRamSpeed,
        storageType,
        setStorageType,
        benchmarkMode,
        setBenchmarkMode,
        customHardware,
        addCustomHardware,
        updateCustomHardware,
        deleteCustomHardware,
        selectedRuntime,
        setSelectedRuntime
    } = useHardware();

    const [detectedHardware, setDetectedHardware] = useState<any>(null);
    const [showDetection, setShowDetection] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<string>('NVIDIA');
    const [searchQuery, setSearchQuery] = useState('');
    const [macChipType, setMacChipType] = useState<'silicon' | 'intel' | null>(null);
    const [cpuList, setCpuList] = useState<any[]>([]);

    // Load CPU database
    useEffect(() => {
        setCpuList(cpuDatabase as any[]);
    }, []);

    // Merge custom hardware with database
    const allHardware = [...HARDWARE_DATABASE, ...customHardware];

    // Get current selected hardware details for enforcement
    const selectedHwDetails = allHardware.find(h => h.id === selectedHardwareId) as HardwareOption | undefined;

    // Enforce Intel Mac specs when Intel Mac system is selected
    useEffect(() => {
        if (selectedHwDetails?.category === 'IntelMac' || selectedHwDetails?.category === 'Apple') {
            // Enforce RAM limit
            if (selectedHwDetails.maxRam && systemRamSize > selectedHwDetails.maxRam) {
                setSystemRamSize(selectedHwDetails.maxRam);
            }
            // Enforce storage type
            if (selectedHwDetails.enforcedStorage && storageType !== selectedHwDetails.enforcedStorage) {
                setStorageType(selectedHwDetails.enforcedStorage);
            }
            // Enforce RAM type
            if (selectedHwDetails.enforcedRamType && ramType !== selectedHwDetails.enforcedRamType) {
                setRamType(selectedHwDetails.enforcedRamType);
            }
            // Enforce CPU
            if (selectedHwDetails.enforcedCpu && selectedCpuId !== selectedHwDetails.enforcedCpu) {
                setSelectedCpuId(selectedHwDetails.enforcedCpu);
            }
        }
    }, [selectedHardwareId, selectedHwDetails, systemRamSize, storageType, ramType, selectedCpuId, setSystemRamSize, setStorageType, setRamType, setSelectedCpuId]);

    // Locking logic for Mac presets
    // Apple Silicon: Everything locked (unified memory architecture)
    const isAppleSilicon = selectedHwDetails?.category === 'Apple';

    // Intel Mac: GPU/CPU/Storage locked, but RAM size is editable (upgradeable)
    const isIntelMac = selectedHwDetails?.category === 'IntelMac';

    // Legacy full lock flag for non-RAM fields
    const isLocked = isAppleSilicon || isIntelMac;

    // RAM-specific lock: only Apple Silicon RAM is locked (unified memory)
    const isRamLocked = isAppleSilicon;

    // Custom Hardware State Management
    const [isQuickCustom, setIsQuickCustom] = useState(false);
    const [showDetailedForm, setShowDetailedForm] = useState(false);

    // Software Runtime Selection (Managed by Global Context)
    // const [selectedRuntime, setSelectedRuntime] = useState<string>('llamacpp');

    const [customSpec, setCustomSpec] = useState({
        vram: 24,
        bandwidth: 900,
        cpuCores: 16,
        cpuThreads: 32,
        ramSize: 32,
        ramSpeed: 6000,
        storageType: 'nvme_gen4' as StorageType
    });

    // Apply Quick Custom spec to context
    useEffect(() => {
        if (isQuickCustom) {
            setSystemRamSize(customSpec.ramSize);
            setRamSpeed(customSpec.ramSpeed);
            setStorageType(customSpec.storageType);

            // Create a temporary custom hardware item for the context
            const customItem: HardwareItem = {
                id: 'custom_quick',
                name: 'Custom - Quick Config',
                type: 'system',
                vram_gb: customSpec.vram,
                bandwidth_gbps: customSpec.bandwidth,
                price_usd: 0,
                category: 'Custom',
                brand: 'Custom',
                release_date: new Date().toISOString().split('T')[0],

                // Full System Specs
                cpu_model: 'Custom CPU',
                cpu_cores: customSpec.cpuCores,
                cpu_threads: customSpec.cpuThreads,
                system_ram_gb: customSpec.ramSize,
                ram_type: 'ddr5', // Default for custom
                ram_speed: customSpec.ramSpeed,
                storage_type: customSpec.storageType,
                storage_interface: 'PCIe'
            };

            updateCustomHardware(customItem);

            // Ensure this item is selected
            if (selectedHardwareId !== 'custom_quick') {
                setSelectedHardwareId('custom_quick');
            }
        }
    }, [customSpec, isQuickCustom, setSystemRamSize, setRamSpeed, setStorageType, updateCustomHardware, selectedHardwareId, setSelectedHardwareId]);

    // Unsaved changes detection for Quick Custom mode
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isQuickCustom) {
                e.preventDefault();
                e.returnValue = ''; // Chrome requires returnValue to be set
                return 'You have unsaved Quick Custom changes. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isQuickCustom]);

    // Escape key handler to exit Quick Custom mode
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isQuickCustom) {
                setIsQuickCustom(false);
                setSelectedHardwareId('');
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isQuickCustom]);

    // Auto-detect hardware
    const handleAutoDetect = () => {
        const detected = autoDetectHardware();
        const confidence = getDetectionConfidence(detected);
        setDetectedHardware({ ...detected, confidence });
        setShowDetection(true);

        // Auto-apply detected values
        if (detected.systemRAM) {
            setSystemRamSize(detected.systemRAM);
        }
        if (detected.operatingSystem) {
            if (detected.operatingSystem.includes('Win')) setOperatingSystem('windows');
            else if (detected.operatingSystem.includes('Mac')) setOperatingSystem('macos');
            else setOperatingSystem('linux');
        }
    };

    // Apply detection results
    const applyDetection = () => {
        if (!detectedHardware) return;

        if (detectedHardware.systemRAM) {
            setSystemRamSize(detectedHardware.systemRAM);
        }
        if (detectedHardware.os) {
            if (detectedHardware.os.includes('Win')) setOperatingSystem('windows');
            else if (detectedHardware.os.includes('Mac')) setOperatingSystem('macos');
            else setOperatingSystem('linux');
        }

        // Try to match detected GPU
        if (detectedHardware.gpu.detected && detectedHardware.gpu.renderer) {
            const renderer = detectedHardware.gpu.renderer.toLowerCase();
            const matchedGPU = HARDWARE_DATABASE.find(hw =>
                hw.name.toLowerCase().includes(renderer.substring(0, 10))
            );

            if (matchedGPU) {
                setSelectedHardwareId(matchedGPU.id);
                if (matchedGPU.category === 'NVIDIA') setSelectedBrand('NVIDIA');
                else if (matchedGPU.category === 'AMD') setSelectedBrand('AMD');
                else if (matchedGPU.category === 'Intel') setSelectedBrand('Intel');
                else if (matchedGPU.category === 'Apple') setSelectedBrand('Apple');
            }
        }

        setShowDetection(false);
    };

    // Type guard
    const isHardwareOption = (hw: AnyHardware): hw is HardwareOption => {
        return 'category' in hw;
    };

    // Filter hardware based on selections
    const filteredHardware = allHardware.filter(hw => {
        const matchesSearch = hw.name.toLowerCase().includes(searchQuery.toLowerCase());

        let hwCategory: HardwareOption['category'] | 'NVIDIA' = 'NVIDIA';
        if (isHardwareOption(hw)) {
            hwCategory = hw.category;
        } else {
            if (hw.type === 'cpu') hwCategory = 'CPU';
            else if (hw.type === 'soc') hwCategory = 'Apple';
        }

        // Filter by mode and brand
        let matchesTypeAndBrand = false;
        if (operatingSystem === 'macos') {
            // macOS filtering based on chip type
            if (macChipType === 'silicon') {
                // Apple Silicon: Only show M-series chips
                matchesTypeAndBrand = hwCategory === 'Apple';
            } else if (macChipType === 'intel') {
                // Intel Mac: Show Intel Mac system presets OR Intel Mac-compatible discrete GPUs
                if (isHardwareOption(hw)) {
                    matchesTypeAndBrand = hw.category === 'IntelMac' || hw.intelMacCompatible === true;
                }
            } else {
                // No chip type selected yet - show nothing
                matchesTypeAndBrand = false;
            }
        } else if (benchmarkMode === 'cpu') {
            // CPU-only mode: Show x86 and ARM CPUs (filter out SOCs meant for other purposes)
            matchesTypeAndBrand = hwCategory === 'CPU';
        } else {
            // GPU or Offloading mode
            matchesTypeAndBrand = hwCategory === selectedBrand && hwCategory !== 'CPU' && hwCategory !== 'Apple';
        }

        return matchesSearch && matchesTypeAndBrand;
    });

    const selectedHardware = allHardware.find(hw => hw.id === selectedHardwareId);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 pb-24">
            <header className="mb-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 mb-2 flex items-center gap-3">
                    <Settings className="w-10 h-10 text-teal-400" />
                    Hardware Configuration
                </h1>
                <p className="text-gray-400">
                    Configure your system specifications for accurate performance estimation.
                </p>
            </header>

            {/* Auto-Detect Section */}
            <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/50 rounded-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-teal-400" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Auto-Detect Hardware</h2>
                            <p className="text-sm text-gray-400">Let the browser detect your system specs (approximate)</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAutoDetect}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        Detect My Hardware
                    </button>
                </div>

                {showDetection && detectedHardware && (
                    <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-lg font-semibold mb-3 text-teal-300">Detection Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-blue-400" />
                                <span className="text-sm">
                                    <strong>CPU:</strong> {detectedHardware.cpuCores} cores / {detectedHardware.cpuThreads} threads
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-5 h-5 text-green-400" />
                                <span className="text-sm">
                                    <strong>RAM:</strong> {detectedHardware.systemRAM ? `${detectedHardware.systemRAM} GB` : 'Not detected'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-purple-400" />
                                <span className="text-sm">
                                    <strong>GPU:</strong> {detectedHardware.gpu.detected ? detectedHardware.gpu.renderer : 'Not detected'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Gauge className="w-5 h-5 text-yellow-400" />
                                <span className="text-sm">
                                    <strong>Confidence:</strong> {detectedHardware.confidence.level} ({detectedHardware.confidence.percentage}%)
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={applyDetection}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-medium transition-colors"
                            >
                                Apply Results
                            </button>
                            <button
                                onClick={() => setShowDetection(false)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Configuration Flow */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Step 1: Operating System */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            Operating System
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => {
                                    setOperatingSystem('windows');
                                    if (benchmarkMode === 'cpu') setBenchmarkMode('gpu');
                                }}
                                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${operatingSystem === 'windows'
                                    ? 'border-teal-500 bg-teal-900/30'
                                    : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                                    }`}
                            >
                                <Laptop className="w-8 h-8 text-blue-400" />
                                <span className="font-medium">Windows</span>
                            </button>
                            <button
                                onClick={() => {
                                    setOperatingSystem('linux');
                                    if (benchmarkMode === 'cpu') setBenchmarkMode('gpu');
                                }}
                                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${operatingSystem === 'linux'
                                    ? 'border-teal-500 bg-teal-900/30'
                                    : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                                    }`}
                            >
                                <Server className="w-8 h-8 text-orange-400" />
                                <span className="font-medium">Linux</span>
                            </button>
                            <button
                                onClick={() => {
                                    setOperatingSystem('macos');
                                    setBenchmarkMode('gpu'); // Mac is always unified/GPU-like
                                    setMacChipType(null); // Reset to show chip selector
                                }}
                                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${operatingSystem === 'macos'
                                    ? 'border-teal-500 bg-teal-900/30'
                                    : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                                    }`}
                            >
                                <CommandIcon className="w-8 h-8 text-gray-300" />
                                <span className="font-medium">macOS</span>
                            </button>
                        </div>
                    </div>

                    {/* macOS Chip Type Selection */}
                    {operatingSystem === 'macos' && macChipType === null && (
                        <div className="bg-gray-800 p-6 rounded-lg border border-yellow-700">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="bg-yellow-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">⚠</span>
                                Mac Type
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">Is this an Apple Silicon Mac or an Intel Mac?</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        setMacChipType('silicon');
                                        setSelectedBrand('Apple');
                                    }}
                                    className="p-4 rounded-lg border-2 border-green-600 bg-green-900/30 hover:bg-green-900/50 flex flex-col items-center gap-2 transition-all"
                                >
                                    <Zap className="w-8 h-8 text-green-400" />
                                    <span className="font-medium">Apple Silicon</span>
                                    <span className="text-xs text-gray-400">(M1, M2, M3, M4)</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setMacChipType('intel');
                                        setSelectedBrand('Intel');
                                    }}
                                    className="p-4 rounded-lg border-2 border-blue-600 bg-blue-900/30 hover:bg-blue-900/50 flex flex-col items-center gap-2 transition-all"
                                >
                                    <Cpu className="w-8 h-8 text-blue-400" />
                                    <span className="font-medium">Intel Mac</span>
                                    <span className="text-xs text-gray-400">(Pre-2020)</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Hardware Type (Hidden for macOS) */}
                    {operatingSystem !== 'macos' && (
                        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                Hardware Type
                            </h2>
                            <div className="flex bg-gray-700 rounded p-1">
                                <button
                                    onClick={() => setBenchmarkMode('gpu')}
                                    className={`flex - 1 py - 3 px - 4 rounded font - medium transition - colors ${benchmarkMode === 'gpu' ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                        } `}
                                >
                                    GPU Only
                                </button>
                                <button
                                    onClick={() => setBenchmarkMode('offloading')}
                                    className={`flex - 1 py - 3 px - 4 rounded font - medium transition - colors ${benchmarkMode === 'offloading' ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                        } `}
                                >
                                    GPU + CPU (Offloading)
                                </button>
                                <button
                                    onClick={() => setBenchmarkMode('cpu')}
                                    className={`flex - 1 py - 3 px - 4 rounded font - medium transition - colors ${benchmarkMode === 'cpu' ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                        } `}
                                >
                                    CPU Only
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Brand Selection (Hidden for macOS or CPU mode) */}
                    {operatingSystem !== 'macos' && benchmarkMode !== 'cpu' && (
                        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                                GPU Brand
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                {['NVIDIA', 'AMD', 'Intel'].map(brand => (
                                    <button
                                        key={brand}
                                        onClick={() => setSelectedBrand(brand)}
                                        className={`p - 3 rounded - lg border - 2 font - semibold transition - all ${selectedBrand === brand
                                            ? 'border-teal-500 bg-teal-900/30 text-white'
                                            : 'border-gray-600 bg-gray-900/50 text-gray-400 hover:border-gray-500'
                                            } `}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Hardware Selection */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">{operatingSystem === 'macos' ? '2' : '4'}</span>
                                Select Model
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsQuickCustom(!isQuickCustom);
                                        if (!isQuickCustom) {
                                            setSelectedHardwareId('custom_quick');
                                            setBenchmarkMode('gpu'); // Reset to standard
                                            setShowDetailedForm(false);
                                        } else {
                                            setSelectedHardwareId('');
                                        }
                                    }}
                                    className={`px - 4 py - 2 rounded - lg font - medium transition - all flex items - center gap - 2 text - sm ${isQuickCustom
                                        ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        } `}
                                >
                                    <Sliders className="w-4 h-4" />
                                    {isQuickCustom ? 'Quick Custom Active' : 'Quick Custom'}
                                </button>
                                <button
                                    onClick={() => setShowDetailedForm(!showDetailedForm)}
                                    className={`px - 4 py - 2 rounded - lg font - medium transition - all flex items - center gap - 2 text - sm ${showDetailedForm
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        } `}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {showDetailedForm ? 'Hide Form' : 'Add Item'}
                                </button>
                            </div>
                        </h2>

                        <div className="mb-4">
                            {showDetailedForm && (
                                <div className="mb-6">
                                    <CustomHardwareForm
                                        onAdd={(hw) => {
                                            addCustomHardware(hw);
                                            setShowDetailedForm(false);
                                            setSelectedHardwareId(hw.id);
                                        }}
                                        onClose={() => setShowDetailedForm(false)}
                                    />
                                </div>
                            )}
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search models..."
                                className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-3 focus:border-teal-500 outline-none"
                                disabled={isQuickCustom}
                            />
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar ${isQuickCustom ? 'opacity-50 pointer-events-none' : ''}`}>
                            {filteredHardware.map((hw) => {
                                const isCustomPreset = 'isCustom' in hw && hw.isCustom === true;
                                return (
                                    <div key={hw.id} className="relative group">
                                        <button
                                            onClick={() => setSelectedHardwareId(hw.id)}
                                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedHardwareId === hw.id
                                                ? 'border-teal-500 bg-teal-900/30'
                                                : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold text-white">{hw.name}</div>
                                                        {isCustomPreset && (
                                                            <span className="text-xs px-2 py-0.5 bg-purple-600/30 border border-purple-500/50 rounded text-purple-300">Custom</span>
                                                        )}
                                                    </div>
                                                    {hw.vram_gb && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {hw.vram_gb} GB VRAM • {hw.bandwidth_gbps} GB/s
                                                        </div>
                                                    )}
                                                </div>
                                                {selectedHardwareId === hw.id && !isCustomPreset && (
                                                    <Zap className="w-5 h-5 text-teal-400" />
                                                )}
                                            </div>
                                        </button>
                                        {isCustomPreset && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`Delete "${hw.name}" ?\n\nThis cannot be undone.`)) {
                                                        deleteCustomHardware(hw.id);
                                                    }
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete custom preset"
                                                aria-label={`Delete ${hw.name} `}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {filteredHardware.length === 0 && (
                                <div className="col-span-2 text-center text-gray-500 py-8">
                                    No hardware found matching your criteria.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: System Config & Summary */}
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 sticky top-8">
                        <h2 className="text-xl font-bold text-white mb-6">System Configuration</h2>

                        {isQuickCustom ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                                    <div className="text-xs text-purple-400 font-bold uppercase mb-4 flex items-center gap-2">
                                        <Sliders className="w-4 h-4" /> Quick Custom Configuration
                                    </div>

                                    {/* Custom GPU Sliders */}
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="flex justify-between text-sm text-gray-300 mb-2">
                                                <span>VRAM Size</span>
                                                <span className="font-bold text-white">{customSpec.vram} GB</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="4"
                                                max="192"
                                                step="4"
                                                value={customSpec.vram}
                                                onChange={(e) => setCustomSpec({ ...customSpec, vram: Number(e.target.value) })}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex justify-between text-sm text-gray-300 mb-2">
                                                <span>Memory Bandwidth</span>
                                                <span className="font-bold text-white">{customSpec.bandwidth} GB/s</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="100"
                                                max="2000"
                                                step="50"
                                                value={customSpec.bandwidth}
                                                onChange={(e) => setCustomSpec({ ...customSpec, bandwidth: Number(e.target.value) })}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                            />
                                        </div>
                                    </div>

                                    <hr className="border-purple-800/50 mb-6" />

                                    {/* Custom CPU Sliders */}
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="flex justify-between text-sm text-gray-300 mb-2">
                                                <span>CPU Cores</span>
                                                <span className="font-bold text-white">{customSpec.cpuCores}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="4"
                                                max="128"
                                                step="2"
                                                value={customSpec.cpuCores}
                                                onChange={(e) => setCustomSpec({ ...customSpec, cpuCores: Number(e.target.value) })}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex justify-between text-sm text-gray-300 mb-2">
                                                <span>CPU Threads</span>
                                                <span className="font-bold text-white">{customSpec.cpuThreads}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="4"
                                                max="256"
                                                step="2"
                                                value={customSpec.cpuThreads}
                                                onChange={(e) => setCustomSpec({ ...customSpec, cpuThreads: Number(e.target.value) })}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                            />
                                        </div>
                                    </div>

                                    <hr className="border-purple-800/50 mb-6" />

                                    {/* Custom RAM & Storage */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="flex justify-between text-sm text-gray-300 mb-2">
                                                <span>System RAM</span>
                                                <span className="font-bold text-white">{customSpec.ramSize} GB</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="8"
                                                max="512"
                                                step="8"
                                                value={customSpec.ramSize}
                                                onChange={(e) => setCustomSpec({ ...customSpec, ramSize: Number(e.target.value) })}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-300 mb-2">Storage Type</label>
                                            <select
                                                value={customSpec.storageType}
                                                onChange={(e) => setCustomSpec({ ...customSpec, storageType: e.target.value as StorageType })}
                                                className="w-full bg-gray-900 rounded p-2 text-white border border-purple-500/50 focus:border-purple-500 outline-none"
                                            >
                                                <option value="nvme_gen5">NVMe Gen 5</option>
                                                <option value="nvme_gen4">NVMe Gen 4</option>
                                                <option value="nvme_gen3">NVMe Gen 3</option>
                                                <option value="sata">SATA SSD</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : selectedHardwareId ? (
                            <div className="space-y-6">
                                {/* GPU Configuration (Locked for Mac presets) */}
                                <div className={isLocked ? 'opacity-75' : ''} title={isLocked ? `Preset locked: ${selectedHwDetails?.name} - ${selectedHwDetails?.vram_gb}GB VRAM` : ''}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Gauge className="w-5 h-5 text-teal-400" />
                                        <h3 className="font-semibold text-white">GPU Config</h3>
                                        {isLocked && <span title="Preset specs locked"><Lock className="w-3 h-3 text-yellow-500" /></span>}
                                    </div>

                                    {/* GPU Name/Model - NEW: Show for presets */}
                                    {selectedHwDetails?.name && (
                                        <div className="mb-4">
                                            <label className="text-xs text-gray-500 mb-1 block">Model</label>
                                            <div
                                                className="bg-gray-900/50 p-2 rounded border border-gray-600 text-gray-300 font-mono text-sm"
                                                role="textbox"
                                                aria-readonly="true"
                                                aria-label="GPU model (locked)"
                                                title={`GPU model from preset: ${selectedHwDetails.name} `}
                                            >
                                                {selectedHwDetails.name}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={isLocked ? 'opacity-75' : ''}>
                                            <label className="text-xs text-gray-500 mb-1 block" htmlFor="gpu-count">Count</label>
                                            {isLocked ? (
                                                <div
                                                    className="bg-gray-900/50 p-2 rounded border border-gray-600 text-gray-300 font-mono text-sm"
                                                    role="textbox"
                                                    aria-readonly="true"
                                                    aria-label="GPU count (locked)"
                                                    title="Locked to preset value"
                                                >
                                                    {gpuCount}
                                                </div>
                                            ) : (
                                                <input
                                                    id="gpu-count"
                                                    type="number"
                                                    min="1"
                                                    max="8"
                                                    value={gpuCount || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '') {
                                                            setGpuCount(0); // Temporarily allow 0 to represent empty
                                                        } else {
                                                            setGpuCount(Number(val));
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '' || Number(val) < 1) {
                                                            setGpuCount(1); // Default to 1 if empty/invalid on blur
                                                        }
                                                    }}
                                                    className="w-full bg-gray-900 rounded p-2 text-white border border-gray-600 focus:border-teal-500 outline-none"
                                                    aria-label="Number of GPUs"
                                                />
                                            )}
                                        </div>
                                        <div className="opacity-75">
                                            <label className="text-xs text-gray-500 mb-1 block">VRAM per GPU</label>
                                            <div
                                                className="bg-gray-900/50 p-2 rounded border border-gray-600 text-gray-300 font-mono text-sm"
                                                role="textbox"
                                                aria-readonly="true"
                                                aria-label="VRAM per GPU (locked)"
                                                title="VRAM amount per GPU unit (locked to preset)"
                                            >
                                                {selectedHwDetails?.vram_gb || 0} GB
                                            </div>
                                        </div>
                                    </div>

                                    {/* NVLink Option - Hidden for Mac/Locked */}
                                    {!isLocked && (
                                        <div className="mt-4 flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="nvlink"
                                                checked={isNvlink}
                                                onChange={(e) => setIsNvlink(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-600 text-teal-500 focus:ring-teal-500 bg-gray-900"
                                            />
                                            <label htmlFor="nvlink" className="text-sm text-gray-300">Enable NVLink / Infinity Fabric</label>
                                        </div>
                                    )}
                                </div>

                                <hr className="border-gray-700" />

                                {/* System RAM Config */}
                                <div className={isRamLocked ? 'opacity-75' : ''} title={isRamLocked ? `Preset locked: ${selectedHwDetails?.system_ram_gb}GB ${selectedHwDetails?.ram_type?.toUpperCase()} @${selectedHwDetails?.ram_speed} MT / s` : ''}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <HardDrive className="w-5 h-5 text-teal-400" />
                                        <h3 className="font-semibold text-white">System Memory</h3>
                                        {isRamLocked && <span title="RAM specs locked to preset"><Lock className="w-3 h-3 text-yellow-500" /></span>}
                                    </div>

                                    {/* RAM Size - Editable for Intel Mac, Locked for Apple Silicon */}
                                    <div className="mb-4">
                                        <label className="text-xs text-gray-500 mb-1 block" htmlFor="ram-size">Size</label>
                                        {isRamLocked ? (
                                            <div
                                                className="bg-gray-900/50 p-2 rounded border border-gray-600 text-gray-300 font-mono text-sm"
                                                role="textbox"
                                                aria-readonly="true"
                                                aria-label="RAM size (locked)"
                                                title={`System RAM locked to preset: ${selectedHardware?.system_ram_gb || systemRamSize} GB`}
                                            >
                                                {selectedHardware?.system_ram_gb || systemRamSize} GB
                                            </div>
                                        ) : (
                                            <input
                                                id="ram-size"
                                                type="number"
                                                min="1"
                                                max={selectedHwDetails?.maxRam || 256}
                                                value={systemRamSize || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') {
                                                        setSystemRamSize(0); // Temporarily allow 0 to represent empty
                                                    } else {
                                                        setSystemRamSize(Number(val));
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || Number(val) < 1) {
                                                        setSystemRamSize(1); // Default to 1 if empty/invalid on blur
                                                    }
                                                }}
                                                className="w-full bg-gray-900 rounded p-2 text-white border border-gray-600 focus:border-teal-500 outline-none"
                                                aria-label="System RAM size in GB"
                                            />
                                        )}
                                        {!isRamLocked && selectedHwDetails?.maxRam && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Max: {selectedHwDetails.maxRam} GB
                                            </div>
                                        )}
                                    </div>

                                    {/* RAM Type and Speed - Separate display */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Type</label>
                                            <div className="bg-gray-900/50 p-2 rounded border border-gray-600 text-gray-300 font-mono text-sm">
                                                {selectedHardware?.ram_type?.toUpperCase() || ramType.toUpperCase()}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Speed</label>
                                            <div className="bg-gray-900/50 p-2 rounded border border-gray-600 text-gray-300 font-mono text-sm">
                                                {selectedHardware?.ram_speed || ramSpeed} MT/s
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-700" />

                                {/* Storage Config */}
                                <div className={isLocked ? 'opacity-75' : ''} title={isLocked ? `Preset locked: ${selectedHwDetails?.storage_type?.toUpperCase()} (${selectedHwDetails?.storage_interface})` : ''}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Server className="w-5 h-5 text-teal-400" />
                                        <h3 className="font-semibold text-white">Storage</h3>
                                        {isLocked && <span title="Storage specs locked to preset"><Lock className="w-3 h-3 text-yellow-500" /></span>}
                                    </div>

                                    {isLocked ? (
                                        <div
                                            className="bg-gray-900/50 p-3 rounded border border-gray-600 text-gray-300 font-mono text-sm"
                                            role="textbox"
                                            aria-readonly="true"
                                            aria-label="Storage type (locked)"
                                            title={`Storage type locked to preset: ${selectedHardware?.storage_type === 'nvme_gen4' ? 'NVMe Gen 4' :
                                                selectedHardware?.storage_type === 'nvme_gen3' ? 'NVMe Gen 3' :
                                                    selectedHardware?.storage_type?.toUpperCase()
                                                } ${selectedHardware?.storage_interface ? ` (${selectedHardware.storage_interface})` : ''} `}
                                        >
                                            {selectedHardware?.storage_type === 'nvme_gen4' ? 'NVMe Gen 4' :
                                                selectedHardware?.storage_type === 'nvme_gen3' ? 'NVMe Gen 3' :
                                                    selectedHardware?.storage_type?.toUpperCase()}
                                            {selectedHardware?.storage_interface ? ` (${selectedHardware.storage_interface})` : ''}
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Drive Type</label>
                                            <select
                                                value={storageType}
                                                onChange={(e) => setStorageType(e.target.value as StorageType)}
                                                className="w-full bg-gray-900 rounded p-2 text-white border border-gray-600 focus:border-teal-500 outline-none"
                                            >
                                                <option value="nvme_gen4">NVMe Gen 4 (7000 MB/s)</option>
                                                <option value="nvme_gen3">NVMe Gen 3 (3500 MB/s)</option>
                                                <option value="sata">SATA SSD (550 MB/s)</option>
                                                <option value="hdd">HDD (150 MB/s)</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* CPU Display (if enforced) */}
                                {isLocked && selectedHardware?.cpu_model && (
                                    <>
                                        <hr className="border-gray-700" />
                                        <div className="opacity-75">
                                            <label className="block text-sm text-gray-400 mb-2 flex justify-between">
                                                <span>CPU</span>
                                                <Lock className="w-3 h-3 text-yellow-500" />
                                            </label>
                                            <div className="bg-gray-900/50 p-3 rounded border border-gray-600 text-gray-300 font-mono text-sm">
                                                {selectedHardware.cpu_model}
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {selectedHardware.cpu_cores} Cores / {selectedHardware.cpu_threads} Threads
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* CPU Selection (for Offloading) */}
                                {(benchmarkMode === 'offloading' || benchmarkMode === 'cpu') && !isLocked && (
                                    <>
                                        <hr className="border-gray-700" />
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Cpu className="w-5 h-5 text-teal-400" />
                                                <h3 className="font-semibold text-white">Processor</h3>
                                            </div>

                                            <select
                                                value={selectedCpuId}
                                                onChange={(e) => setSelectedCpuId(e.target.value)}
                                                className="w-full bg-gray-900 rounded p-2 text-white border border-gray-600 focus:border-teal-500 outline-none"
                                            >
                                                <option value="">Select CPU...</option>
                                                {cpuList.map(cpu => (
                                                    <option key={cpu.id} value={cpu.id}>{cpu.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {/* Software Runtime Selection (Phase 8D) */}
                                <hr className="border-gray-700" />
                                <SoftwareRuntimeSelector
                                    selectedRuntime={selectedRuntime}
                                    onRuntimeChange={setSelectedRuntime}
                                    isIntelMac={isIntelMac}
                                    isAppleSilicon={isAppleSilicon}
                                    runtimeSupport={selectedHwDetails?.supportedRuntimes}
                                />
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                Please select hardware from the list to configure your system.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default HardwareConfigPage;
