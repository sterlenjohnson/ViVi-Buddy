# ViVi Buddy Research Directory

*Last Updated: November 25, 2025*

Welcome to the ViVi Buddy research directory. This is a living knowledge base documenting the latest hardware, software, and research relevant to running Large Language Models locally.

## 📁 Directory Structure

### `/hardware` - Hardware Specifications
- **[gpu_specs.md](hardware/gpu_specs.md)** - NVIDIA consumer GPUs (RTX 30/40/50 series)
- **[apple_silicon.md](hardware/apple_silicon.md)** - Apple M-series chips (M1-M5)
- **[amd_gpus.md](hardware/amd_gpus.md)** - AMD Radeon cards (RDNA 3/4)
- **[cpu_performance.md](hardware/cpu_performance.md)** - CPU inference performance (Ryzen, Intel)

### `/papers` - Research Papers & Innovations
- **[inference_2025.md](papers/inference_2025.md)** - Latest LLM inference research (2024-2025)

### `/benchmarks` - Performance Data
- **[real_world.md](benchmarks/real_world.md)** - Real-world tok/s benchmarks across hardware

### `/internal` - Implementation Details
- **[AUTODETECT_IMPLEMENTATION.md](internal/AUTODETECT_IMPLEMENTATION.md)** - Auto-detect hardware feature specs
- **[research_applied.md](internal/research_applied.md)** - Log of research applied to codebase
- **[code_improvements_2025_11_23.md](internal/code_improvements_2025_11_23.md)** - Code improvement logs

### `/software` - Software & Tools
- **[quantization.md](software/quantization.md)** - Model formats (GGUF, EXL2, AWQ) and quantization levels
- **[inference_engines.md](software/inference_engines.md)** - llama.cpp, Ollama, LM Studio, etc.
- **[llamacpp_backends.md](software/llamacpp_backends.md)** - Detailed llama.cpp backend support
- **[lmstudio_compatibility.md](software/lmstudio_compatibility.md)** - LM Studio compatibility guide
- **[wasm_reference.md](software/wasm_reference.md)** - WASM implementation details
- **[os_limitations.md](software/os_limitations.md)** - Software compatibility & OS limitations per hardware

### `/models` - Model Information
- **[architectures.md](models/architectures.md)** - Popular model families (Llama 3, Mistral, Qwen, etc.)
- **[memory_calculations.md](models/memory_calculations.md)** - How VRAM requirements are calculated
- **[quality_research.md](models/quality_research.md)** - Research on quantization quality metrics

## 🔄 Update Schedule

This research directory is maintained to stay current with:
- **Hardware releases** - Updated within 1 month of launch
- **Major papers** - Added within 2 weeks of publication
- **Software updates** - Tracked for major version releases

## 📚 How to Use

1. **Starting out?** Read `/hardware/gpu_specs.md` and `/software/quantization.md` first.
2. **Buying hardware?** Compare `/hardware/*` files against your budget.
3. **Optimizing performance?** Check `/benchmarks/real_world.md` for your setup.
4. **Research?** Browse `/papers/` for the latest academic work.

## 🤝 Contributing

Found outdated specs or new research? This directory is designed to be kept up-to-date. Key sources we track:
- ArXiv for papers
- TechPowerUp GPU Database
- r/LocalLLaMA community benchmarks
- Official vendor documentation (NVIDIA, AMD, Apple)

---

*For implementation details of how ViVi Buddy uses this research, see the main `/RESEARCH.md` file.*
