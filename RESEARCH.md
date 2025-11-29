# ViVi Buddy Research Index

*Last Updated: November 25, 2025*

This file serves as the main entry point to the ViVi Buddy research documentation. For detailed, categorized research, see the **`/research`** directory.

## 📂 Quick Links

### Core Documentation
- **[Research Directory Index →](research/README.md)** - Start here for the full research library

### By Category

#### Hardware
- [NVIDIA GPUs (RTX 30/40/50)](research/hardware/gpu_specs.md)
- [AMD Radeon (RDNA 3/4)](research/hardware/amd_gpus.md)
- [Apple Silicon (M1-M5)](research/hardware/apple_silicon.md)

#### Models
- [LLM Architectures (Llama, Qwen, Mistral, etc.)](research/models/architectures.md)
- [VRAM Calculations Explained](research/models/memory_calculations.md)

#### Software
- [Quantization & Formats (GGUF, EXL2, AWQ)](research/software/quantization.md)
- [Inference Engines (llama.cpp, Ollama, LM Studio)](research/software/inference_engines.md)

#### Research & Benchmarks
- [Latest LLM Inference Papers (2024-2025)](research/papers/inference_2025.md)
- [Real-World Performance Benchmarks](research/benchmarks/real_world.md)

---

## 🎯 Quick Answers

### "What GPU should I buy for LLMs?"

**Budget: $500-$800**
- Used RTX 3090 (24GB) - Best value for 70B models
- RX 7900 XTX (24GB) - If you're on Linux and comfortable with CLI

**Budget: $1000-$2000**
- RTX 5090 (32GB) - New king. Runs Llama 3.1 70B comfortably.
- RTX 4090 (24GB) - Still excellent if found under $1500.

**Budget: $2500+**
- Mac Studio M4 Max (128GB) - Best for 70B+ models with long context
- 2x RTX 3090 - 48GB total for multi-model workflows

### "What's the best quantization level?"

**Q4_K_M** - The sweet spot. ~1.5% perplexity increase for 50% size reduction.

**Use Q6_K if:**
- You have extra VRAM
- Running professional/research tasks
- Quality matters more than speed

**Use Q3_K_M if:**
- Barely fitting in VRAM
- Willing to trade quality for model size

### "Can I run Llama 3.1 70B on 24GB VRAM?"

**No** - Not comfortably.
- Weights alone: ~42GB (Q4)
- With 2k context: ~48GB total
- With 8k context: ~62GB total

**Options:**
1. Offload to RAM (slow, ~5-10 tok/s)
2. Use Q3_K_M + 2k context (~40GB - still tight)
3. Upgrade to 32GB VRAM (RTX 5090) or Mac Studio (64GB+)

### "Ollama vs llama.cpp vs LM Studio?"

- **Ollama:** Easiest. One command: `ollama run llama3`
- **llama.cpp:** Most control. Best performance on non-NVIDIA.
- **LM Studio:** Best GUI. Perfect for Windows/Mac users.

All three use the same underlying engine (llama.cpp), so performance is similar.

---

## 🔄 How This Documentation is Maintained

1. **Hardware releases** - Updated within 1 month of launch
2. **Major papers** - Added within 2 weeks of ArXiv publication
3. **Software updates** - Tracked for major version releases
4. **Benchmarks** - Community-sourced, verified before inclusion

---

## 📚 Contributing

Found outdated information or have new benchmarks? The research directory is designed to stay current. Check the `research/README.md` for contribution guidelines.

---

*For the ViVi Buddy application itself, see the main README.md in the project root.*
