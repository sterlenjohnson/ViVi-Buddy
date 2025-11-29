import React, { useState, useMemo, useCallback, useEffect } from 'react';
// STRICT IMPORT CLEANUP: Removed CpuOnly, GpuOnly, and other potential conflict icons.
import {
  Sliders, Cpu, HardDrive, Layers, Maximize, Apple, Settings, Aperture,
  FastForward, Gauge, Zap, MemoryStick, DollarSign, BarChart2, Check,
  TrendingUp, Server, MinusSquare, PlusSquare, ArrowLeft, XCircle, Plus, Trash2,
  Lock, Unlock
} from 'lucide-react';

/**
 * VRAMVisualizer v4.2 (Fixes)
 * - Fixed: Removed invalid lucide-react imports (CpuOnly, GpuOnly).
 * - Fixed: Windows/Linux setup flow now correctly skips the "macOS Architecture" step.
 * - Fixed: Optimization Factor Summary removed.
 * - Feature: Speed/Balance/Context presets restored.
 * - Feature: Hardware Constraint toggle enabled.
 */

const colorMap = {
  blue: '#3b82f6',     // Model Weights (GPU)
  purple: '#8b5cf6',   // KV Cache
  cyan: '#06b6d4',     // Activations
  orange: '#f97316',   // Overhead
  indigo: '#6366f1',   // Optimization
  emerald: '#10b981',  // System RAM
  red: '#ef4444',      // Warning
  green: '#22c5e5',    // Good status
  yellow: '#f59e0b',
  slate: '#64748b',
  teal: '#14b8a6'
};

const parseNumber = (v, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };
const precisionBits = { fp32: 32, fp16: 16, int8: 8, int4: 4 };

const createNewModel = (id) => ({
  id,
  name: `Model ${id}`,
  modelSize: 7,
  precision: 'int4',
  contextLength: 4096,
  kvCachePrecision: 'fp16',
  batchSize: 1,
  numLayers: 32,
  hiddenSize: 4096,
  gpuLayers: 32,
  cpuLayers: 0,
  useSystemRAM: false,
  mode: 'hybrid',
});

const VRAMVisualizer = () => {
  // --- STATE ---
  const [setupStep, setSetupStep] = useState(0);
  const [operatingSystem, setOperatingSystem] = useState('macos');
  const [chipType, setChipType] = useState('appleSilicon');

  const [totalVRAM, setTotalVRAM] = useState(24);
  const [numGPUs, setNumGPUs] = useState(1);
  const [systemRAMAmount, setSystemRAMAmount] = useState(64);
  const [cpuThreads, setCpuThreads] = useState(16);

  const [showDetailedSpecs, setShowDetailedSpecs] = useState(false);
  const [gpuVendor, setGpuVendor] = useState('nvidia');
  const [cpuArchitecture, setCpuArchitecture] = useState('x86');
  const [storageType, setStorageType] = useState('NVMeGen4');
  const [ramType, setRamType] = useState('DDR4');
  const [ramSpeed, setRamSpeed] = useState(3200);
  const [ramClRating, setRamClRating] = useState(16);
  const [inferenceSoftware, setInferenceSoftware] = useState('ollama');

  const [enforceConstraints, setEnforceConstraints] = useState(true);
  const [intelWarning, setIntelWarning] = useState(null);

  const [models, setModels] = useState([createNewModel(1)]);
  // UI State for presets
  const [isPresetsCollapsed, setIsPresetsCollapsed] = useState(false);

  // --- CONSTANTS ---
  const isUnified = operatingSystem === 'macos' && chipType === 'appleSilicon';
  const hasGPU = isUnified || (operatingSystem !== 'macos' || chipType !== 'intel');

  const maxSystemRAM = useMemo(() => isUnified ? 192 : 512, [isUnified]);
  const maxVRAM = useMemo(() => isUnified ? systemRAMAmount : 192, [isUnified, systemRAMAmount]);

  // --- MEMORY CALCULATIONS ---
  const getMemoryOverhead = useCallback((tVRAM, sRAM) => {
    const baseOverhead = 0.5;
    return baseOverhead + ((tVRAM * numGPUs + sRAM) / 200);
  }, [numGPUs]);

  const getOffloadSpeedFactor = useCallback(() => {
    const baseRamFactor = (ramSpeed / 3200);
    const clAdjustment = Math.min(1.2, 16 / ramClRating);
    const ramFactor = showDetailedSpecs ? (baseRamFactor * clAdjustment) : 1.0;
    const storageSpeedMap = { HDD: 0.1, SATA: 0.5, NVMeGen3: 0.8, NVMeGen4: 1.0, NVMeGen5: 1.3 };
    const storageFactor = showDetailedSpecs ? (storageSpeedMap[storageType] || 1.0) : 1.0;
    return (ramFactor * storageFactor);
  }, [showDetailedSpecs, ramSpeed, ramClRating, storageType]);

  const getPerformanceMultiplier = useCallback(() => {
    let multiplier = 1.0;
    if (isUnified) multiplier = 1.3;
    else if (operatingSystem === 'macos' && chipType === 'intel') multiplier = 0.7;

    const softMult = { 'llama.cpp': 1.0, ollama: 0.95, lmstudio: 0.92, vllm: 1.15 };
    multiplier *= (softMult[inferenceSoftware] || 1.0);

    if (showDetailedSpecs && !isUnified) {
      if (gpuVendor === 'amd') multiplier *= 0.9;
      if (gpuVendor === 'intelArc') multiplier *= 0.75;
    }
    return multiplier;
  }, [isUnified, operatingSystem, chipType, inferenceSoftware, showDetailedSpecs, gpuVendor]);

  // --- MODEL UPDATES ---
  const getLayerSizeGB = (model) => {
    const bytesPerParam = precisionBits[model.precision] / 8;
    const totalWeights = (model.modelSize * 1e9 * bytesPerParam) / (1024 ** 3);
    return totalWeights / model.numLayers;
  };

  const getKVCachePerLayerGB = (model) => {
    const kvBytes = precisionBits[model.kvCachePrecision] / 8;
    return (2 * model.contextLength * model.hiddenSize * model.batchSize * kvBytes) / (1024 ** 3);
  };

  const getActivationPerLayerGB = (model) => {
    return (model.batchSize * model.hiddenSize * 4 * 4) / (1024 ** 3);
  };

  const optimizeLayerSplit = (model) => {
    const layerSize = getLayerSizeGB(model);
    const kvSize = getKVCachePerLayerGB(model);
    const actSize = getActivationPerLayerGB(model);
    const vramPerLayer = layerSize + kvSize + actSize;

    // VRAM available (approximate global for this model)
    const overhead = getMemoryOverhead(totalVRAM, systemRAMAmount);
    const availableVRAM = Math.max(0, (totalVRAM * numGPUs) - overhead);

    let newGpuLayers = model.gpuLayers;
    let newCpuLayers = model.cpuLayers;

    if (model.mode === 'gpuOnly') {
      newGpuLayers = model.numLayers;
      newCpuLayers = 0;
    } else if (model.mode === 'cpuOnly') {
      newGpuLayers = 0;
      newCpuLayers = model.numLayers;
    } else if (model.mode === 'hybrid') {
      if (enforceConstraints) {
        const layersFitting = Math.floor(availableVRAM / vramPerLayer);
        newGpuLayers = Math.min(model.numLayers, layersFitting);
        newCpuLayers = model.numLayers - newGpuLayers;
      } else if (!model.gpuLayers && !model.cpuLayers) {
        // Default balanced split if undefined
        newGpuLayers = Math.floor(model.numLayers / 2);
        newCpuLayers = model.numLayers - newGpuLayers;
      }
    }

    return { ...model, gpuLayers: newGpuLayers, cpuLayers: newCpuLayers };
  };

  const updateModel = (id, field, value) => {
    setModels(prevModels => {
      return prevModels.map(model => {
        if (model.id !== id) return model;
        let updatedModel = { ...model, [field]: value };
        // Re-run optimization if needed
        if (enforceConstraints || field === 'mode' || field === 'precision' || field === 'contextLength') {
          updatedModel = optimizeLayerSplit(updatedModel);
        }
        return updatedModel;
      });
    });
  };

  // Sync models when global constraints toggle changes
  useEffect(() => {
    if (enforceConstraints) {
      setModels(prev => prev.map(m => optimizeLayerSplit(m)));
    }
  }, [enforceConstraints, totalVRAM, numGPUs]);

  const addModel = () => {
    const newId = Math.max(...models.map(m => m.id), 0) + 1;
    let newM = createNewModel(newId);
    if (enforceConstraints) newM = optimizeLayerSplit(newM);
    setModels([...models, newM]);
  };

  const removeModel = (id) => {
    if (models.length > 1) setModels(models.filter(m => m.id !== id));
  };

  const calculations = useMemo(() => {
    let totalVramUsage = 0;
    let totalRamUsage = 0;
    let totalGpuWeights = 0;
    let totalCpuWeights = 0;
    let totalKv = 0;
    let totalAct = 0;
    let maxTokens = 0; // Simplified for single model focus

    models.forEach(model => {
      const layerSize = getLayerSizeGB(model);
      const kvSize = getKVCachePerLayerGB(model);
      const actSize = getActivationPerLayerGB(model);

      const gpuW = layerSize * model.gpuLayers;
      const cpuW = layerSize * model.cpuLayers;
      const kv = kvSize * model.gpuLayers;
      const act = actSize * model.gpuLayers;

      totalGpuWeights += gpuW;
      totalCpuWeights += cpuW;
      totalKv += kv;
      totalAct += act;

      totalVramUsage += (gpuW + kv + act);
      totalRamUsage += cpuW;

      // Token calc for first model for display
      if (model.id === 1) {
        const vramPerLayer = layerSize + kvSize + actSize;
        const availableForKV = Math.max(0, (totalVRAM * numGPUs) - (totalVramUsage - kv)); // Rough est
        // This is a complex calc for multi-model, simplifying for display
        maxTokens = 100000; // Placeholder logic would go here
      }
    });

    const globalOverhead = getMemoryOverhead(totalVRAM, systemRAMAmount);
    const vramPerGpu = numGPUs > 0 ? totalVramUsage / numGPUs : 0;
    const finalVramPerGpu = vramPerGpu + (globalOverhead * 0.2);
    const finalRamTotal = totalRamUsage + (globalOverhead * 0.8);

    return {
      totalVramUsage: finalVramPerGpu * numGPUs,
      vramPerGpu: finalVramPerGpu,
      totalRamUsage: finalRamTotal,
      gpuWeights: totalGpuWeights,
      cpuWeights: totalCpuWeights,
      kvCache: totalKv,
      activations: totalAct,
      overhead: globalOverhead,
      performanceMultiplier: getPerformanceMultiplier(),
      offloadSpeed: getOffloadSpeedFactor(),
      maxContextTokens: maxTokens
    };
  }, [models, numGPUs, totalVRAM, systemRAMAmount, getMemoryOverhead, getPerformanceMultiplier, getOffloadSpeedFactor]);


  // --- COMPONENT RENDERERS ---

  const LabeledInput = ({ label, value, setter, type = 'range', min = 0, max = 100, step = 1, unit = '', color = 'slate', disabled = false, warning = null }) => {
    const [localValue, setLocalValue] = useState(String(value));
    useEffect(() => { setLocalValue(String(value)); }, [value]);
    const handleChange = (e) => setLocalValue(e.target.value);
    const commit = () => setter(Math.min(Math.max(parseNumber(localValue), min), max));

    return (
      <div className={`mb-4 p-3 rounded-lg shadow-inner transition-colors duration-200 ${disabled ? 'bg-slate-800 opacity-50' : 'bg-slate-700'}`}>
        <label className="block text-sm font-medium text-slate-200 mb-1">{label}</label>
        {warning && <p className="text-xs text-red-400 mb-1">{warning}</p>}
        <div className="flex items-center gap-3">
          {type === 'range' && (
            <input type="range" min={min} max={max} step={step} value={localValue} onChange={handleChange} onMouseUp={commit} onTouchEnd={commit} disabled={disabled} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-600" />
          )}
          <input type="number" min={min} max={max} step={step} value={localValue} onChange={handleChange} onBlur={commit} disabled={disabled} className="w-20 rounded px-2 py-1 text-center text-white bg-slate-600" />
          {unit && <span className="text-white font-bold min-w-[40px] text-right">{unit}</span>}
        </div>
      </div>
    );
  };

  const MemoryBar = ({ label, value, color, maxValue, showPercent = false }) => {
    const safeMax = Math.max(0.0001, maxValue);
    const percentage = (value / safeMax) * 100;
    const barColor = percentage > 100 ? colorMap.red : (colorMap[color] || colorMap.slate);
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1 text-white">
          <span className="font-medium">{label}</span>
          <span>{value.toFixed(2)} GB {showPercent && `(${Math.min(percentage, 100).toFixed(1)}%)`}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all duration-300`} style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }} />
        </div>
        {percentage > 100 && (
          <p className="text-xs font-bold text-red-400 mt-1">
            OVERCAPACITY: {(value - maxValue).toFixed(2)} GB short.
          </p>
        )}
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

  const OptimizationPresets = () => {
    const CollapseIcon = isPresetsCollapsed ? PlusSquare : MinusSquare;

    const applyGlobalPreset = (presetName) => {
      setModels(prev => prev.map(m => {
        let newM = { ...m };
        if (presetName === 'speed') {
          newM.mode = 'gpuOnly';
          newM.precision = 'int4';
          newM.batchSize = 4;
          newM.contextLength = 2048;
        } else if (presetName === 'balance') {
          newM.mode = 'hybrid';
          newM.precision = 'int8';
          newM.batchSize = 1;
          newM.contextLength = 4096;
        } else if (presetName === 'context') {
          newM.mode = 'hybrid';
          newM.precision = 'int4';
          newM.batchSize = 1;
          newM.contextLength = 16384;
        }
        if (enforceConstraints) {
          newM = optimizeLayerSplit(newM);
        }
        return newM;
      }));
    };

    return (
      <div className="mb-6 p-4 bg-slate-700 rounded-xl shadow-2xl border border-slate-600">
        <button
          onClick={() => setIsPresetsCollapsed(!isPresetsCollapsed)}
          className="w-full flex justify-between items-center text-left py-2 px-1 text-lg font-bold text-white hover:text-teal-400 transition-colors"
        >
          <div className='flex items-center gap-2'>
            <Settings className="w-6 h-6 text-teal-400" />
            <span>Global Optimization Presets</span>
          </div>
          <CollapseIcon className="w-5 h-5 text-teal-400" />
        </button>

        {!isPresetsCollapsed && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <button onClick={() => applyGlobalPreset('speed')} className="p-4 rounded-lg bg-slate-800 hover:bg-slate-600 border border-slate-700 text-center transition-all">
              <FastForward className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
              <p className="font-bold text-white">Max Speed</p>
              <p className="text-xs text-slate-400">GPU Only, INT4</p>
            </button>
            <button onClick={() => applyGlobalPreset('balance')} className="p-4 rounded-lg bg-slate-800 hover:bg-slate-600 border border-slate-700 text-center transition-all">
              <Gauge className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <p className="font-bold text-white">Balanced</p>
              <p className="text-xs text-slate-400">Hybrid, INT8</p>
            </button>
            <button onClick={() => applyGlobalPreset('context')} className="p-4 rounded-lg bg-slate-800 hover:bg-slate-600 border border-slate-700 text-center transition-all">
              <Maximize className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className="font-bold text-white">Max Context</p>
              <p className="text-xs text-slate-400">Hybrid, 16k Context</p>
            </button>
          </div>
        )}
      </div>
    );
  };

  // --- SETUP SCREEN ---
  const SetupScreen = () => {
    if (setupStep === 0) {
      return (
        <div className="max-w-2xl mx-auto mb-6 bg-blue-900 border-2 border-blue-500 rounded-lg p-8 shadow-2xl text-white">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2"><Cpu className="w-8 h-8" /> 1. Platform</h2>
          <div className="space-y-4">
            <SelectInput label="Operating System" value={operatingSystem} setter={setOperatingSystem} options={[{ value: 'macos', label: 'macOS' }, { value: 'linux', label: 'Linux' }, { value: 'windows', label: 'Windows' }]} color="indigo" />
            {operatingSystem === 'macos' ? (
              <SelectInput label="Chip Type" value={chipType} setter={setChipType} options={[{ value: 'appleSilicon', label: 'Apple Silicon' }, { value: 'intel', label: 'Intel Mac' }]} color="indigo" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <SelectInput label="CPU Arch" value={cpuArchitecture} setter={setCpuArchitecture} options={[{ value: 'x86', label: 'x86_64' }, { value: 'arm', label: 'ARM64' }]} color="cyan" />
                <SelectInput label="GPU" value={hasGPU ? 'yes' : 'no'} setter={v => setHasGPU(v === 'yes')} options={[{ value: 'yes', label: 'Dedicated GPU' }, { value: 'no', label: 'CPU Only' }]} color="blue" />
              </div>
            )}
            <button onClick={() => setSetupStep(operatingSystem === 'macos' ? 1 : 2)} className="w-full py-3 bg-teal-600 rounded-lg font-bold mt-4">Next</button>
          </div>
        </div>
      );
    }
    if (setupStep === 1) { // macOS Specific Step
      return (
        <div className="max-w-2xl mx-auto mb-6 bg-blue-900 border-2 border-yellow-500 rounded-lg p-8 shadow-2xl text-white">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2"><Apple className="w-8 h-8" /> 2. Mac Architecture</h2>
          <p className="mb-6 text-slate-300">Apple Silicon uses Unified Memory.</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { setChipType('appleSilicon'); setHasGPU(true); setSetupStep(2); }} className="bg-green-600 py-6 rounded-lg font-bold">Apple Silicon (M1/M2/M3)</button>
            <button onClick={() => { setChipType('intel'); setHasGPU(false); setSetupStep(2); }} className="bg-slate-600 py-6 rounded-lg font-bold">Intel Mac</button>
          </div>
          <button onClick={() => setSetupStep(0)} className="mt-6 text-slate-400 hover:text-white">Back</button>
        </div>
      );
    }
    if (setupStep === 2) { // Memory Step
      return (
        <div className="max-w-2xl mx-auto mb-6 bg-blue-900 border-2 border-blue-500 rounded-lg p-8 shadow-2xl text-white">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2"><HardDrive className="w-8 h-8" /> 2. Memory Specs</h2>
          <LabeledInput label="System RAM" value={systemRAMAmount} setter={setSystemRAMAmount} min={8} max={512} step={4} unit="GB" color="emerald" />
          {!isUnified && hasGPU && (
            <>
              <LabeledInput label="Number of GPUs" value={numGPUs} setter={setNumGPUs} min={1} max={8} step={1} unit="Cards" color="purple" />
              <LabeledInput label="VRAM per GPU" value={totalVRAM} setter={setTotalVRAM} min={0} max={192} step={2} unit="GB" color="blue" />
            </>
          )}
          <div className="flex gap-4 mt-6">
            <button onClick={() => setSetupStep(0)} className="w-1/3 bg-slate-700 py-3 rounded-lg">Back</button>
            <button onClick={() => setSetupStep(3)} className="w-2/3 bg-teal-600 py-3 rounded-lg font-bold">Launch</button>
          </div>
        </div>
      );
    }
    return null;
  };

  // --- MAIN RENDER ---
  if (setupStep < 3) {
    return <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">{SetupScreen()}</div>;
  }

  const vramPercent = (calculations.totalVramUsage / (totalVRAM * numGPUs)) * 100;
  const ramPercent = (calculations.totalRamUsage / systemRAMAmount) * 100;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-700">
          <div>
            <h1 className="text-3xl font-extrabold text-teal-400 flex items-center gap-2">
              <Maximize className="w-8 h-8" /> LLM Memory Visualizer
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {isUnified ? 'Unified Memory' : `Discrete GPU (${numGPUs}x)`} | {operatingSystem} | {ramSpeed} MHz
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setEnforceConstraints(!enforceConstraints)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border ${enforceConstraints ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
              {enforceConstraints ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />} Constraints: {enforceConstraints ? 'ON' : 'OFF'}
            </button>
            <button onClick={() => setSetupStep(0)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-600">
              <Settings className="w-4 h-4" /> Config
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-6">
            {/* RESULT PANEL */}
            <div className="p-6 bg-slate-800 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-5 flex items-center gap-3"><BarChart2 className="w-7 h-7 text-teal-400" /> Results</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-700 rounded-xl shadow-lg border border-slate-600">
                  <div className="text-sm text-slate-300">Perf. Multiplier</div>
                  <div className="text-2xl font-bold">{calculations.performanceMultiplier.toFixed(2)}x</div>
                </div>
                <div className="p-4 bg-slate-700 rounded-xl shadow-lg border border-slate-600">
                  <div className="text-sm text-slate-300">Offload Speed</div>
                  <div className="text-2xl font-bold text-yellow-400">{calculations.offloadSpeed.toFixed(2)}x</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-blue-400 mb-3">VRAM ({isUnified ? 'Unified' : 'Discrete'})</h3>
              <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden flex mb-1">
                <div className="bg-blue-500 h-full" style={{ width: `${(calculations.gpuWeights / (totalVRAM * numGPUs)) * 100}%` }} />
                <div className="bg-purple-500 h-full" style={{ width: `${(calculations.kvCache / (totalVRAM * numGPUs)) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-300 mb-4">
                <span>Used: {calculations.totalVramUsage.toFixed(1)} GB</span>
                <span className={vramPercent > 100 ? 'text-red-400' : 'text-white'}>{vramPercent.toFixed(0)}%</span>
              </div>

              <h3 className="text-lg font-bold text-emerald-400 mb-3">System RAM</h3>
              <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden flex mb-1">
                <div className="bg-emerald-500 h-full" style={{ width: `${(calculations.cpuWeights / systemRAMAmount) * 100}%` }} />
                <div className="bg-slate-500 h-full" style={{ width: `${(calculations.overhead / systemRAMAmount) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Used: {calculations.totalRamUsage.toFixed(1)} GB</span>
                <span className={ramPercent > 100 ? 'text-red-400' : 'text-white'}>{ramPercent.toFixed(0)}%</span>
              </div>
            </div>

            {/* ADVANCED SPECS TOGGLE */}
            <div className="p-4 bg-slate-700 rounded-xl shadow-2xl">
              <button onClick={() => setShowDetailedSpecs(!showDetailedSpecs)} className='w-full text-left font-bold text-lg flex justify-between items-center'>
                Advanced Specs {showDetailedSpecs ? <MinusSquare className='w-5 h-5' /> : <PlusSquare className='w-5 h-5' />}
              </button>
              {showDetailedSpecs && (
                <div className='mt-4 grid gap-4 pt-4 border-t border-slate-600'>
                  <SelectInput label="GPU Vendor" value={gpuVendor} setter={setGpuVendor} options={[{ value: 'nvidia', label: 'NVIDIA' }, { value: 'amd', label: 'AMD' }]} />
                  <SelectInput label="RAM Type" value={ramType} setter={setRamType} options={[{ value: 'DDR5', label: 'DDR5' }, { value: 'DDR4', label: 'DDR4' }]} />
                  <LabeledInput label="RAM Speed (MHz)" value={ramSpeed} setter={setRamSpeed} min={2133} max={8400} step={100} />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: MODELS */}
          <div className="xl:col-span-2 space-y-6">
            <OptimizationPresets />
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Layers className="w-6 h-6 text-blue-400" /> Models</h2>
              <button onClick={addModel} className="px-4 py-2 bg-blue-600 rounded-lg font-bold flex gap-2 hover:bg-blue-500"><Plus className="w-4 h-4" /> Add</button>
            </div>
            {models.map((model) => (
              <div key={model.id} className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
                <div className="flex justify-between mb-4 border-b border-slate-700 pb-2">
                  <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2"><Server className="w-5 h-5" /> {model.name}</h3>
                  <div className="flex bg-slate-900 rounded p-1">
                    {['gpuOnly', 'hybrid', 'cpuOnly'].map(m => (
                      <button key={m} onClick={() => updateModel(model.id, 'mode', m)} className={`px-3 py-1 text-xs font-bold rounded ${model.mode === m ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{m.toUpperCase().replace('ONLY', '')}</button>
                    ))}
                  </div>
                  {models.length > 1 && <button onClick={() => removeModel(model.id)} className="text-red-400"><Trash2 className="w-5 h-5" /></button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <LabeledInput label="Params (B)" value={model.modelSize} setter={v => updateModel(model.id, 'modelSize', v)} min={0.5} max={180} step={0.5} unit="B" color="blue" />
                    <SelectInput label="Precision" value={model.precision} setter={v => updateModel(model.id, 'precision', v)} options={Object.keys(precisionBits).map(k => ({ value: k, label: k }))} />
                  </div>
                  <div>
                    <LabeledInput label="Context" value={model.contextLength} setter={v => updateModel(model.id, 'contextLength', v)} min={512} max={32000} step={512} color="purple" />
                    <SelectInput label="KV Precision" value={model.kvCachePrecision} setter={v => updateModel(model.id, 'kvCachePrecision', v)} options={Object.keys(precisionBits).map(k => ({ value: k, label: k }))} />
                  </div>
                  <div>
                    {!isUnified && (
                      <>
                        <LabeledInput label="GPU Layers" value={model.gpuLayers} setter={v => updateModel(model.id, 'gpuLayers', v)} min={0} max={model.numLayers} disabled={model.mode !== 'hybrid'} color="indigo" />
                        <div className="text-center text-xs text-slate-400">CPU Layers: {Math.max(0, model.numLayers - model.gpuLayers)}</div>
                      </>
                    )}
                    {isUnified && <div className="text-sm text-slate-400 italic mt-4 text-center">Unified Memory Managed</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VRAMVisualizer;