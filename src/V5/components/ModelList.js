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
                        value={localValue}
                        onChange={handleChange}
                        onMouseUp={commit}
                        onTouchEnd={commit}
                        disabled={disabled}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-600"
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

const ModelList = ({ models, updateModel, addModel, removeModel, applyPreset, isUnified, hardware }) => {
    const handleWeightSizeChange = (model, gb) => {
        const bits = precisionBits[model.precision] || 4;
        const bytesPerParam = bits / 8;
        // GB = (Params * 1e9 * bytesPerParam) / 1024^3
        // Params = (GB * 1024^3) / (bytesPerParam * 1e9)
        const params = (gb * Math.pow(1024, 3)) / (bytesPerParam * 1e9);
        updateModel(model.id, 'modelSize', Number(params.toFixed(2)));
    };

    const handleKVSizeChange = (model, gb) => {
        const kvBytes = (precisionBits[model.kvCachePrecision] || 16) / 8;
        // GB = (2 * Context * Hidden * Batch * KVBytes * Layers) / 1024^3
        // Context = (GB * 1024^3) / (2 * Hidden * Batch * KVBytes * Layers)
        // Note: We assume Batch=1 if not editable, but defaultModel has it.
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-6 h-6 text-blue-400" /> Models
                </h2>
                <button
                    onClick={addModel}
                    className="px-4 py-2 bg-blue-600 rounded-lg font-bold flex gap-2 hover:bg-blue-500 text-white transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add
                </button>
            </div>

            {models.map((model) => (
                <div key={model.id} className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-xl border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex justify-between mb-4 border-b border-slate-700/50 pb-2">
                        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 flex items-center gap-2">
                            <Server className="w-5 h-5 text-teal-400" /> {model.name}
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-900/80 rounded p-1 backdrop-blur-md">
                                {['gpuOnly', 'hybrid', 'cpuOnly'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => updateModel(model.id, 'mode', m)}
                                        className={`px-3 py-1 text-xs font-bold rounded transition-all duration-200 ${model.mode === m ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                    >
                                        {m.toUpperCase().replace('ONLY', '')}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => applyPreset(model.id, 'speed')} className="px-2 py-1 bg-slate-700/50 hover:bg-indigo-600/80 rounded text-xs text-indigo-300 hover:text-white transition-colors border border-indigo-500/30" title="Max Speed (GPU, INT4)">Speed</button>
                                <button onClick={() => applyPreset(model.id, 'balance')} className="px-2 py-1 bg-slate-700/50 hover:bg-green-600/80 rounded text-xs text-green-300 hover:text-white transition-colors border border-green-500/30" title="Balanced (Hybrid, INT8)">Bal</button>
                                <button onClick={() => applyPreset(model.id, 'context')} className="px-2 py-1 bg-slate-700/50 hover:bg-purple-600/80 rounded text-xs text-purple-300 hover:text-white transition-colors border border-purple-500/30" title="Max Context (Hybrid, 16k)">Ctx</button>
                            </div>
                            {models.length > 1 && (
                                <button onClick={() => removeModel(model.id)} className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-900/20 rounded">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <CommandExporter model={model} hardware={hardware} isUnified={isUnified} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
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
                            {!isUnified && (
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
                                    <div className="text-center text-xs font-mono text-slate-400 mt-2 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                                        CPU Layers: <span className="text-emerald-400 font-bold">{Math.max(0, model.numLayers - model.gpuLayers)}</span>
                                    </div>
                                </>
                            )}
                            {isUnified && (
                                <div className="text-sm text-slate-400 italic mt-4 text-center border border-slate-600/50 p-3 rounded bg-slate-900/30 backdrop-blur-sm">
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
