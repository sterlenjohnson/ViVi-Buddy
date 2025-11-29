import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HardwareItem } from '../database/db_interface';

export type OperatingSystem = 'windows' | 'linux' | 'macos';
export type RamType = 'ddr4' | 'ddr5' | 'lpddr5' | 'hbm2e';
export type StorageType = 'nvme_gen4' | 'nvme_gen3' | 'sata' | 'hdd';

interface HardwareContextType {
    selectedHardwareId: string;
    setSelectedHardwareId: (id: string) => void;
    selectedCpuId: string;
    setSelectedCpuId: (id: string) => void;
    gpuCount: number;
    setGpuCount: (count: number) => void;
    isNvlink: boolean;
    setIsNvlink: (isNvlink: boolean) => void;

    // System Config
    operatingSystem: OperatingSystem;
    setOperatingSystem: (os: OperatingSystem) => void;
    systemRamSize: number;
    setSystemRamSize: (size: number) => void;
    ramType: RamType;
    setRamType: (type: RamType) => void;
    ramSpeed: number;
    setRamSpeed: (speed: number) => void;
    storageType: StorageType;
    setStorageType: (type: StorageType) => void;

    // Legacy/Compat
    selectedRamId: string;
    setSelectedRamId: (id: string) => void;

    customHardware: HardwareItem[];
    addCustomHardware: (hardware: HardwareItem) => void;
    updateCustomHardware: (hardware: HardwareItem) => void;
    removeCustomHardware: (id: string) => void;
    saveCustomHardware: (hardware: Partial<HardwareItem>) => { success: boolean; item?: HardwareItem; errors?: string[] };
    deleteCustomHardware: (id: string) => void;
    benchmarkMode: 'gpu' | 'offloading' | 'cpu';
    setBenchmarkMode: (mode: 'gpu' | 'offloading' | 'cpu') => void;
}

const HardwareContext = createContext<HardwareContextType | undefined>(undefined);

export const useHardware = (): HardwareContextType => {
    const context = useContext(HardwareContext);
    if (!context) {
        throw new Error('useHardware must be used within HardwareProvider');
    }
    return context;
};

interface HardwareProviderProps {
    children: ReactNode;
}

export const HardwareProvider: React.FC<HardwareProviderProps> = ({ children }) => {
    // GPU/CPU Hardware
    const [selectedHardwareId, setSelectedHardwareId] = useState<string>('');
    const [selectedCpuId, setSelectedCpuId] = useState<string>('');
    const [gpuCount, setGpuCount] = useState<number>(1);
    const [isNvlink, setIsNvlink] = useState<boolean>(false);

    // System Config
    const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>('linux');
    const [systemRamSize, setSystemRamSize] = useState<number>(32);
    const [ramType, setRamType] = useState<RamType>('ddr5');
    const [ramSpeed, setRamSpeed] = useState<number>(6000);
    const [storageType, setStorageType] = useState<StorageType>('nvme_gen4');

    const [selectedRamId, setSelectedRamId] = useState<string>('ddr5_6000_dual');

    // Custom hardware
    const [customHardware, setCustomHardware] = useState<HardwareItem[]>([]);

    // Mode
    const [benchmarkMode, setBenchmarkMode] = useState<'gpu' | 'offloading' | 'cpu'>('gpu');

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('vivi_hardware_context');
            if (saved) {
                const data = JSON.parse(saved);
                setSelectedHardwareId(data.selectedHardwareId || '');
                setSelectedCpuId(data.selectedCpuId || '');
                setGpuCount(data.gpuCount || 1);
                setIsNvlink(data.isNvlink || false);

                setOperatingSystem(data.operatingSystem || 'linux');
                setSystemRamSize(data.systemRamSize || 32);
                setRamType(data.ramType || 'ddr5');
                setRamSpeed(data.ramSpeed || 6000);
                setStorageType(data.storageType || 'nvme_gen4');

                setSelectedRamId(data.selectedRamId || 'ddr5_6000_dual');
                setCustomHardware(data.customHardware || []);
                setBenchmarkMode(data.benchmarkMode || 'gpu');
            }
        } catch (error) {
            console.error('Failed to load hardware context:', error);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        try {
            const data = {
                selectedHardwareId,
                selectedCpuId,
                gpuCount,
                isNvlink,
                operatingSystem,
                systemRamSize,
                ramType,
                ramSpeed,
                storageType,
                selectedRamId,
                customHardware,
                benchmarkMode,
            };
            localStorage.setItem('vivi_hardware_context', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save hardware context:', error);
        }
    }, [
        selectedHardwareId, selectedCpuId, gpuCount, isNvlink,
        operatingSystem, systemRamSize, ramType, ramSpeed, storageType,
        selectedRamId, customHardware, benchmarkMode
    ]);

    const addCustomHardware = (hardware: HardwareItem) => {
        setCustomHardware(prev => [...prev, hardware]);
    };

    const removeCustomHardware = (id: string) => {
        setCustomHardware(prev => prev.filter(h => h.id !== id));
    };

    const updateCustomHardware = (hardware: HardwareItem) => {
        setCustomHardware(prev => {
            const exists = prev.find(h => h.id === hardware.id);
            if (exists) {
                return prev.map(h => h.id === hardware.id ? hardware : h);
            }
            return [...prev, hardware];
        });
    };

    // Custom Hardware Persistence Functions
    const CUSTOM_HW_KEY_PREFIX = 'vivibuddy_custom_hw_';

    const generateUUID = (): string => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const loadCustomHardwareFromStorage = (): HardwareItem[] => {
        const loaded: HardwareItem[] = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(CUSTOM_HW_KEY_PREFIX)) {
                    try {
                        const item = JSON.parse(localStorage.getItem(key) || '');
                        if (item && item.id && item.name) {
                            loaded.push(item);
                        }
                    } catch (parseError) {
                        console.error(`Failed to parse custom hardware from key ${key}:`, parseError);
                        // Remove corrupt key
                        localStorage.removeItem(key);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load custom hardware from storage:', error);
        }
        return loaded;
    };

    const saveCustomHardwareToStorage = (hardware: HardwareItem): HardwareItem => {
        // Generate UUID if not present
        const id = hardware.id || generateUUID();
        const itemToSave: HardwareItem = {
            ...hardware,
            id,
            isCustom: true,
            createdAt: hardware.createdAt || new Date().toISOString(),
            type: 'custom',
            category: 'Custom',
            presetType: 'custom'
        };

        const key = `${CUSTOM_HW_KEY_PREFIX}${id}`;
        try {
            localStorage.setItem(key, JSON.stringify(itemToSave));
        } catch (error) {
            console.error('Failed to save custom hardware to storage:', error);
            throw new Error('Failed to save custom preset');
        }

        return itemToSave;
    };

    const deleteCustomHardwareFromStorage = (id: string): void => {
        const key = `${CUSTOM_HW_KEY_PREFIX}${id}`;
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to delete custom hardware from storage:', error);
        }
    };

    const validateCustomHardware = (hardware: Partial<HardwareItem>): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!hardware.name || hardware.name.trim().length === 0) {
            errors.push('Name is required');
        }

        if (hardware.vram_gb !== undefined && (hardware.vram_gb < 1 || hardware.vram_gb > 192)) {
            errors.push('VRAM must be between 1 and 192 GB');
        }

        if (hardware.bandwidth_gbps !== undefined && (hardware.bandwidth_gbps < 100 || hardware.bandwidth_gbps > 3000)) {
            errors.push('Bandwidth must be between 100 and 3000 GB/s');
        }

        if (hardware.cpu_cores !== undefined && (hardware.cpu_cores < 1 || hardware.cpu_cores > 256)) {
            errors.push('CPU cores must be between 1 and 256');
        }

        if (hardware.cpu_threads !== undefined && (hardware.cpu_threads < 1 || hardware.cpu_threads > 512)) {
            errors.push('CPU threads must be between 1 and 512');
        }

        if (hardware.system_ram_gb !== undefined && (hardware.system_ram_gb < 1 || hardware.system_ram_gb > 2048)) {
            errors.push('System RAM must be between 1 and 2048 GB');
        }

        return { valid: errors.length === 0, errors };
    };

    // Load custom hardware on mount
    useEffect(() => {
        const loadedCustom = loadCustomHardwareFromStorage();
        if (loadedCustom.length > 0) {
            setCustomHardware(loadedCustom);
        }
    }, []);

    // Enhanced save function with validation and persistence
    const saveCustomHardware = (hardware: Partial<HardwareItem>): { success: boolean; item?: HardwareItem; errors?: string[] } => {
        const validation = validateCustomHardware(hardware);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        // Check for duplicate name (excluding self if updating)
        const duplicateName = customHardware.find(h =>
            h.name.toLowerCase() === hardware.name?.toLowerCase() &&
            h.id !== hardware.id
        );
        if (duplicateName) {
            return { success: false, errors: ['A preset with this name already exists'] };
        }

        try {
            const savedItem = saveCustomHardwareToStorage(hardware as HardwareItem);
            addCustomHardware(savedItem);
            return { success: true, item: savedItem };
        } catch (error) {
            return { success: false, errors: [(error as Error).message] };
        }
    };

    // Enhanced delete function
    const deleteCustomHardware = (id: string): void => {
        deleteCustomHardwareFromStorage(id);
        removeCustomHardware(id);

        // If the deleted preset was selected, clear selection
        if (selectedHardwareId === id) {
            setSelectedHardwareId('');
        }
    };

    const value: HardwareContextType = {
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
        selectedRamId,
        setSelectedRamId,
        customHardware,
        addCustomHardware,
        updateCustomHardware,
        removeCustomHardware,
        saveCustomHardware,
        deleteCustomHardware,
        benchmarkMode,
        setBenchmarkMode,
    };

    return (
        <HardwareContext.Provider value={value}>
            {children}
        </HardwareContext.Provider>
    );
};

export default HardwareContext;
