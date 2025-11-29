import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Cpu, Zap, Database, GitBranch, HelpCircle, LucideIcon } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { useHardware } from '../contexts/HardwareContext';

interface Section {
    id: string;
    title: string;
    icon: LucideIcon;
    topics: string[];
}

const LearnPage: React.FC = () => {
    const { systemRamSize } = useHardware();

    const ramTip = systemRamSize >= 64
        ? "With 64GB+ RAM, you can run large models (70B) on CPU if your VRAM is full."
        : "With limited RAM, stick to quantized small models (7B-14B) to avoid swapping.";

    const sections: Section[] = [
        {
            id: 'basics',
            title: 'LLM Inference Basics',
            icon: BookOpen,
            topics: [
                'What happens during inference',
                'Memory requirements breakdown',
                'Why bandwidth matters most',
                'The role of quantization',
            ],
        },
        {
            id: 'hardware',
            title: 'Hardware Guide',
            icon: Cpu,
            topics: [
                'GPU vs CPU inference',
                'VRAM vs System RAM',
                'Unified memory (Apple Silicon)',
                'Bandwidth vs compute power',
            ],
        },
        {
            id: 'quantization',
            title: 'Quantization Explained',
            icon: Zap,
            topics: [
                'What is quantization?',
                'Quality vs speed tradeoffs',
                'Common quantization levels (2-8 bit)',
                'When to use each level',
            ],
        },
        {
            id: 'offloading',
            title: 'Offloading Concepts',
            icon: Database,
            topics: [
                'When offloading happens',
                'Performance impact',
                'CPU memory controller bandwidth',
                'Strategies to avoid offloading',
            ],
        },
        {
            id: 'workflows',
            title: 'Recommended Workflows',
            icon: GitBranch,
            topics: [
                'Choosing hardware for your budget',
                'Sizing for your models',
                'Benchmarking different configs',
                'Comparing price/performance',
            ],
        },
        {
            id: 'glossary',
            title: 'Glossary',
            icon: HelpCircle,
            topics: [
                'VRAM, RAM, Bandwidth',
                'Quantization, Context, Tokens',
                'Offloading, KV Cache',
                'Throughput, Latency',
            ],
        },
    ];

    const [activeSection, setActiveSection] = React.useState<string>('basics');


    const renderContent = () => {
        switch (activeSection) {
            case 'basics':
                return (
                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="text-blue-400" />
                                The Inference Process
                            </h3>
                            <p className="mb-4">
                                When you interact with a Large Language Model (LLM), the process is called
                                <strong className="text-white"> Inference</strong>. Unlike training, which teaches the model,
                                inference is using the model to generate text.
                            </p>
                            <p>
                                The model predicts the next <HelpTooltip text="A piece of text, roughly 0.75 words. Models process text in tokens, not characters.">token</HelpTooltip> one by one.
                                To do this, it must load its entire "brain" (weights) into memory and perform massive matrix calculations.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-xl font-bold text-white mb-3">Memory Requirements</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 min-w-[20px]"><Database size={16} className="text-purple-400" /></div>
                                        <div>
                                            <strong className="text-white">Model Weights:</strong> The static file size.
                                            <br /><span className="text-sm text-slate-400">Example: A 70B model at 4-bit takes ~35-40GB.</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 min-w-[20px]"><Zap size={16} className="text-yellow-400" /></div>
                                        <div>
                                            <strong className="text-white">KV Cache:</strong> <HelpTooltip text="Key-Value Cache. Stores context of the conversation so the model remembers what was said. Grows with context length.">?</HelpTooltip>
                                            <br /><span className="text-sm text-slate-400">Grows as the conversation gets longer.</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 min-w-[20px]"><Cpu size={16} className="text-green-400" /></div>
                                        <div>
                                            <strong className="text-white">Activations:</strong> Temporary working memory for calculations.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-xl font-bold text-white mb-3">Why Bandwidth Matters</h4>
                                <p className="mb-3">
                                    For LLM inference, <strong className="text-white">Memory Bandwidth</strong> is usually the bottleneck, not compute power (FLOPS).
                                </p>
                                <div className="bg-slate-900/50 p-3 rounded border border-slate-700 text-sm font-mono text-blue-300 mb-3">
                                    Speed (tokens/sec) ≈ Bandwidth (GB/s) / Model Size (GB)
                                </div>
                                <p className="text-sm">
                                    Imagine a library (VRAM). If you have a fast reader (GPU Core) but a narrow door (Bandwidth), the reader spends most of their time waiting for books.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-700/50">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sources</p>
                            <ul className="text-xs text-slate-400 space-y-1">
                                <li>• <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Vaswani et al. (2017). Attention Is All You Need.</a> (The Transformer architecture)</li>
                                <li>• <a href="https://huggingface.co/docs/transformers/llm_tutorial" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Hugging Face. Generation with LLMs.</a></li>
                            </ul>
                        </div>
                    </div>
                );
            case 'hardware':
                return (
                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Cpu className="text-blue-400" />
                                Hardware Guide
                            </h3>
                            <p className="mb-4">
                                Choosing the right hardware for LLMs is different from gaming.
                                While gaming needs raw compute (FLOPS), LLMs need <strong className="text-white">VRAM Capacity</strong> and <strong className="text-white">Memory Bandwidth</strong>.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-xl font-bold text-white mb-3">GPU vs CPU</h4>
                                <div className="space-y-4">
                                    <div>
                                        <strong className="text-green-400 block mb-1">GPU (Graphics Processing Unit)</strong>
                                        <p className="text-sm">
                                            The gold standard. Fast memory (GDDR6X/GDDR7) and massive parallelism.
                                            <br /><em>Pros:</em> Extremely fast (e.g., RTX 5090 hits 1.8 TB/s).
                                            <br /><em>Cons:</em> Expensive, limited VRAM per card (usually 24-32GB max for consumer).
                                        </p>
                                    </div>
                                    <div>
                                        <strong className="text-yellow-400 block mb-1">CPU (Central Processing Unit)</strong>
                                        <p className="text-sm">
                                            Uses system RAM. Much slower but can access huge amounts of memory (128GB+).
                                            <br /><em>Pros:</em> Cheap, high capacity.
                                            <br /><em>Cons:</em> Very slow (10-50x slower than GPU).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-xl font-bold text-white mb-3">Apple Silicon (Unified)</h4>
                                <p className="mb-3 text-sm">
                                    Apple's M-series chips (M1-M5) use <strong className="text-white">Unified Memory</strong>.
                                    The CPU and GPU share the same RAM pool.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400">•</span>
                                        <span><strong>High Capacity:</strong> You can get up to 512GB of fast memory in a Mac Pro (M5 Ultra).</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400">•</span>
                                        <span><strong>Good Bandwidth:</strong> 400GB/s - 800GB/s is comparable to high-end GPUs.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-400">•</span>
                                        <span><strong>Cost Effective:</strong> For &gt;48GB VRAM, a Mac is often cheaper than multiple GPUs.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Intel Mac Warning */}
                        <div className="bg-red-900/20 border border-red-700/50 p-6 rounded-xl">
                            <h4 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                                <span>⚠️</span> Intel Macs - Not Recommended
                            </h4>
                            <p className="text-sm mb-3">
                                Intel-based Macs (2019-2020 models) have <strong className="text-white">severe software limitations</strong> for LLM inference on macOS:
                            </p>
                            <ul className="space-y-2 text-sm mb-3">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400">❌</span>
                                    <span><strong>LM Studio:</strong> Does NOT work (Apple Silicon only)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-400">⚠️</span>
                                    <span><strong>Ollama:</strong> CPU-only (no GPU acceleration via Metal)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-400">⚠️</span>
                                    <span><strong>llama.cpp:</strong> AMD GPU support unreliable on macOS</span>
                                </li>
                            </ul>
                            <div className="bg-slate-900/50 p-3 rounded border border-slate-700 text-xs">
                                <strong className="text-white">Performance Impact:</strong>
                                <br />Mac Pro 2019 w/ W6800X Duo (64GB VRAM): <span className="text-red-400">~15 tok/s</span> on macOS vs <span className="text-green-400">~96 tok/s</span> on Linux
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-700/50">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sources</p>
                            <ul className="text-xs text-slate-400 space-y-1">
                                <li>• <a href="https://timdettmers.com/2023/01/30/which-gpu-for-deep-learning/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Tim Dettmers. Which GPU for Deep Learning?</a></li>
                                <li>• <a href="https://developer.apple.com/documentation/metal/metal_sample_code_library/performing_calculations_on_a_gpu" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Apple Developer. Unified Memory Architecture.</a></li>
                            </ul>
                        </div>
                    </div>
                );
            case 'quantization':
                return (
                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="text-yellow-400" />
                                Quantization Explained
                            </h3>
                            <p className="mb-4">
                                Quantization is the process of reducing the precision of the model's weights to save memory,
                                usually with minimal loss in intelligence.
                            </p>
                            <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                                <h4 className="font-bold text-white mb-2">The "Bits" Analogy</h4>
                                <p className="text-sm">
                                    Imagine storing a number like <strong>3.14159265359</strong> (16-bit/FP16).
                                    <br />Quantization rounds it to <strong>3.14</strong> (4-bit/Q4).
                                    <br />You save space, and for most tasks, 3.14 is precise enough.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-400">
                                <thead className="text-xs text-slate-200 uppercase bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3">Level</th>
                                        <th className="px-4 py-3">Size (70B Model)</th>
                                        <th className="px-4 py-3">Quality Loss</th>
                                        <th className="px-4 py-3">Recommendation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-700 hover:bg-slate-700/30">
                                        <td className="px-4 py-3 font-medium text-white">FP16 (16-bit)</td>
                                        <td className="px-4 py-3">~140 GB</td>
                                        <td className="px-4 py-3 text-green-400">None (Reference)</td>
                                        <td className="px-4 py-3">Research / Training</td>
                                    </tr>
                                    <tr className="border-b border-slate-700 hover:bg-slate-700/30">
                                        <td className="px-4 py-3 font-medium text-white">Q8 (8-bit)</td>
                                        <td className="px-4 py-3">~75 GB</td>
                                        <td className="px-4 py-3 text-green-400">Negligible</td>
                                        <td className="px-4 py-3">High precision tasks</td>
                                    </tr>
                                    <tr className="border-b border-slate-700 hover:bg-slate-700/30 bg-blue-900/10">
                                        <td className="px-4 py-3 font-medium text-white">Q4_K_M (4-bit)</td>
                                        <td className="px-4 py-3">~42 GB</td>
                                        <td className="px-4 py-3 text-yellow-400">Very Low</td>
                                        <td className="px-4 py-3 text-blue-300 font-bold">Sweet Spot (Recommended)</td>
                                    </tr>
                                    <tr className="border-b border-slate-700 hover:bg-slate-700/30">
                                        <td className="px-4 py-3 font-medium text-white">Q3_K_M (3-bit)</td>
                                        <td className="px-4 py-3">~33 GB</td>
                                        <td className="px-4 py-3 text-orange-400">Noticeable</td>
                                        <td className="px-4 py-3">If VRAM is tight</td>
                                    </tr>
                                    <tr className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3 font-medium text-white">Q2_K (2-bit)</td>
                                        <td className="px-4 py-3">~24 GB</td>
                                        <td className="px-4 py-3 text-red-400">Significant</td>
                                        <td className="px-4 py-3">Not recommended</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-700/50">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sources</p>
                            <ul className="text-xs text-slate-400 space-y-1">
                                <li>• <a href="https://arxiv.org/abs/2305.14314" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Dettmers et al. (2023). QLoRA: Efficient Finetuning of Quantized LLMs.</a></li>
                                <li>• <a href="https://github.com/ggerganov/llama.cpp/pull/1684" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">llama.cpp PR #1684. k-quants implementation details.</a></li>
                            </ul>
                        </div>
                    </div>
                );
            case 'offloading':
                return (
                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Database className="text-purple-400" />
                                Offloading Concepts
                            </h3>
                            <p className="mb-4">
                                When a model is too big for your GPU's VRAM, you can <strong className="text-white">offload</strong> some layers to your System RAM (CPU).
                            </p>
                            <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg">
                                <p className="text-yellow-200 text-sm font-medium">
                                    ⚠️ Warning: This kills performance.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-xl font-bold text-white mb-3">The Bottleneck</h4>
                                <p className="text-sm mb-3">
                                    System RAM is much slower than VRAM.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between border-b border-slate-700 pb-1">
                                        <span>RTX 4090 VRAM:</span>
                                        <span className="text-green-400 font-mono">1,008 GB/s</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-700 pb-1">
                                        <span>DDR5 System RAM:</span>
                                        <span className="text-yellow-400 font-mono">~50-80 GB/s</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>PCIe 4.0 x16 Bus:</span>
                                        <span className="text-red-400 font-mono">~32 GB/s</span>
                                    </li>
                                </ul>
                                <p className="text-xs text-slate-500 mt-3">
                                    Data has to travel over the PCIe bus, which is the slowest link.
                                </p>
                            </div>

                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-xl font-bold text-white mb-3">When to Offload?</h4>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✅</span>
                                        <span><strong>Just a few layers:</strong> If you are 1-2GB short, offloading is fine. You might lose 10-20% speed.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-yellow-400">⚠️</span>
                                        <span><strong>50/50 Split:</strong> Expect speeds to drop to 2-5 tokens/sec. Usable for chat, bad for processing.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">❌</span>
                                        <span><strong>Mostly CPU:</strong> Just run a smaller model. It will be faster and smarter than a brain-dead large model.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-700/50">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sources</p>
                            <ul className="text-xs text-slate-400 space-y-1">
                                <li>• <a href="https://www.reddit.com/r/LocalLLaMA/comments/144rchv/ram_bandwidth_is_all_you_need/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">r/LocalLLaMA. RAM Bandwidth Analysis.</a></li>
                                <li>• <a href="https://github.com/ggerganov/llama.cpp" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">llama.cpp. mmap and offloading implementation.</a></li>
                            </ul>
                        </div>
                    </div>
                );
            case 'workflows':
                return (
                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <GitBranch className="text-pink-400" />
                                Recommended Workflows
                            </h3>
                            <p className="mb-4">
                                Proven strategies for building your local AI setup, from budget-friendly to professional grade.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Workflow 1: The Budget Starter */}
                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded border border-green-700/50">ENTRY LEVEL</span>
                                    The "Budget Starter" Workflow
                                </h4>
                                <p className="text-sm mb-4">
                                    Best for learning and running 7B-14B models without breaking the bank.
                                </p>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300 bg-slate-900/30 p-4 rounded-lg border border-slate-700/50">
                                    <li><strong>Hardware:</strong> Use what you have (NVIDIA GPU with 8GB+ VRAM) or a Mac M1/M2 (16GB RAM).</li>
                                    <li><strong>Software:</strong> Install <a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Ollama</a> for one-click setup.</li>
                                    <li><strong>Model:</strong> Run <code>ollama run llama3:8b</code> or <code>ollama run mistral</code>.</li>
                                    <li><strong>Optimization:</strong> Stick to 4-bit quantization (Q4) to fit in memory.</li>
                                </ol>
                            </div>

                            {/* Workflow 2: The Power User */}
                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="bg-purple-900/50 text-purple-400 text-xs px-2 py-1 rounded border border-purple-700/50">ENTHUSIAST</span>
                                    The "Power User" Workflow
                                </h4>
                                <p className="text-sm mb-4">
                                    For running 70B+ models with high quality.
                                </p>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300 bg-slate-900/30 p-4 rounded-lg border border-slate-700/50">
                                    <li><strong>Hardware:</strong> Dual RTX 3090/4090 (48GB VRAM total) or Mac Studio (64GB+).</li>
                                    <li><strong>Software:</strong> Use <a href="https://github.com/ggerganov/llama.cpp" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">llama.cpp</a> directly or <a href="https://lmstudio.ai" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">LM Studio</a> for a GUI.</li>
                                    <li><strong>Model:</strong> Download GGUF files from <a href="https://huggingface.co" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Hugging Face</a> (e.g., Llama-3-70B-Instruct-Q4_K_M.gguf).</li>
                                    <li><strong>Optimization:</strong> Use <strong>Flash Attention</strong> and offload all layers to GPU.</li>
                                </ol>
                            </div>

                            {/* Sources & Citations */}
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">
                                    📚 Sources & Further Reading
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <a href="https://github.com/ggerganov/llama.cpp" target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 rounded hover:bg-slate-800 transition-colors group">
                                        <div className="bg-slate-800 group-hover:bg-slate-700 p-2 rounded text-white font-bold">L</div>
                                        <div>
                                            <strong className="text-blue-400 group-hover:underline">llama.cpp</strong>
                                            <p className="text-xs text-slate-400 mt-1">The core engine powering most local LLM tools. Best for technical details.</p>
                                        </div>
                                    </a>
                                    <a href="https://huggingface.co/docs/transformers/perf_infer_gpu_one" target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 rounded hover:bg-slate-800 transition-colors group">
                                        <div className="bg-slate-800 group-hover:bg-slate-700 p-2 rounded text-white font-bold">HF</div>
                                        <div>
                                            <strong className="text-blue-400 group-hover:underline">Hugging Face Docs</strong>
                                            <p className="text-xs text-slate-400 mt-1">Comprehensive guide on GPU inference and memory optimization.</p>
                                        </div>
                                    </a>
                                    <a href="https://www.reddit.com/r/LocalLLaMA/" target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 rounded hover:bg-slate-800 transition-colors group">
                                        <div className="bg-slate-800 group-hover:bg-slate-700 p-2 rounded text-white font-bold">R</div>
                                        <div>
                                            <strong className="text-blue-400 group-hover:underline">r/LocalLLaMA</strong>
                                            <p className="text-xs text-slate-400 mt-1">Community benchmarks, news, and hardware discussions.</p>
                                        </div>
                                    </a>
                                    <a href="https://timdettmers.com/2023/01/30/which-gpu-for-deep-learning/" target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 rounded hover:bg-slate-800 transition-colors group">
                                        <div className="bg-slate-800 group-hover:bg-slate-700 p-2 rounded text-white font-bold">TD</div>
                                        <div>
                                            <strong className="text-blue-400 group-hover:underline">Tim Dettmers' Blog</strong>
                                            <p className="text-xs text-slate-400 mt-1">Deep dive into GPU hardware for Deep Learning and LLMs.</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'glossary':
                return (
                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <HelpCircle className="text-teal-400" />
                                Glossary
                            </h3>
                            <p className="text-slate-400 text-sm">Common terms used in LLM inference.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { t: 'Inference', d: 'The process of using a trained model to generate text.' },
                                { t: 'Weights', d: 'The learned parameters of the model. This is the main file you download.' },
                                { t: 'VRAM', d: 'Video RAM. High-speed memory on your GPU. Critical for LLM speed.' },
                                { t: 'Quantization', d: 'Reducing precision (e.g. 16-bit to 4-bit) to save memory.' },
                                { t: 'Token', d: 'The basic unit of text for an LLM. ~0.75 words.' },
                                { t: 'Context Window', d: 'How much text the model can "remember" at once.' },
                                { t: 'KV Cache', d: 'Memory used to store the context. Grows as the chat gets longer.' },
                                { t: 'Offloading', d: 'Moving parts of the model to System RAM when VRAM is full.' },
                                { t: 'RoPE', d: 'Rotary Positional Embeddings. A technique for handling position in text.' },
                                { t: 'GGUF', d: 'A file format optimized for running LLMs on consumer hardware (CPU/GPU).' },
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-teal-500/30 transition-colors">
                                    <strong className="text-white block mb-1">{item.t}</strong>
                                    <p className="text-sm text-slate-400">{item.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-center py-12 text-slate-500">
                        <p>Select a topic to start learning.</p>
                    </div>
                );
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                    Learn About LLM Inference
                </h1>
                <p className="text-slate-400 text-lg">
                    Understand how LLMs work, what hardware you need, and how to optimize your setup
                </p>

                {/* Dynamic Tip */}
                <div className="mt-4 inline-block bg-blue-900/30 border border-blue-500/30 rounded-full px-4 py-1">
                    <span className="text-blue-400 text-sm font-medium">💡 Personalized Tip: </span>
                    <span className="text-blue-200 text-sm">{ramTip}</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${activeSection === section.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            <section.icon size={20} />
                            <span className="font-medium">{section.title}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {renderContent()}
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center border-t border-slate-800 pt-8">
                <p className="text-slate-400 mb-4">
                    Ready to apply what you've learned?
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        to="/"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Try Calculator
                    </Link>
                    <Link
                        to="/benchmarks"
                        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        View Benchmarks
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LearnPage;
