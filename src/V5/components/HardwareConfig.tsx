import React from 'react';
import { Cpu, HardDrive, MinusSquare, PlusSquare } from 'lucide-react';
import { colorMap } from '../utils/constants';
import { GPU } from '../types';

interface LabeledInputProps {
    label: string;
    value: number;
    setter: (value: number) => void;
    type?: 'range' | 'number';
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    color?: string;
    disabled?: boolean;
    warning?: string | null;
}

const LabeledInput: React.FC<LabeledInputProps> = ({ label, value, setter, type = 'range', min = 0, max = 100, step = 1, unit = '', color = 'slate', disabled = false, warning = null }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setter(Number(e.target.value));

    // Define background colors based on category
    const bgColorMap: Record<string, string> = {
        blue: 'bg-blue-900/20',
        purple: 'bg-purple-900/20',
        cyan: 'bg-cyan-900/25',
        emerald: 'bg-emerald-900/20',
        indigo: 'bg-indigo-900/20',
        orange: 'bg-orange-900/20',
        slate: 'bg-slate-700'
    };
    const bgColor = bgColorMap[color] || 'bg-slate-700';

    return (
        <div className={`mb-2 p-2 rounded-lg shadow-inner transition-colors duration-200 border-l-2 ${disabled ? 'bg-slate-800 opacity-50' : bgColor}`} style={{ borderColor: (colorMap as any)[color] || 'transparent' }}>
            <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-200">{label}</label>
                {warning && <span className="text-[10px] text-red-400">{warning}</span>}
            </div>
            <div className="flex items-center gap-2">
                {type === 'range' && (
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-600"
                    />
                )}
                <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-16 rounded px-1 py-0.5 text-center text-xs text-white bg-slate-600"
                />
                {unit && <span className="text-white text-[10px] font-bold min-w-[20px] text-right">{unit}</span>}
            </div>
        </div>
    );
};

interface SelectInputProps {
    label: string;
    value: string;
    setter: (value: string) => void;
    options: Array<{ value: string; label: string; disabled?: boolean }>;
    disabled?: boolean;
    color?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, setter, options, disabled = false, color = 'slate' }) => (
    <div className={`mb-2 p-2 rounded-lg shadow-inner bg-slate-700 border-l-2`} style={{ borderColor: (colorMap as any)[color] }}>
        <label className="block text-xs font-medium text-slate-200 mb-1">{label}</label>
        <select value={value} onChange={(e) => setter(e.target.value)} disabled={disabled} className="w-full bg-slate-600 text-white text-xs rounded px-2 py-1">
            {options.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
    </div>
);

interface HardwareConfigProps {
    operatingSystem: string;
    setOperatingSystem: (value: string) => void;
    chipType: string;
    setChipType: (value: string) => void;
    totalVRAM: number;
    setTotalVRAM: (value: number) => void;
    numGPUs: number;
    setNumGPUs: (value: number) => void;
    systemRAMAmount: number;
    setSystemRAMAmount: (value: number) => void;
    showDetailedSpecs: boolean;
    setShowDetailedSpecs: (value: boolean) => void;
    gpuVendor: string;
    setGpuVendor: (value: string) => void;
    ramType: string;
    setRamType: (value: string) => void;
    ramSpeed: number;
    setRamSpeed: (value: number) => void;
    storageType: string;
    setStorageType: (value: string) => void;
    ramClRating: number;
    setRamClRating: (value: number) => void;
    isUnified: boolean;
    hasGPU?: boolean;
    gpuEnabled: boolean;
    setGpuEnabled: (value: boolean) => void;
    mismatchedEnabled: boolean;
    setMismatchedEnabled: (value: boolean) => void;
    gpuList: GPU[];
    updateGpu: (id: string | number, field: string, value: any) => void;
    addGpu: () => void;
    removeGpu: (id: string | number) => void;
    cpuCores: number;
    setCpuCores: (value: number) => void;
    cpuThreads: number;
    setCpuThreads: (value: number) => void;
}

const HardwareConfig: React.FC<HardwareConfigProps> = ({
    operatingSystem, setOperatingSystem,
    chipType, setChipType,
    totalVRAM, setTotalVRAM,
    numGPUs, setNumGPUs,
    systemRAMAmount, setSystemRAMAmount,
    showDetailedSpecs, setShowDetailedSpecs,
    gpuVendor, setGpuVendor,
    ramType, setRamType,
    ramSpeed, setRamSpeed,
    storageType, setStorageType,
    ramClRating, setRamClRating,
    isUnified, hasGPU, gpuEnabled, setGpuEnabled,
    mismatchedEnabled, setMismatchedEnabled,
    gpuList, updateGpu, addGpu, removeGpu,
    cpuCores, setCpuCores,
    cpuThreads, setCpuThreads
}) => {
    return (
        <div className="space-y-3">
            <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700/50 backdrop-blur-sm">
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    <Cpu className="w-5 h-5 text-blue-400" /> Platform
                </h2>

                <div className="grid grid-cols-1 gap-2">
                    <SelectInput
                        label="Operating System"
                        value={operatingSystem}
                        setter={setOperatingSystem}
                        options={[
                            { value: 'macos', label: 'macOS' },
                            { value: 'linux', label: 'Linux' },
                            { value: 'windows', label: 'Windows' }
                        ]}
                        color="indigo"
                    />

                    {operatingSystem === 'macos' ? (
                        <div className="p-2 rounded-lg shadow-inner bg-slate-700 border-l-2 border-indigo-500">
                            <label className="block text-xs font-medium text-slate-200 mb-1">Mac Architecture</label>
                            <div className="grid grid-cols-2 gap-1">
                                <button
                                    onClick={() => setChipType('appleSilicon')}
                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${chipType === 'appleSilicon' ? 'bg-indigo-600 text-white ring-1 ring-indigo-400' : 'bg-slate-600 text-slate-400 hover:bg-slate-500'}`}
                                >
                                    Apple Silicon
                                </button>
                                <button
                                    onClick={() => setChipType('intel')}
                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${chipType === 'intel' ? 'bg-indigo-600 text-white ring-1 ring-indigo-400' : 'bg-slate-600 text-slate-400 hover:bg-slate-500'}`}
                                >
                                    Intel Mac
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 rounded-lg shadow-inner bg-slate-700 border-l-2 border-indigo-500">
                            <label className="block text-xs font-medium text-slate-200 mb-1">CPU Architecture</label>
                            <div className="grid grid-cols-2 gap-1">
                                <button
                                    onClick={() => setChipType('intel')}
                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${chipType !== 'arm64' ? 'bg-indigo-600 text-white ring-1 ring-indigo-400' : 'bg-slate-600 text-slate-400 hover:bg-slate-500'}`}
                                >
                                    x86_64
                                </button>
                                <button
                                    onClick={() => setChipType('arm64')}
                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${chipType === 'arm64' ? 'bg-indigo-600 text-white ring-1 ring-indigo-400' : 'bg-slate-600 text-slate-400 hover:bg-slate-500'}`}
                                >
                                    ARM64
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700/50 backdrop-blur-sm">
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    <HardDrive className="w-5 h-5 text-emerald-400" /> Memory & CPU
                </h2>

                <LabeledInput
                    label="System RAM"
                    value={systemRAMAmount}
                    setter={setSystemRAMAmount}
                    min={4}
                    max={1024}
                    step={4}
                    unit="GB"
                    color="emerald"
                />

                <div className="mt-2">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> CPU Cores / Threads
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        <LabeledInput
                            label="Cores"
                            value={cpuCores}
                            setter={setCpuCores}
                            min={1}
                            max={128}
                            step={1}
                            unit=""
                            color="cyan"
                        />
                        <LabeledInput
                            label="Threads"
                            value={cpuThreads}
                            setter={setCpuThreads}
                            min={1}
                            max={256}
                            step={1}
                            unit=""
                            color="cyan"
                        />
                    </div>
                </div>
            </div>

            {(!isUnified) && (
                <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            <HardDrive className="w-5 h-5 text-purple-400" /> GPU Config
                        </h2>
                        <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-0.5">
                            <button
                                onClick={() => setGpuEnabled(false)}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${!gpuEnabled ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                None
                            </button>
                            <button
                                onClick={() => setGpuEnabled(true)}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${gpuEnabled ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                Active
                            </button>
                        </div>
                    </div>

                    {gpuEnabled && (
                        <>
                            <div className="mb-2 p-2 rounded-lg bg-slate-700/50 border border-slate-600/50 flex items-center justify-between backdrop-blur-sm">
                                <span className="text-xs font-medium text-slate-200">Mismatched GPUs</span>
                                <button
                                    onClick={() => setMismatchedEnabled(!mismatchedEnabled)}
                                    disabled={totalVRAM === 0}
                                    className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all duration-200 ${totalVRAM === 0
                                        ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                                        : mismatchedEnabled
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                                        }`}
                                >
                                    {mismatchedEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>

                            {mismatchedEnabled ? (
                                <div className="space-y-2 mb-2">
                                    {gpuList.map((gpu, idx) => (
                                        <div key={gpu.id} className="flex items-center gap-1 bg-slate-900/50 p-1.5 rounded border border-slate-700/30">
                                            <span className="text-[10px] font-mono text-slate-400 w-4">#{idx + 1}</span>
                                            <select
                                                value={gpu.brand || 'nvidia'}
                                                onChange={(e) => updateGpu(gpu.id, 'brand', e.target.value)}
                                                className="bg-slate-800 text-white text-[10px] rounded px-1 py-0.5 border border-slate-600 focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="nvidia">NVIDIA</option>
                                                <option value="amd">AMD</option>
                                                <option value="intel">Intel</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={gpu.name}
                                                onChange={(e) => updateGpu(gpu.id, 'name', e.target.value)}
                                                className="bg-transparent text-white text-xs border-b border-slate-600 flex-1 focus:outline-none focus:border-blue-500 transition-colors min-w-0"
                                                placeholder="Name"
                                            />
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={gpu.vram}
                                                    onChange={(e) => updateGpu(gpu.id, 'vram', Number(e.target.value))}
                                                    className="w-8 bg-slate-700 text-white text-[10px] rounded px-0.5 py-0.5 text-center focus:ring-1 focus:ring-blue-500 outline-none"
                                                />
                                                <span className="text-[10px] text-slate-400">GB</span>
                                            </div>
                                            <button onClick={() => removeGpu(gpu.id)} className="text-red-400 hover:text-red-300 transition-colors p-0.5 hover:bg-red-900/20 rounded">
                                                <MinusSquare className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={addGpu} className="w-full py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded text-[10px] font-bold text-blue-300 flex items-center justify-center gap-1 border border-dashed border-slate-600 hover:border-blue-400 transition-all">
                                        <PlusSquare className="w-3 h-3" /> Add GPU
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <LabeledInput
                                        label="Number of GPUs"
                                        value={numGPUs}
                                        setter={setNumGPUs}
                                        min={1}
                                        max={8}
                                        step={1}
                                        unit="x"
                                        color="purple"
                                    />
                                    <LabeledInput
                                        label="VRAM per GPU"
                                        value={totalVRAM}
                                        setter={setTotalVRAM}
                                        min={0}
                                        max={192}
                                        step={2}
                                        unit="GB"
                                        color="blue"
                                    />
                                </>
                            )}
                        </>
                    )}
                </div>
            )}

            {operatingSystem !== 'macos' && (
                <div className="p-3 bg-slate-700/30 rounded-xl shadow-lg border border-slate-700/50 backdrop-blur-sm">
                    <button
                        onClick={() => setShowDetailedSpecs(!showDetailedSpecs)}
                        className='w-full text-left font-bold text-sm flex justify-between items-center text-slate-200 hover:text-white transition-colors'
                    >
                        Advanced Specs
                        {showDetailedSpecs ? <MinusSquare className='w-4 h-4' /> : <PlusSquare className='w-4 h-4' />}
                    </button>

                    {showDetailedSpecs && (
                        <div className='mt-2 grid gap-2 pt-2 border-t border-slate-600/50'>
                            {!mismatchedEnabled && gpuEnabled && (
                                <SelectInput
                                    label="GPU Vendor"
                                    value={gpuVendor}
                                    setter={setGpuVendor}
                                    options={[
                                        { value: 'nvidia', label: 'NVIDIA' },
                                        { value: 'amd', label: 'AMD' },
                                        { value: 'intel', label: 'Intel Arc' }
                                    ]}
                                    color="blue"
                                />
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <SelectInput
                                    label="RAM Type"
                                    value={ramType}
                                    setter={setRamType}
                                    options={[
                                        { value: 'DDR5', label: 'DDR5' },
                                        { value: 'DDR4', label: 'DDR4' },
                                        { value: 'LPDDR5X', label: 'LPDDR5X' },
                                        { value: 'LPDDR5', label: 'LPDDR5' },
                                        { value: 'LPDDR4X', label: 'LPDDR4X' },
                                        { value: 'LPDDR4', label: 'LPDDR4' }
                                    ]}
                                    color="emerald"
                                />
                                <SelectInput
                                    label="Storage Type"
                                    value={storageType}
                                    setter={setStorageType}
                                    options={[
                                        { value: 'NVMeGen4', label: 'NVMe Gen 4' },
                                        { value: 'NVMeGen5', label: 'NVMe Gen 5' },
                                        { value: 'NVMeGen3', label: 'NVMe Gen 3' },
                                        { value: 'SATA', label: 'SATA SSD' },
                                        { value: 'HDD', label: 'HDD' },
                                        { value: 'MicroSD', label: 'MicroSD Card' }
                                    ]}
                                    color="orange"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <LabeledInput
                                    label="RAM Speed (MHz)"
                                    value={ramSpeed}
                                    setter={setRamSpeed}
                                    min={2133}
                                    max={9600}
                                    step={100}
                                    color="emerald"
                                />
                                <LabeledInput
                                    label="RAM CL Rating"
                                    value={ramClRating}
                                    setter={setRamClRating}
                                    min={10}
                                    max={40}
                                    step={1}
                                    color="emerald"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HardwareConfig;
