# ViVi Buddy

**Video RAM Visualizer** - A comprehensive VRAM calculator and educational tool for LLM inference planning.

[![Version](https://img.shields.io/badge/version-5.2-blue)](https://github.com/sterlenjohnson/ViVi-Buddy)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)

## 🌟 Features

### 📊 Accurate VRAM Calculations
- **Model Weights**: Precise calculations for FP16, Q8, Q6_K, Q5_K, Q4_K, Q3_K, Q2_K quantizations
- **KV Cache**: Dynamic calculation based on context length, hidden size, and layer count
- **Real-time Estimates**: Instant feedback as you adjust model parameters
- **Multi-GPU Support**: Tensor splitting across multiple GPUs with bandwidth considerations

### 🖥️ Hardware Support (November 2025)

**NVIDIA GPUs:**
- ✅ RTX 50-series (Blackwell): 5090 (32GB), 5080 (16GB)
- ✅ RTX 40-series (Lovelace): 4090, 4080 Super, 4060 Ti 16GB
- ✅ RTX 30-series (Ampere): 3090/Ti, 3060 12GB

**Apple Silicon:**
- ✅ M5 series (Late 2025): Base, Pro, Max
- ✅ M4 series: Base, Pro, Max
- ✅ M3/M2/M1 series: All variants with unified memory support

**AMD Radeon:**
- ✅ RDNA 3: RX 7900 XTX/XT (24GB/20GB)
- ✅ ROCm support tracking for Linux users

### 🎯 Two Modes for Every User
- **Basic Mode**: Quick hardware selection and model estimation
- **Advanced Mode**: Granular control over GPUs, RAM, quantization, and backends

### 💡 Smart Tools & Features
- **Auto-Detect Hardware**: One-click detection of your system specs
- **CLI Command Export**: Generate llama.cpp, Ollama, or LM Studio commands
- **GPU Backend Selection**: Choose CUDA, Metal, Vulkan, ROCm, or SYCL
- **FlashAttention Support**: Toggle FA for supported backends
- **Save/Load Configs**: Persist your hardware setups
- **Performance Estimates**: Relative speed multipliers based on hardware

### 📚 Educational Resources
- **Learn Page**: Comprehensive guides on LLM inference, hardware, quantization
- **Interactive Benchmarks**: Real-world performance data across hardware
- **Citations & Research**: Links to papers (Attention Is All You Need, LLaMA, FlashAttention, QLoRA)
- **Compare Mode**: Side-by-side hardware comparison

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/sterlenjohnson/ViVi-Buddy.git
cd ViVi-Buddy

# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:3000` to use the app.

### Production Build

```bash
npm run build
serve -s build
```

## 📖 Usage Examples

### Example 1: Llama 3.1 8B on RTX 4090
1. Select "RTX 4090 24GB" hardware preset
2. Enter: 8B parameters, Q4_K_M quantization
3. Context length: 4096 tokens
4. **Result**: ~5-6GB VRAM, runs entirely on GPU at ~165 tok/s

### Example 2: Llama 3.1 70B on Mac Studio M4 Max (128GB)
1. Toggle "Unified Memory" mode
2. Set 128GB unified memory
3. Enter: 70B parameters, Q5_K_M quantization
4. Context: 8192 tokens
5. **Result**: ~52GB used, comfortable fit at ~22-25 tok/s

### Example 3: Qwen 2.5 32B on RTX 3090 (Hybrid Mode)
1. Set hardware: RTX 3090 24GB
2. Enter: 32B parameters, Q4_K_M
3. Context: 4096 tokens
4. Enable "Hybrid" mode if memory is tight
5. Adjust GPU layers to fit within 24GB
6. **Result**: Optimized layer split with performance estimate

## 🎓 Learn Page Topics

Access comprehensive guides from the **Learn** tab:

- **LLM Inference Basics**: How inference works, memory requirements, bandwidth bottlenecks
- **Hardware Guide**: GPU vs CPU, Apple Silicon, bandwidth comparisons
- **Quantization Explained**: Q8, Q6, Q4, Q3, Q2 quality/size tradeoffs
- **Offloading Concepts**: When to offload, performance impact, PCIe bottlenecks
- **Recommended Workflows**: Budget builds, power user setups
- **Glossary**: Quick reference for technical terms

All sections include **citations** and links to research papers.

## 🛠️ Technology Stack

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **React Router** - Multi-page navigation

## 🔧 Advanced Features

### CLI Command Export
Export ready-to-use commands for:
- **llama.cpp**: Full control with `-ngl`, `--tensor-split`, backend flags
- **Ollama**: Simple `ollama run` with env vars for multi-GPU
- **LM Studio**: Commands with optimal settings

### Multi-GPU Configurations
- Dual/Triple GPU setups (e.g., 2x RTX 3090 = 48GB)
- Tensor splitting based on VRAM ratios
- Mismatched GPU support (different models in one system)

### Inference Software Integration
- Backend-specific recommendations (CUDA for NVIDIA, Metal for Apple, etc.)
- FlashAttention toggle for supported models
- RoPE scaling for long-context models
- Model-specific optimizations

## 📊 Benchmarks Page

Real-world performance data from the community:
- Tokens/second across different hardware
- Model size vs VRAM trade-offs
- Quantization impact on speed and quality
- Multi-GPU scaling efficiency

## 🔬 Research Integration

ViVi Buddy calculations are based on:
- **[llama.cpp](https://github.com/ggerganov/llama.cpp)** - Core memory model
- **[Hugging Face Transformers](https://huggingface.co/docs/transformers)** - Architecture specs
- **Community benchmarks** from r/LocalLLaMA
- **Latest research** (2024-2025):
  - Power-of-Two 3-bit quantization
  - Test-time compute scaling
  - Deterministic inference challenges

## 🤝 Contributing

Contributions welcome! Areas of interest:
- Hardware database updates (new GPUs, specs)
- Model architecture additions (e.g., Qwen 3, Gemma 2)
- Benchmark data submissions
- UI/UX improvements

### How to Contribute
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/NewHardware`
3. Make your changes with clear commit messages
4. Submit a Pull Request with description

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **llama.cpp** team for the inference engine reference
- **r/LocalLLaMA** community for benchmarks and hardware insights
- **Hugging Face** for model hosting and documentation
- All contributors and users who submitted hardware data

## 📬 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/sterlenjohnson/ViVi-Buddy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sterlenjohnson/ViVi-Buddy/discussions)
- **Updates**: Watch this repo for new hardware support and features

---

**Note:** Hardware specs and benchmarks are maintained separately in local research files. For the latest GPU releases and performance data, the app is updated within 1 month of hardware launch.

Made with ❤️ for the AI community | Updated November 2025
