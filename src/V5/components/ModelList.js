import React, { useState, useEffect } from 'react';
import { Layers, Plus, Server, Trash2 } from 'lucide-react';
import CommandExporter from './CommandExporter';
import { colorMap, precisionBits } from '../utils/constants';
import Tooltip from './Tooltip';

const LabeledInput = ({ label, value, setter, type = 'range', min = 0, max = 100, step = 1, unit = '', color = 'slate', disabled = false, warning = null }) => {
    const [localValue, setLocalValue] = useState(String(value));
    useEffect(() => { setLocalValue(String(value)); }, [value]);
    const handleChange = (e) => setLocalValue(e.target.value);
    const commit = () => setter(Math.min(Math.max(Number(localValue), min), max));

    return (
        <div className={`mb-2 p-2 rounded-lg shadow-inner transition-colors duration-200 ${disabled ? 'bg-slate-800 opacity-50' : 'bg-slate-700'}`}>
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

const SelectInput = ({ label, value, setter, options, disabled = false, color = 'slate' }) => (
    <div className={`mb-2 p-2 rounded-lg shadow-inner bg-slate-700 border-l-2`} style={{ borderColor: colorMap[color] }}>
        <label className="block text-xs font-medium text-slate-200 mb-1">{label}</label>
        <select value={value} onChange={(e) => setter(e.target.value)} disabled={disabled} className="w-full bg-slate-600 text-white text-xs rounded px-2 py-1">
            {options.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
    </div>
);

const ModelList = ({ models, updateModel, addModel, removeModel, applyPreset, isUnified, hardware }) => {
    const handleWeightSizeChange = (model, gb) => {
        const bits = precisionBits[model.precision] || 4;
        const bytesPerParam = bits / 8;
        const params = (gb * Math.pow(1024, 3)) / (bytesPerParam * 1e9);
        updateModel(model.id, 'modelSize', Number(params.toFixed(2)));
    };

    const handleKVSizeChange = (model, gb) => {
        const kvBytes = (precisionBits[model.kvCachePrecision] || 16) / 8;
        const batch = model.batchSize || 1;
        const hidden = model.hiddenSize || 4096;
        const layers = model.numLayers || 32;

        if (hidden === 0 || layers === 0) return;

        const context = (gb * Math.pow(1024, 3)) / (2 * hidden * batch * kvBytes * layers);
        updateModel(model.id, 'contextLength', Math.round(context));
    };

    const getWeightsGB = (model) => {
        const bits = precisionBits[model.precision] || 4;
        const bytesPerParam = bits / 8;
        return (model.modelSize * 1e9 * bytesPerParam) / Math.pow(1024, 3);
    };

    const getKVGB = (model) => {
        const kvBytes = (precisionBits[model.kvCachePrecision] || 16) / 8;
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div>
                            <LabeledInput
                                label={<span className="flex items-center">Params (B)<Tooltip text="Model size in billions of parameters. Larger models need more VRAM but generally perform better." /></span>}
                                value={model.modelSize}
                                setter={v => updateModel(model.id, 'modelSize', v)}
                                min={0.5}
                                max={180}
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
                                max={128000}
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
                        </div>
                        <div>
                            <LabeledInput
                                label={<span className="flex items-center">Total Layers<Tooltip text="Number of transformer layers in the model. More layers = better quality but more VRAM needed." /></span>}
                                value={model.numLayers}
                                setter={v => updateModel(model.id, 'numLayers', v)}
                                min={1}
                                max={200}
                                step={1}
                                color="slate"
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
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ModelList;
