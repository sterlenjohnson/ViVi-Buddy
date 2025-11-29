import React from 'react';
import { Monitor, Cloud } from 'lucide-react';

const BasicModeToggle = ({ isUnified, onToggle, systemRAMAmount, setSystemRAMAmount, gpuBackend, setGpuBackend }) => {
    return (
        <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                <Monitor className="w-7 h-7 text-emerald-400" /> Hardware
            </h2>

            <div className="mb-6 p-4 rounded-lg bg-slate-700/50 border border-slate-600/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">Memory Architecture</span>
                    <button
                        onClick={onToggle}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isUnified
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                            }`}
                    >
                        {isUnified ? 'Unified Memory' : 'Discrete GPU'}
                    </button>
                </div>
                <p className="text-xs text-slate-400">
                    {isUnified
                        ? 'macOS with Apple Silicon (M1/M2/M3) - Shared RAM/VRAM'
                        : 'Traditional setup with separate GPU VRAM'}
                </p>
            </div>

            <div className="mb-4 p-3 rounded-lg shadow-inner bg-slate-700">
                <label className="block text-sm font-medium text-slate-200 mb-1">
                    {isUnified ? 'Unified Memory' : 'System RAM'}
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min={8}
                        max={512}
                        step={4}
                        value={systemRAMAmount}
                        onChange={(e) => setSystemRAMAmount(Number(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-600"
                    />
                    <input
                        type="number"
                        min={8}
                        max={512}
                        step={4}
                        value={systemRAMAmount}
                        onChange={(e) => setSystemRAMAmount(Number(e.target.value))}
                        className="w-20 rounded px-2 py-1 text-center text-white bg-slate-600"
                    />
                    <span className="text-white font-bold min-w-[40px] text-right">GB</span>
                </div>
            </div>

            {/* Backend selector – only shown when discrete GPU mode */}
            {!isUnified && (
                <div className="mb-4 p-3 rounded-lg shadow-inner bg-slate-700">
                    <label className="block text-sm font-medium text-slate-200 mb-1">GPU Backend</label>
                    <select
                        value={gpuBackend}
                        onChange={(e) => setGpuBackend(e.target.value)}
                        className="w-full bg-slate-600 text-white rounded px-2 py-1"
                    >
                        <option value="auto">Auto‑Detect</option>
                        <option value="cuda" disabled={isUnified}>CUDA (NVIDIA)</option>
                        <option value="metal" disabled={!isUnified}>Metal (Apple)</option>
                        <option value="vulkan">Vulkan (Cross‑Platform)</option>
                        <option value="rocm" disabled={isUnified}>ROCm (AMD)</option>
                        <option value="sycl">SYCL/oneAPI (Intel)</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default BasicModeToggle;
