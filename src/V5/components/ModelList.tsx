import React, { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Layers, Plus, Server, Trash2 } from 'lucide-react';
import CommandExporter from './CommandExporter';
import { colorMap, precisionBits } from '../utils/constants';
import Tooltip from './Tooltip';
import getBackendRecommendation from '../utils/backendHelper';
import { Model, Hardware } from '../types';

// Type Definitions
interface LabeledInputProps {
    label: ReactNode;
    value: number;
    setter: (value: number) => void;
    type?: 'range';
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    color?: string;
    borderColor?: string | null;
    disabled?: boolean;
    warning?: string | null;
}

interface SelectInputProps {
    label: ReactNode;
    value: string;
    setter: (value: string) => void;
    options: Array<{ value: string; label: string; disabled?: boolean }>;
    disabled?: boolean;
    color?: string;
}



interface ModelListProps {
    models: Model[];
    updateModel: (id: number, field: string, value: any) => void;
    addModel: () => void;
    removeModel: (id: number) => void;
    applyPreset: (id: number, preset: string) => void;
    isUnified: boolean;
    hardware: Hardware;
    allowOverload: boolean;
    gpuList: any[];
    systemRamSize: number;
}

const LabeledInput: React.FC<LabeledInputProps> = ({ label, value, setter, type = 'range', min = 0, max = 100, step = 1, unit = '', color = 'slate', borderColor = null, disabled = false, warning = null }) => {
    const [localValue, setLocalValue] = useState<string>(String(value));
    useEffect(() => { setLocalValue(String(value)); }, [value]);
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => setLocalValue(e.target.value);
    const commit = () => setter(Math.min(Math.max(Number(localValue), min), max));

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
    const finalBorderColor = borderColor ? (colorMap as any)[borderColor] : ((colorMap as any)[color] || 'transparent');

    return (
        <div className={`mb-2 p-2 rounded-lg shadow-inner transition-colors duration-200 border-l-2 ${disabled ? 'bg-slate-800 opacity-50' : bgColor}`} style={{ borderColor: finalBorderColor }}>
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
                        value={localValue}
                        onChange={handleChange}
                        onMouseUp={commit}
                        onTouchEnd={commit}
                        disabled={disabled}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-600"
                    />
                )}
                <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue}
                    onChange={handleChange}
                    onBlur={commit}
                    disabled={disabled}
                    className="w-16 rounded px-1 py-0.5 text-center text-xs text-white bg-slate-600"
                />
                {unit && <span className="text-white text-[10px] font-bold min-w-[20px] text-right">{unit}</span>}
            </div>
        </div>
    );
};

const SelectInput: React.FC<SelectInputProps> = ({ label, value, setter, options, disabled = false, color = 'slate' }) => (
    <div className={`mb-2 p-2 rounded-lg shadow-inner bg-slate-700 border-l-2`} style={{ borderColor: (colorMap as any)[color] }}>
        <label className="block text-xs font-medium text-slate-200 mb-1">{label}</label>
        <select value={value} onChange={(e) => setter(e.target.value)} disabled={disabled} className="w-full bg-slate-600 text-white text-xs rounded px-2 py-1">
            {options.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
    </div>
);

const ModelList: React.FC<ModelListProps> = ({ models, addModel, removeModel, updateModel, applyPreset, isUnified, hardware, allowOverload, gpuList, systemRamSize }) => {
    // Constraints toggle state per model
    const [constraintsEnabled, setConstraintsEnabled] = React.useState<Record<number, boolean>>({});

    const toggleConstraints = (modelId: number) => {
        setConstraintsEnabled(prev => ({
            ...prev,
            [modelId]: !prev[modelId]
        }));
    };

    const handleWeightSizeChange = (model: Model, gb: number) => {
        if (!constraintsEnabled[model.id]) {
            // Just update weights size without syncing params
            return;
        }
        const bits = (precisionBits as any)[model.precision] || 4;
        const bytesPerParam = bits / 8;
        const params = (gb * Math.pow(1024, 3)) / (bytesPerParam * 1e9);
        updateModel(model.id, 'modelSize', Number(params.toFixed(2)));
    };

    const handleKVSizeChange = (model: Model, gb: number) => {
        if (!constraintsEnabled[model.id]) {
            // Just update KV size without syncing context
            return;
        }
        const kvBytes = ((precisionBits as any)[model.kvCachePrecision] || 16) / 8;
        const batch = model.batchSize || 1;
        const hidden = model.hiddenSize || 4096;
        const layers = model.numLayers || 32;

        if (hidden === 0 || layers === 0) return;

        const context = (gb * Math.pow(1024, 3)) / (2 * hidden * batch * kvBytes * layers);
        updateModel(model.id, 'contextLength', Math.round(context));
    };

    const getWeightsGB = (model: Model): number => {
        const bits = (precisionBits as any)[model.precision] || 4;
        const bytesPerParam = bits / 8;
        return (model.modelSize * 1e9 * bytesPerParam) / Math.pow(1024, 3);
    };

    const getKVGB = (model: Model): number => {
        const kvBytes = ((precisionBits as any)[model.kvCachePrecision] || 16) / 8;
        const batch = model.batchSize || 1;
        const hidden = model.hiddenSize || 4096;
        const layers = model.numLayers || 32;
        return (2 * model.contextLength * hidden * batch * kvBytes * layers) / Math.pow(1024, 3);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" /> Models
                </h2>
                <button
                    onClick={addModel}
                    className="px-3 py-1.5 bg-blue-600 rounded-lg font-bold flex gap-2 hover:bg-blue-500 text-white transition-colors text-xs"
                >
                    <Plus className="w-4 h-4" /> Add
                </button>
            </div>

            {models.map((model) => (
                <div key={model.id} className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl shadow-xl border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex justify-between mb-3 border-b border-slate-700/50 pb-2">
                        <h3 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 flex items-center gap-2">
                            <Server className="w-4 h-4 text-teal-400" /> {model.name}
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-slate-900/80 rounded p-0.5 backdrop-blur-md">
                                {['gpuOnly', 'hybrid', 'cpuOnly'].map(m => {
                                    const isGpuMode = m === 'gpuOnly' || m === 'hybrid';
                                    const hasActiveGPU = isUnified || (hardware.gpuEnabled !== false);
                                    const shouldDisable = isGpuMode && !hasActiveGPU;

                                    return (
                                        <button
                                            key={m}
                                            onClick={() => !shouldDisable && updateModel(model.id, 'mode', m)}
                                            disabled={shouldDisable}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all duration-200 
                                                ${model.mode === m
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                                    : shouldDisable
                                                        ? 'text-slate-600 cursor-not-allowed bg-slate-800/50'
                                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            {m.toUpperCase().replace('ONLY', '')}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900/50 rounded border border-slate-600/50 px-2 py-1">
                                <span className="text-[9px] font-medium text-slate-400">Overload:</span>
                                <div className="flex bg-slate-700 rounded p-0.5">
                                    <button
                                        onClick={() => toggleConstraints(model.id)}
                                        className={`px-2 py-0.5 text-[9px] font-bold rounded transition-colors ${constraintsEnabled[model.id]
                                            ? 'bg-emerald-600 text-white'
                                            : 'text-slate-400'
                                            }`}
                                        title="Allow memory/VRAM overload"
                                    >
                                        YES
                                    </button>
                                    <button
                                        onClick={() => toggleConstraints(model.id)}
                                        className={`px-2 py-0.5 text-[9px] font-bold rounded transition-colors ${!constraintsEnabled[model.id]
                                            ? 'bg-red-600 text-white'
                                            : 'text-slate-400'
                                            }`}
                                        title="Prevent memory/VRAM overload (safer)"
                                    >
                                        NO
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => applyPreset(model.id, 'speed')} className="px-2 py-0.5 bg-slate-700/50 hover:bg-indigo-600/80 rounded text-[10px] text-indigo-300 hover:text-white transition-colors border border-indigo-500/30" title="Max Speed (GPU, INT4)">Speed</button>
                                <button onClick={() => applyPreset(model.id, 'balance')} className="px-2 py-0.5 bg-slate-700/50 hover:bg-green-600/80 rounded text-[10px] text-green-300 hover:text-white transition-colors border border-green-500/30" title="Balanced (Hybrid, INT8)">Bal</button>
                                <button onClick={() => applyPreset(model.id, 'context')} className="px-2 py-0.5 bg-slate-700/50 hover:bg-purple-600/80 rounded text-[10px] text-purple-300 hover:text-white transition-colors border border-purple-500/30" title="Max Context (Hybrid, 16k)">Ctx</button>
                            </div>
                            {models.length > 1 && (
                                <button onClick={() => removeModel(model.id)} className="text-red-400 hover:text-red-300 transition-colors p-0.5 hover:bg-red-900/20 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <CommandExporter model={model} hardware={hardware} isUnified={isUnified} />

                    {/* Model Configuration Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                        {/* CALCULATE DYNAMIC MAX VALUES BASED ON OVERLOAD STATE */}
                        {(() => {
                            let maxModelSize = 180; // Default: No restrictions
                            let maxContextLength = 128000; // Default: No restrictions

                            if (!allowOverload) {
                                // Calculate available resources
                                const totalVRAM = gpuList.reduce((sum: number, gpu: any) => sum + gpu.vram, 0);
                                const availableVRAM = Math.max(0, totalVRAM - 2); // Reserve 2GB overhead
                                const availableRAM = systemRamSize * 0.75; // Reserve 25% for OS

                                // Calculate max model size based on mode
                                if (model.mode === 'gpuOnly' && availableVRAM > 0) {
                                    // Rough estimate: ~0.6 GB per B param for q4
                                    maxModelSize = Math.floor(availableVRAM / 0.6);
                                } else if (model.mode === 'hybrid') {
                                    maxModelSize = Math.floor((availableVRAM + availableRAM) / 0.6);
                                } else if (model.mode === 'cpuOnly') {
                                    maxModelSize = Math.floor(availableRAM / 0.6);
                                }

                                // Calculate max context based on VRAM
                                if (availableVRAM >= 16) {
                                    maxContextLength = 32768;
                                } else if (availableVRAM >= 8) {
                                    maxContextLength = 8192;
                                } else {
                                    maxContextLength = 4096;
                                }

                                // Ensure current value doesn't exceed new max
                                maxModelSize = Math.max(1, maxModelSize);
                                maxContextLength = Math.max(512, maxContextLength);
                            }

                            return (
                                <>
                                    <div>
                                        <LabeledInput
                                            label={<span className="flex items-center">Params (B)<Tooltip text="Model size in billions of parameters. Larger models need more VRAM but generally perform better." /></span>}
                                            value={model.modelSize}
                                            setter={v => updateModel(model.id, 'modelSize', v)}
                                            min={0.5}
                                            max={maxModelSize}
                                            step={0.5}
                                            unit="B"
                                            color="blue"
                                        />
                                        <SelectInput
                                            label={<span className="flex items-center">Precision<Tooltip text="Quantization level: fp16=full quality, q4_k_m=4-bit (smaller, faster), int8=8-bit. Lower precision uses less VRAM." /></span>}
                                            value={model.precision}
                                            setter={v => updateModel(model.id, 'precision', v)}
                                            options={Object.keys(precisionBits).map(k => ({ value: k, label: k }))}
                                            color="blue"
                                        />
                                    </div>
                                    <div>
                                        <LabeledInput
                                            label="Weights Size"
                                            value={Number(getWeightsGB(model).toFixed(2))}
                                            setter={(v) => handleWeightSizeChange(model, v)}
                                            min={0.1}
                                            max={192}
                                            step={0.1}
                                            unit="GB"
                                            color="blue"
                                        />
                                        <LabeledInput
                                            label="KV Cache Size"
                                            value={Number(getKVGB(model).toFixed(2))}
                                            setter={(v) => handleKVSizeChange(model, v)}
                                            min={0.01}
                                            max={128}
                                            step={0.01}
                                            unit="GB"
                                            color="purple"
                                        />
                                    </div>
                                    <div>
                                        <LabeledInput
                                            label={<span className="flex items-center">Context Length<Tooltip text="Maximum conversation length in tokens. Longer context needs more VRAM but remembers more history." /></span>}
                                            value={model.contextLength}
                                            setter={v => updateModel(model.id, 'contextLength', v)}
                                            min={512}
                                            max={maxContextLength}
                                            step={512}
                                            color="purple"
                                        />
                                        <SelectInput
                                            label={<span className="flex items-center">KV Precision<Tooltip text="Precision for Key-Value cache. fp16=full quality, int8=uses less VRAM but may slightly reduce quality." /></span>}
                                            value={model.kvCachePrecision}
                                            setter={v => updateModel(model.id, 'kvCachePrecision', v)}
                                            options={['fp16', 'int8'].map(k => ({ value: k, label: k }))}
                                            color="purple"
                                        />
                                        <LabeledInput
                                            label={<span className="flex items-center">Batch Size<Tooltip text="Number of sequences processed in parallel. Larger batches use more VRAM but increase throughput." /></span>}
                                            value={model.batchSize}
                                            setter={v => updateModel(model.id, 'batchSize', v)}
                                            min={1}
                                            max={512}
                                            step={1}
                                            color="purple"
                                            borderColor="orange"
                                        />
                                    </div>
                                    <div>
                                        <div className="mb-2 p-2 rounded-lg shadow-inner bg-indigo-900/20 border-l-2" style={{ borderColor: (colorMap as any).indigo }}>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-xs font-medium text-slate-200 flex items-center">
                                                    Flash Attention<Tooltip text="Optimized attention implementation. Reduces VRAM usage and increases speed. Only supported by LM Studio and llama.cpp (with FA build)." />
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded">
                                                <button
                                                    onClick={() => updateModel(model.id, 'flashAttention', false)}
                                                    disabled={hardware.inferenceSoftware === 'ollama'}
                                                    className={`flex-1 px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${!model.flashAttention
                                                        ? 'bg-slate-600 text-white'
                                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                                        } ${hardware.inferenceSoftware === 'ollama' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    OFF
                                                </button>
                                                <button
                                                    onClick={() => updateModel(model.id, 'flashAttention', true)}
                                                    disabled={hardware.inferenceSoftware === 'ollama'}
                                                    className={`flex-1 px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${model.flashAttention
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                                        } ${hardware.inferenceSoftware === 'ollama' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    ON
                                                </button>
                                            </div>
                                            {hardware.inferenceSoftware === 'ollama' && (
                                                <p className="text-[9px] text-yellow-400 mt-1">Not supported by Ollama</p>
                                            )}
                                        </div>
                                        <LabeledInput
                                            label={<span className="flex items-center">Total Layers<Tooltip text="Number of transformer layers in the model. More layers = better quality but more VRAM needed." /></span>}
                                            value={model.numLayers}
                                            setter={v => updateModel(model.id, 'numLayers', v)}
                                            min={1}
                                            max={200}
                                            step={1}
                                            color="cyan"
                                            borderColor="emerald"
                                        />
                                        {!isUnified && (hardware.gpuEnabled !== false) && (
                                            <>
                                                <LabeledInput
                                                    label={<span className="flex items-center">GPU Layers<Tooltip text="Number of layers loaded on GPU. More GPU layers = faster but needs more VRAM." /></span>}
                                                    value={model.gpuLayers}
                                                    setter={v => updateModel(model.id, 'gpuLayers', v)}
                                                    min={0}
                                                    max={model.numLayers}
                                                    disabled={model.mode !== 'hybrid'}
                                                    color="indigo"
                                                    borderColor="emerald"
                                                />
                                                <div className="text-center text-[10px] font-mono text-slate-400 mt-1 bg-slate-900/50 p-1 rounded border border-slate-700/50">
                                                    CPU Layers: <span className="text-emerald-400 font-bold">{Math.max(0, model.numLayers - model.gpuLayers)}</span>
                                                </div>
                                            </>
                                        )}
                                        {isUnified && (
                                            <div className="text-xs text-slate-400 italic mt-2 text-center border border-slate-600/50 p-2 rounded bg-slate-900/30 backdrop-blur-sm">
                                                Unified Memory Managed Automatically
                                            </div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* LM Studio Advanced Settings */}
                    {
                        hardware.inferenceSoftware === 'lmstudio' && (
                            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                                    <span className="text-blue-400">⚙️</span> LM Studio Advanced Settings
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {/* Memory Optimization Toggles */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-300 block mb-2">Memory Optimization</label>

                                        <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-emerald-500/30">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-200">KV Cache FP16</span>
                                                <Tooltip text="Store KV cache in 16-bit precision. Reduces memory usage by ~50% with minimal quality impact." />
                                            </div>
                                            <button
                                                onClick={() => updateModel(model.id, 'useKVF16', !model.useKVF16)}
                                                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${model.useKVF16
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-600 text-slate-300'
                                                    }`}
                                            >
                                                {model.useKVF16 ? 'ON' : 'OFF'}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-indigo-500/30">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-200">Use Mmap</span>
                                                <Tooltip text="Memory-mapped file access. Improves load times by mapping model directly from disk." />
                                            </div>
                                            <button
                                                onClick={() => updateModel(model.id, 'useMmap', !model.useMmap)}
                                                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${model.useMmap
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-600 text-slate-300'
                                                    }`}
                                            >
                                                {model.useMmap ? 'ON' : 'OFF'}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-orange-500/30">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-200">Use Mlock</span>
                                                <Tooltip text="Prevent model from being swapped to disk. Reserves RAM but improves performance." />
                                            </div>
                                            <button
                                                onClick={() => updateModel(model.id, 'useMlock', !model.useMlock)}
                                                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${model.useMlock
                                                    ? 'bg-orange-600 text-white'
                                                    : 'bg-slate-600 text-slate-300'
                                                    }`}
                                            >
                                                {model.useMlock ? 'ON' : 'OFF'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* RoPE Scaling */}
                                    <div>
                                        <label className="text-xs font-medium text-slate-300 block mb-2">RoPE Scaling</label>
                                        <LabeledInput
                                            label={<span className="flex items-center">Frequency Base<Tooltip text="RoPE frequency base. Default 10000. Higher values allow better context extension." /></span>}
                                            value={model.ropeFrequencyBase || 10000}
                                            setter={v => updateModel(model.id, 'ropeFrequencyBase', v)}
                                            min={1000}
                                            max={1000000}
                                            step={1000}
                                            color="purple"
                                            borderColor="cyan"
                                        />
                                        <LabeledInput
                                            label={<span className="flex items-center">Frequency Scale<Tooltip text="RoPE frequency scale. 1.0 = default. Lower values extend context but may reduce quality." /></span>}
                                            value={model.ropeFrequencyScale || 1.0}
                                            setter={v => updateModel(model.id, 'ropeFrequencyScale', v)}
                                            min={0.1}
                                            max={2.0}
                                            step={0.1}
                                            color="purple"
                                            borderColor="cyan"
                                        />
                                    </div>

                                    {/* Thread Control */}
                                    <div>
                                        <label className="text-xs font-medium text-slate-300 block mb-2">Performance</label>
                                        <LabeledInput
                                            label={<span className="flex items-center">CPU Threads<Tooltip text="Number of CPU threads for inference. 0 = auto-detect." /></span>}
                                            value={model.numThreads || 0}
                                            setter={v => updateModel(model.id, 'numThreads', v)}
                                            min={0}
                                            max={128}
                                            step={1}
                                            color="cyan"
                                            borderColor="emerald"
                                        />
                                        <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-700/50">
                                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                                <strong className="text-yellow-400">Note:</strong> LM Studio specific settings. Optimal values depend on your hardware.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {/* llama.cpp GPU Backend Selection */}
                    {
                        hardware.inferenceSoftware === 'llama.cpp' && (hardware.gpuEnabled !== false || hardware.operatingSystem === 'macos') && (
                            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                                    <span className="text-purple-400">🚀</span> llama.cpp GPU Backend
                                </h4>

                                {/* Intel Mac Warning */}
                                {hardware.operatingSystem === 'macos' && hardware.chipType === 'intel' && (
                                    <div className="mb-3 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-300 flex items-start gap-2">
                                        <span className="text-yellow-400">⚠️</span>
                                        <div>
                                            <strong>Intel Mac Detected:</strong> Metal is NOT recommended for Intel Macs.
                                            <ul className="mt-1 ml-4 list-disc text-[10px]">
                                                <li>AMD eGPU: Use <strong className="text-white">Vulkan</strong></li>
                                                <li>Intel GPU: Use <strong className="text-white">SYCL</strong> (requires oneAPI)</li>
                                                <li>CPU-only: Set GPU layers to 0</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Backend Selection */}
                                    <div>
                                        <label className="text-xs font-medium text-slate-300 block mb-2">GPU Backend</label>
                                        <select
                                            value={model.gpuBackend}
                                            onChange={(e) => updateModel(model.id, 'gpuBackend', e.target.value)}
                                            className="w-full bg-slate-600 text-white text-xs rounded px-2 py-1.5 border border-slate-500 focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="auto">Auto-Detect</option>
                                            <option value="cuda" disabled={hardware.operatingSystem === 'macos'}>CUDA (NVIDIA)</option>
                                            <option value="metal">Metal (Apple Silicon)</option>
                                            <option value="vulkan">Vulkan (Cross-Platform)</option>
                                            <option value="rocm" disabled={hardware.operatingSystem === 'macos' || hardware.operatingSystem === 'windows'}>ROCm (AMD Linux)</option>
                                            <option value="sycl">SYCL/oneAPI (Intel)</option>
                                        </select>
                                        <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-700/50">
                                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                                {getBackendRecommendation(hardware, model.gpuBackend)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Backend Info */}
                                    <div>
                                        <label className="text-xs font-medium text-slate-300 block mb-2">Backend Compatibility</label>
                                        <div className="space-y-1 text-[10px]">
                                            <div className="flex items-center justify-between p-1.5 bg-slate-700/50 rounded">
                                                <span className="text-slate-300">CUDA (NVIDIA):</span>
                                                <span className={hardware.operatingSystem !== 'macos' ? 'text-green-400' : 'text-red-400'}>
                                                    {hardware.operatingSystem !== 'macos' ? '✓ Available' : '✗ macOS'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-1.5 bg-slate-700/50 rounded">
                                                <span className="text-slate-300">Metal (Apple):</span>
                                                <span className={hardware.operatingSystem === 'macos' && hardware.chipType === 'appleSilicon' ? 'text-green-400' : 'text-yellow-400'}>
                                                    {hardware.operatingSystem === 'macos' && hardware.chipType === 'appleSilicon' ? '✓ Optimal' : hardware.operatingSystem === 'macos' ? '⚠ Poor Intel Mac' : '✗ Non-macOS'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-1.5 bg-slate-700/50 rounded">
                                                <span className="text-slate-300">Vulkan:</span>
                                                <span className="text-green-400">✓ Universal</span>
                                            </div>
                                            <div className="flex items-center justify-between p-1.5 bg-slate-700/50 rounded">
                                                <span className="text-slate-300">ROCm (AMD):</span>
                                                <span className={hardware.operatingSystem === 'linux' ? 'text-green-400' : 'text-yellow-400'}>
                                                    {hardware.operatingSystem === 'linux' ? '✓ Linux Only' : '⚠ Linux Best'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-1.5 bg-slate-700/50 rounded">
                                                <span className="text-slate-300">SYCL (Intel):</span>
                                                <span className="text-yellow-400">⚠ Req. oneAPI</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            ))}
        </div>
    );
};

export default ModelList;
