{/* llama.cpp GPU Backend Selection */ }
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
