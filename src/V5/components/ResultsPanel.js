import React from 'react';
import { BarChart2 } from 'lucide-react';
import { colorMap } from '../utils/constants';

const StackedMemoryBar = ({ label, segments, maxValue, showPercent = false }) => {
    const totalValue = segments.reduce((acc, s) => acc + s.value, 0);
    const safeMax = Math.max(0.0001, maxValue);
    const totalPercent = (totalValue / safeMax) * 100;

    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1 text-white">
                <span className="font-medium">{label}</span>
                <span>{totalValue.toFixed(2)} / {maxValue} GB {showPercent && `(${Math.min(totalPercent, 100).toFixed(1)}%)`}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 flex overflow-hidden relative">
                {segments.map((seg, idx) => {
                    const width = (seg.value / safeMax) * 100;
                    if (width <= 0) return null;
                    return (
                        <div
                            key={idx}
                            className="h-full transition-all duration-300 relative group"
                            style={{ width: `${width}%`, backgroundColor: colorMap[seg.color] || colorMap.slate }}
                        >
                            {/* Tooltip on hover */}
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                                {seg.label}: {seg.value.toFixed(2)} GB
                            </div>
                        </div>
                    );
                })}
            </div>
            {totalPercent > 100 && (
                <p className="text-xs font-bold text-red-400 mt-1">
                    OVERCAPACITY: {(totalValue - maxValue).toFixed(2)} GB short.
                </p>
            )}
            <div className="flex gap-3 mt-1 text-xs text-slate-400">
                {segments.map((seg, idx) => seg.value > 0 && (
                    <div key={idx} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMap[seg.color] }} />
                        <span>{seg.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ResultsPanel = ({ calculations, gpuList, systemRAMAmount, isUnified, cpuCores, cpuThreads }) => {
    const { gpuUsageDetails, cpuWeights, overhead } = calculations;

    return (
        <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                <BarChart2 className="w-7 h-7 text-teal-400" /> Results
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-700/50 rounded-xl shadow-lg border border-slate-600/50 backdrop-blur-sm">
                    <div className="text-sm text-slate-300 font-medium">Base Performance</div>
                    <div className="text-2xl font-bold text-white">{calculations.performanceMultiplier.toFixed(2)}x</div>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-xl shadow-lg border border-slate-600/50 backdrop-blur-sm">
                    <div className="text-sm text-slate-300 font-medium">Final Performance</div>
                    <div className={`text-2xl font-bold ${calculations.finalPerformance < 0.5 ? 'text-red-400' : calculations.finalPerformance < 0.8 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {calculations.finalPerformance.toFixed(2)}x
                    </div>
                </div>
            </div>

            {/* Performance Penalties */}
            {(calculations.vramOverflowPenalty < 1.0 || calculations.ramOverflowPenalty < 1.0 || calculations.contextPenalty < 0.9) && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
                    <h3 className="text-lg font-bold text-red-400 mb-3">⚠️ Performance Penalties</h3>
                    <div className="space-y-2 text-sm">
                        {calculations.vramOverflowPenalty < 1.0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-red-300">VRAM Overflow ({calculations.totalVRAMUsed.toFixed(1)}GB / {calculations.totalVRAMAvailable}GB):</span>
                                <span className="font-bold text-red-400">{(1 / calculations.vramOverflowPenalty).toFixed(1)}x slower</span>
                            </div>
                        )}
                        {calculations.ramOverflowPenalty < 1.0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-red-300">RAM Overflow (Swapping to disk):</span>
                                <span className="font-bold text-red-400">{(1 / calculations.ramOverflowPenalty).toFixed(1)}x slower</span>
                            </div>
                        )}
                        {calculations.contextPenalty < 0.9 && (
                            <div className="flex justify-between items-center">
                                <span className="text-yellow-300">Long Context Length:</span>
                                <span className="font-bold text-yellow-400">{(1 / calculations.contextPenalty).toFixed(1)}x slower</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {calculations.totalVRAMAvailable === 0 && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/50 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-400 mb-2">💻 CPU-Only Mode</h3>
                    <p className="text-sm text-blue-300">
                        Running on {cpuCores} cores / {cpuThreads} threads. Performance will be significantly slower than GPU inference.
                    </p>
                </div>
            )}

            <h3 className="text-lg font-bold text-blue-400 mb-3">
                {isUnified ? 'Unified Memory (RAM + VRAM)' : `VRAM (${isUnified ? 'Unified' : 'Discrete'})`}
            </h3>

            {isUnified ? (
                <StackedMemoryBar
                    label="Unified Memory"
                    maxValue={systemRAMAmount}
                    showPercent={true}
                    segments={[
                        { label: 'Weights (GPU)', value: gpuUsageDetails.reduce((a, g) => a + g.weights, 0), color: 'blue' },
                        { label: 'KV Cache', value: gpuUsageDetails.reduce((a, g) => a + g.kv, 0), color: 'purple' },
                        { label: 'Activations', value: gpuUsageDetails.reduce((a, g) => a + g.act, 0), color: 'cyan' },
                        { label: 'Weights (CPU)', value: cpuWeights, color: 'emerald' },
                        { label: 'Overhead/System', value: overhead, color: 'orange' }
                    ]}
                />
            ) : (
                <>
                    {gpuList.length > 0 && gpuList[0].vram > 0 ? (
                        <>
                            {gpuUsageDetails && gpuUsageDetails.map((gpu) => (
                                <StackedMemoryBar
                                    key={gpu.id}
                                    label={gpu.name}
                                    maxValue={gpu.vram}
                                    showPercent={true}
                                    segments={[
                                        { label: 'Weights', value: gpu.weights, color: 'blue' },
                                        { label: 'KV Cache', value: gpu.kv, color: 'purple' },
                                        { label: 'Activations', value: gpu.act, color: 'cyan' },
                                    ]}
                                />
                            ))}
                            <h3 className="text-lg font-bold text-emerald-400 mb-3 mt-6">System RAM</h3>
                        </>
                    ) : (
                        <div className="text-sm text-slate-400 italic mb-6">CPU-only mode - No GPU configured</div>
                    )}

                    <StackedMemoryBar
                        label="System RAM"
                        maxValue={systemRAMAmount}
                        showPercent={true}
                        segments={[
                            { label: 'Weights (CPU)', value: cpuWeights, color: 'emerald' },
                            { label: 'Overhead/System', value: overhead, color: 'orange' }
                        ]}
                    />
                </>
            )}
        </div>
    );
};

export default ResultsPanel;
