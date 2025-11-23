import React, { useState } from 'react';
import { Copy, Terminal, AlertTriangle } from 'lucide-react';

const CommandExporter = ({ model, hardware, isUnified }) => {
    const inferenceSoftware = hardware.inferenceSoftware || 'llama.cpp';

    const [modelPath, setModelPath] = useState(() => {
        if (inferenceSoftware === 'ollama') {
            return model.name.toLowerCase().replace(/\s+/g, '-');
        }
        return `models/${model.name.toLowerCase().replace(/\s+/g, '-')}.gguf`;
    });
    const [copied, setCopied] = useState(false);
    const [flashAttention, setFlashAttention] = useState(true);

    const { gpuLayers, contextLength } = model;
    const { operatingSystem, chipType, gpuList } = hardware;

    // Intel Mac warning logic
    const isIntelMac = operatingSystem === 'macos' && chipType === 'intel';
    const showLMStudioWarning = isIntelMac && inferenceSoftware === 'lmstudio';
    const showOllamaNote = isIntelMac && inferenceSoftware === 'ollama';

    // Update modelPath when software or model name changes
    React.useEffect(() => {
        if (inferenceSoftware === 'ollama') {
            setModelPath(model.name.toLowerCase().replace(/\s+/g, '-'));
        } else {
            setModelPath(`models/${model.name.toLowerCase().replace(/\s+/g, '-')}.gguf`);
        }
    }, [inferenceSoftware, model.name]);

    const generateCommand = () => {
        // LM Studio Intel Mac check
        if (showLMStudioWarning) {
            return '# LM Studio requires Apple Silicon (M1/M2/M3/M4)\n# Not supported on Intel Macs';
        }

        const layers = model.mode === 'gpuOnly' ? 999 : (model.mode === 'cpuOnly' ? 0 : gpuLayers);

        // Ollama
        if (inferenceSoftware === 'ollama') {
            let cmd = `ollama run ${modelPath}`;

            if (showOllamaNote) {
                cmd = `# Intel Mac: Limited GPU support\n# Running in CPU mode\n` + cmd;
            }

            // Multi-GPU env vars
            if (gpuList && gpuList.length > 1 && !isUnified) {
                const brands = [...new Set(gpuList.map(g => g.brand || 'nvidia'))];
                const primaryBrand = brands[0];

                if (primaryBrand === 'nvidia') {
                    const gpuIndices = gpuList.map((_, i) => i).join(',');
                    cmd = `CUDA_VISIBLE_DEVICES=${gpuIndices} ` + cmd;
                } else if (primaryBrand === 'amd') {
                    const gpuIndices = gpuList.map((_, i) => i).join(',');
                    cmd = `ROCR_VISIBLE_DEVICES=${gpuIndices} ` + cmd;
                }
            }

            return cmd;
        }

        // LM Studio
        if (inferenceSoftware === 'lmstudio') {
            let cmd = `lms load "${modelPath.replace('.gguf', '')}"`;
            cmd += ` --context-length ${contextLength}`;
            cmd += ` --gpu max`;

            let notes = [];
            if (flashAttention) {
                notes.push('Flash Attention: Enable in LM Studio GUI (Advanced \u003e Model Init)');
            }

            if (notes.length > 0) {
                cmd = `# ${notes.join('\n# ')}\n` + cmd;
            }

            return cmd;
        }

        // llama.cpp (default)
        let cmd = `llama-cli -m "${modelPath}" -c ${contextLength}`;
        cmd += ` -ngl ${layers}`;

        // Multi-GPU tensor split
        if (gpuList && gpuList.length > 1 && !isUnified && layers > 0) {
            const vramValues = gpuList.map(g => g.vram);
            const tensorSplit = vramValues.join(',');
            cmd += ` --tensor-split ${tensorSplit}`;
        }

        cmd += ' -t 8 --temp 0.8 --color';

        if (isIntelMac) {
            cmd = `# Intel Mac: Limited GPU support\n` + cmd;
        }

        return cmd;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateCommand());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-4 p-3 bg-slate-900/80 rounded-lg border border-slate-700/50 backdrop-blur-sm shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                <Terminal className="w-4 h-4 text-green-400" /> CLI Command Export
            </div>

            {/* Warnings */}
            {showLMStudioWarning && (
                <div className="mb-2 p-2 bg-red-900/30 border border-red-700/50 rounded text-xs text-red-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>LM Studio is not supported on Intel Macs. Requires Apple Silicon.</span>
                </div>
            )}

            {showOllamaNote && (
                <div className="mb-2 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Intel Mac: Ollama has limited GPU support. Performance may be slower.</span>
                </div>
            )}

            {/* LM Studio Toggles */}
            {inferenceSoftware === 'lmstudio' && !showLMStudioWarning && (
                <div className="mb-2 flex items-center gap-3 p-2 bg-slate-800/50 rounded text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={flashAttention}
                            onChange={(e) => setFlashAttention(e.target.checked)}
                            className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-300">Flash Attention</span>
                    </label>
                </div>
            )}

            {/* Model Path Input */}
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={modelPath}
                    onChange={(e) => setModelPath(e.target.value)}
                    placeholder="Path to model file..."
                    className="flex-1 bg-slate-800/50 border border-slate-600/50 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-slate-600"
                />
            </div>

            {/* Command Output */}
            <div className="relative group">
                <div className="bg-black/80 p-2 rounded-lg text-xs font-mono text-green-400 break-all border border-slate-800 shadow-lg whitespace-pre-wrap">
                    <span className="select-all">{generateCommand()}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="absolute top-1 right-1 p-1.5 bg-slate-700/50 hover:bg-slate-600/80 rounded-md text-slate-300 transition-all border border-slate-600/30 backdrop-blur-sm"
                    title="Copy to clipboard"
                >
                    {copied ? <span className="text-green-400 font-bold text-[10px]">COPIED</span> : <Copy className="w-3 h-3" />}
                </button>
            </div>
            <div className="mt-1 text-[10px] text-slate-500 text-right italic">
                * Verify flags for your specific build
            </div>
        </div>
    );
};

export default CommandExporter;
