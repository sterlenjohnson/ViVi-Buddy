import React from 'react';
import { Cpu, HardDrive, MinusSquare, PlusSquare } from 'lucide-react';
import { colorMap } from '../utils/constants';

const LabeledInput = ({ label, value, setter, type = 'range', min = 0, max = 100, step = 1, unit = '', color = 'slate', disabled = false, warning = null }) => {
    const handleChange = (e) => setter(Number(e.target.value));

    return (
        <div className={`mb-4 p-3 rounded-lg shadow-inner transition-colors duration-200 ${disabled ? 'bg-slate-800 opacity-50' : 'bg-slate-700'}`}>
            <label className="block text-sm font-medium text-slate-200 mb-1">{label}</label>
            {warning && <p className="text-xs text-red-400 mb-1">{warning}</p>}
            <div className="flex items-center gap-3">
                {type === 'range' && (
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-600"
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
                    className="w-20 rounded px-2 py-1 text-center text-white bg-slate-600"
                />
                {unit && <span className="text-white font-bold min-w-[40px] text-right">{unit}</span>}
            </div>
        </div>
    );
};

const SelectInput = ({ label, value, setter, options, disabled = false, color = 'slate' }) => (
    <div className={`mb-4 p-3 rounded-lg shadow-inner bg-slate-700 border-l-4`} style={{ borderColor: colorMap[color] }}>
        <label className="block text-sm font-medium text-slate-200 mb-1">{label}</label>
        <select value={value} onChange={(e) => setter(e.target.value)} disabled={disabled} className="w-full bg-slate-600 text-white rounded px-3 py-2">
            {options.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
    </div>
);

const HardwareConfig = ({
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
    inferenceSoftware, setInferenceSoftware,
    isUnified, hasGPU,
    mismatchedEnabled, setMismatchedEnabled,
    gpuList, updateGpu, addGpu, removeGpu,
    cpuCores, setCpuCores,
    cpuThreads, setCpuThreads
}) => {
    return (
        <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    <Cpu className="w-7 h-7 text-blue-400" /> Platform
                </h2>

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

                {operatingSystem === 'macos' && (
                    <SelectInput
                        label="Chip Type"
                        value={chipType}
                        setter={setChipType}
                        options={[
                            { value: 'appleSilicon', label: 'Apple Silicon' },
                            { value: 'intel', label: 'Intel Mac' }
                        ]}
                        color="indigo"
                    />
                )}
            </div>

            <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    <HardDrive className="w-7 h-7 text-emerald-400" /> Memory
                </h2>

                <LabeledInput
                    label="System RAM"
                    value={systemRAMAmount}
                    setter={setSystemRAMAmount}
                    min={8}
                    max={512}
                    step={4}
                    unit="GB"
                    color="emerald"
                />

                {/* CPU Configuration */}
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <Cpu className="w-4 h-4" /> CPU Configuration
                    </h3>
                    <LabeledInput
                        label="CPU Cores"
                        value={cpuCores}
                        setter={setCpuCores}
                        min={1}
                        max={128}
                        step={1}
                        unit="Cores"
                        color="cyan"
                    />
                    <LabeledInput
                        label="CPU Threads"
                        value={cpuThreads}
                        setter={setCpuThreads}
                        min={1}
                        max={256}
                        step={1}
                        unit="Threads"
                        color="cyan"
                    />
                    <div className="text-xs text-slate-400 mt-1 italic">
                        💡 Optimal threads: ~{(cpuCores * 1.5).toFixed(0)} (1.5× cores)
                    </div>
                </div>

                {!isUnified && hasGPU && (
                    <>
                        <div className="mb-4 p-3 rounded-lg bg-slate-700/50 border border-slate-600/50 flex items-center justify-between backdrop-blur-sm">
                            <span className="text-sm font-medium text-slate-200">Mismatched GPUs</span>
                            <button
                                onClick={() => setMismatchedEnabled(!mismatchedEnabled)}
                                disabled={totalVRAM === 0}
                                className={`px-3 py-1 text-xs rounded font-bold transition-all duration-200 ${totalVRAM === 0
                                    ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                                    : mismatchedEnabled
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                                    }`}
                            >
                                {mismatchedEnabled ? 'ENABLED' : 'DISABLED'}
                            </button>
                        </div>

                        {mismatchedEnabled ? (
                            <div className="space-y-3 mb-4">
                                {gpuList.map((gpu, idx) => (
                                    <div key={gpu.id} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded border border-slate-700/30">
                                        <span className="text-xs font-mono text-slate-400 w-6">#{idx + 1}</span>
                                        <select
                                            value={gpu.brand || 'nvidia'}
                                            onChange={(e) => updateGpu(gpu.id, 'brand', e.target.value)}
                                            className="bg-slate-800 text-white text-xs rounded px-1 py-1 border border-slate-600 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="nvidia">NVIDIA</option>
                                            <option value="amd">AMD</option>
                                            <option value="intel">Intel</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={gpu.name}
                                            onChange={(e) => updateGpu(gpu.id, 'name', e.target.value)}
                                            className="bg-transparent text-white text-sm border-b border-slate-600 flex-1 focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="GPU Name"
                                        />
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={gpu.vram}
                                                onChange={(e) => updateGpu(gpu.id, 'vram', Number(e.target.value))}
                                                className="w-12 bg-slate-700 text-white text-xs rounded px-1 py-1 text-center focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                            <span className="text-xs text-slate-400">GB</span>
                                        </div>
                                        <button onClick={() => removeGpu(gpu.id)} className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-900/20 rounded">
                                            <MinusSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={addGpu} className="w-full py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs font-bold text-blue-300 flex items-center justify-center gap-2 border border-dashed border-slate-600 hover:border-blue-400 transition-all">
                                    <PlusSquare className="w-4 h-4" /> Add GPU
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
                                    unit="Cards"
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

            {operatingSystem !== 'macos' && (
                <div className="p-4 bg-slate-700/30 rounded-xl shadow-lg border border-slate-700/50 backdrop-blur-sm">
                    <button
                        onClick={() => setShowDetailedSpecs(!showDetailedSpecs)}
                        className='w-full text-left font-bold text-lg flex justify-between items-center text-slate-200 hover:text-white transition-colors'
                    >
                        Advanced Specs
                        {showDetailedSpecs ? <MinusSquare className='w-5 h-5' /> : <PlusSquare className='w-5 h-5' />}
                    </button>

                    {showDetailedSpecs && (
                        <div className='mt-4 grid gap-4 pt-4 border-t border-slate-600/50'>
                            {!mismatchedEnabled && (
                                <SelectInput
                                    label="GPU Vendor"
                                    value={gpuVendor}
                                    setter={setGpuVendor}
                                    options={[
                                        { value: 'nvidia', label: 'NVIDIA' },
                                        { value: 'amd', label: 'AMD' },
                                        { value: 'intel', label: 'Intel Arc' }
                                    ]}
                                />
                            )}
                            <SelectInput
                                label="RAM Type"
                                value={ramType}
                                setter={setRamType}
                                options={[
                                    { value: 'DDR5', label: 'DDR5' },
                                    { value: 'DDR4', label: 'DDR4' }
                                ]}
                            />
                            <LabeledInput
                                label="RAM Speed (MHz)"
                                value={ramSpeed}
                                setter={setRamSpeed}
                                min={2133}
                                max={8400}
                                step={100}
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
                                    { value: 'HDD', label: 'HDD' }
                                ]}
                            />
                            <LabeledInput
                                label="RAM CL Rating"
                                value={ramClRating}
                                setter={setRamClRating}
                                min={10}
                                max={40}
                                step={1}
                            />
                            <SelectInput
                                label="Inference Software"
                                value={inferenceSoftware}
                                setter={setInferenceSoftware}
                                options={[
                                    { value: 'ollama', label: 'Ollama' },
                                    { value: 'llama.cpp', label: 'Llama.cpp' },
                                    { value: 'lmstudio', label: 'LM Studio' },
                                    { value: 'vllm', label: 'vLLM' }
                                ]}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HardwareConfig;
