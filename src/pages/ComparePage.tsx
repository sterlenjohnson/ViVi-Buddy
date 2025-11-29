import React, { useState, useEffect } from 'react';
import { Plus, X, Download } from 'lucide-react';
import { getAllHardware, HardwareItem } from '../database/db_interface';
import { useHardware } from '../contexts/HardwareContext';

interface Metric {
    label: string;
    key: keyof HardwareItem;
    unit: string;
    prefix?: boolean;
}

interface PopularModel {
    name: string;
    params: number;
    q4_size: number;
    q8_size: number;
}

const ComparePage: React.FC = () => {
    const { customHardware, selectedHardwareId, setSelectedHardwareId } = useHardware();
    const [hardwareList, setHardwareList] = useState<HardwareItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>(['rtx_4090', 'rtx_3090']); // Default comparison

    // Sync with Context Selection
    useEffect(() => {
        if (selectedHardwareId && hardwareList.some(h => h.id === selectedHardwareId)) {
            setSelectedIds(prev => {
                const newIds = [...prev];
                newIds[0] = selectedHardwareId;
                return newIds;
            });
        }
    }, [selectedHardwareId, hardwareList]);

    useEffect(() => {
        const load = () => {
            const db = getAllHardware();
            const uniqueDb = db.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            setHardwareList([...uniqueDb, ...customHardware]);
        };
        load();
    }, [customHardware]);

    const handleSelect = (index: number, id: string) => {
        const newIds = [...selectedIds];
        newIds[index] = id;
        setSelectedIds(newIds);
    };

    const handleBenchmarkRedirect = (id: string) => {
        setSelectedHardwareId(id);
        window.location.href = '/benchmarks'; // Simple redirect for now, or use useNavigate if available
    };

    const addSlot = () => {
        if (selectedIds.length < 4) {
            setSelectedIds([...selectedIds, '']);
        }
    };

    const removeSlot = (index: number) => {
        if (selectedIds.length > 2) {
            const newIds = selectedIds.filter((_, i) => i !== index);
            setSelectedIds(newIds);
        }
    };

    const getHardware = (id: string): HardwareItem | undefined => hardwareList.find(h => h.id === id);

    const exportComparison = () => {
        const data = selectedIds.map(id => getHardware(id)).filter(Boolean);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vivi_hardware_comparison.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const METRICS: Metric[] = [
        { label: 'VRAM', key: 'vram_gb', unit: 'GB' },
        { label: 'Bandwidth', key: 'bandwidth_gbps', unit: 'GB/s' },
        { label: 'Price', key: 'price_usd', unit: '$', prefix: true },
        { label: 'TDP', key: 'tdp_watts', unit: 'W' },
        { label: 'Architecture', key: 'architecture', unit: '' },
    ];

    // Popular model sizes (Q4 quantization ~0.5-0.6 GB per billion parameters)
    const POPULAR_MODELS: PopularModel[] = [
        { name: 'Llama 3.3 70B', params: 70, q4_size: 42, q8_size: 75 },
        { name: 'Qwen 2.5 72B', params: 72, q4_size: 43, q8_size: 76 },
        { name: 'DeepSeek V3', params: 671, q4_size: 400, q8_size: 700 },
        { name: 'Llama 3.1 405B', params: 405, q4_size: 240, q8_size: 420 },
        { name: 'Qwen 2.5 32B', params: 32, q4_size: 20, q8_size: 34 },
        { name: 'Mistral Small', params: 24, q4_size: 15, q8_size: 25 },
        { name: 'Llama 3.2 11B', params: 11, q4_size: 7, q8_size: 12 },
        { name: 'Llama 3.2 3B', params: 3, q4_size: 2, q8_size: 3 },
        { name: 'Phi-4 14B', params: 14, q4_size: 9, q8_size: 15 },
        { name: 'Gemma 2 27B', params: 27, q4_size: 17, q8_size: 29 },
    ];

    const [selectedModel, setSelectedModel] = useState<PopularModel>(POPULAR_MODELS[0]); // Default to Llama 3.3 70B
    const [useQ8, setUseQ8] = useState<boolean>(false); // Q4 by default

    const getModelSize = () => useQ8 ? selectedModel.q8_size : selectedModel.q4_size;

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                    Hardware Comparison
                </h1>
                <p className="text-slate-400">Side-by-side analysis of GPUs, CPUs, and SoCs.</p>
            </header>

            {/* Model Selector */}
            <div className="mb-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1">
                        <label className="block text-sm text-slate-400 mb-2">Test Model:</label>
                        <select
                            value={selectedModel.name}
                            onChange={(e) => {
                                const model = POPULAR_MODELS.find(m => m.name === e.target.value);
                                if (model) setSelectedModel(model);
                            }}
                            className="w-full bg-slate-900 text-white border border-slate-600 rounded p-2 text-sm focus:border-blue-500 outline-none"
                        >
                            {POPULAR_MODELS.map(model => (
                                <option key={model.name} value={model.name}>
                                    {model.name} ({model.params}B params)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Quantization:</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setUseQ8(false)}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${!useQ8 ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                            >
                                Q4 ({selectedModel.q4_size}GB)
                            </button>
                            <button
                                onClick={() => setUseQ8(true)}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${useQ8 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                            >
                                Q8 ({selectedModel.q8_size}GB)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hardware Presets */}
            <div className="mb-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Presets:</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedIds(['rtx_5090', 'rtx_4090', 'rtx_3090'])}
                        className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded text-sm font-medium transition-all"
                    >
                        RTX Flagships
                    </button>
                    <button
                        onClick={() => setSelectedIds(['rtx_4090', 'rx_7900xtx', 'm4_max_128'])}
                        className="px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded text-sm font-medium transition-all"
                    >
                        Best 24GB+ Options
                    </button>
                    <button
                        onClick={() => setSelectedIds(['m5_max_128', 'm4_max_128', 'm2_ultra_192'])}
                        className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded text-sm font-medium transition-all"
                    >
                        Apple Silicon
                    </button>
                    <button
                        onClick={() => setSelectedIds(['rtx_4060_ti_16gb', 'rx_7800xt', 'rtx_3060_12gb'])}
                        className="px-3 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded text-sm font-medium transition-all"
                    >
                        Budget Builds
                    </button>
                    <button
                        onClick={() => setSelectedIds(['ryzen_9_7950x', 'i9_14900k'])}
                        className="px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white rounded text-sm font-medium transition-all"
                    >
                        CPU Comparison
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {selectedIds.map((selectedId, index) => {
                    const hw = getHardware(selectedId);
                    return (
                        <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col relative">
                            {selectedIds.length > 2 && (
                                <button
                                    onClick={() => removeSlot(index)}
                                    className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}

                            <select
                                value={selectedId || ''}
                                onChange={(e) => handleSelect(index, e.target.value)}
                                className="w-full bg-slate-700 text-white border border-slate-600 rounded p-2 text-sm focus:border-blue-500 outline-none mb-4"
                            >
                                <option value="">Select Hardware...</option>
                                {hardwareList.map(h => (
                                    <option key={h.id} value={h.id}>
                                        {h.name} {h.type !== 'cpu' && `(${h.vram_gb}GB)`}
                                    </option>
                                ))}
                            </select>

                            {hw ? (
                                <div className="space-y-3">
                                    {METRICS.map(metric => (
                                        <div key={metric.label} className="flex justify-between items-baseline border-b border-slate-700/50 pb-2">
                                            <span className="text-slate-400 text-sm">{metric.label}</span>
                                            <span className="text-white font-semibold">
                                                {metric.prefix && hw[metric.key] ? metric.unit : ''}
                                                {hw[metric.key] || 'N/A'}
                                                {!metric.prefix && hw[metric.key] ? ` ${metric.unit}` : ''}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t border-slate-600 pt-3 mt-3">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-blue-400 font-bold text-sm">
                                                {selectedModel.name} {useQ8 ? 'Q8' : 'Q4'}
                                            </span>
                                            <span className="text-blue-300 font-bold">
                                                {(hw.vram_gb || 0) >= getModelSize()
                                                    ? `${Math.round(hw.bandwidth_gbps / getModelSize())} T/s`
                                                    : <span className="text-red-400 text-xs">OOM</span>
                                                }
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleBenchmarkRedirect(hw.id)}
                                            className="w-full mt-2 py-1 bg-slate-700 hover:bg-blue-600 text-xs text-white rounded transition-colors flex items-center justify-center gap-1"
                                        >
                                            <span>⚡</span> Benchmark This
                                        </button>
                                        {(hw.vram_gb || 0) < getModelSize() && (
                                            <div className="bg-slate-900/70 rounded p-2 mt-2">
                                                <p className="text-green-400 text-xs font-semibold mb-1">✓ Suggested Models:</p>
                                                <p className="text-slate-300 text-xs leading-relaxed">
                                                    {POPULAR_MODELS
                                                        .filter(m => (useQ8 ? m.q8_size : m.q4_size) <= (hw.vram_gb || 0))
                                                        .slice(0, 3)
                                                        .map(m => `• ${m.name} (${useQ8 ? m.q8_size : m.q4_size}GB)`)
                                                        .join('\n') || '• Consider smaller quantization or model'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-600">
                                    <p>Select hardware to see details</p>
                                </div>
                            )}
                        </div>
                    );
                })}

                {selectedIds.length < 4 && (
                    <div className="bg-transparent border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center min-h-[300px]">
                        <button
                            onClick={addSlot}
                            className="text-slate-500 hover:text-white hover:border-blue-500 transition-all duration-300 w-24 h-24 flex items-center justify-center rounded-full border-2 border-dashed border-slate-600"
                        >
                            <Plus size={32} />
                        </button>
                    </div>
                )}
            </div>

            {/* Popular Model Sizes Reference */}
            <div className="mt-12 bg-slate-800/30 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-400">📊</span>
                    Popular Model Sizes (VRAM Required)
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                    Use this guide to determine which models will fit on your hardware.
                    Q4 = 4-bit quantization (recommended), Q8 = 8-bit quantization (higher quality).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {POPULAR_MODELS.map((model, idx) => (
                        <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-blue-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white">{model.name}</h3>
                                <span className="text-xs text-slate-500">{model.params}B</span>
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Q4 (default):</span>
                                    <span className="text-green-400 font-mono">{model.q4_size}GB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Q8 (quality):</span>
                                    <span className="text-blue-400 font-mono">{model.q8_size}GB</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <p className="text-blue-200 text-sm">
                        <strong>💡 Tip:</strong> Add ~5-10GB for KV cache (context memory).
                        For example, a 70B Q4 model needs ~42GB base + ~8GB cache = <strong>~50GB total</strong> for comfortable usage with 8K context.
                    </p>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={exportComparison}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed"
                    disabled={selectedIds.every(id => !id)}
                >
                    <Download size={18} />
                    Export Comparison
                </button>
            </div>
        </div>
    );
};

export default ComparePage;
