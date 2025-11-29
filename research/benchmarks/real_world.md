# Real-World Performance Benchmarks (2025)

*Last Updated: November 25, 2025*

Community-sourced benchmarks for LLM inference across various hardware configurations. All measurements are **tokens per second (tok/s)** during generation.

## 📊 Benchmark Methodology

**Standard Test:**
- Model: Llama 3.1 70B, Q4_K_M quantization
- Context: 2048 tokens (pre-filled)
- Batch Size: 1
- Engine: llama.cpp (CUDA/Metal) or ExLlamaV2
- Temperature: 0.8

---

## 🎮 NVIDIA Consumer GPUs

### RTX 5090 (32GB GDDR7, 1.79 TB/s)

| Model | Quant | Engine | Tok/s | Notes |
|-------|-------|--------|-------|-------|
| **Llama 3.1 8B** | Q4_K_M | llama.cpp | ~180 | Bottleneck is CPU at this point |
| **Llama 3.1 70B** | Q4_K_M | llama.cpp | ~55 | |
| **Llama 3.1 70B** | Q4_K_M | ExLlamaV2 | ~62 | |
| **Llama 3.1 405B** | Q3_K_M | llama.cpp | ~12 | Requires offloading or Q2 |

### RTX 5080 (16GB GDDR7, 960 GB/s)

| Model | Quant | Engine | Tok/s | Notes |
|-------|-------|--------|-------|-------|
| **Llama 3.1 8B** | Q4_K_M | llama.cpp | ~140 | Slightly faster than RTX 4090 in compute, VRAM limited |
| **Llama 3.1 70B** | Q4_K_M | llama.cpp | ~45 | Fits 16 GB VRAM with off‑loading |
| **Qwen 2.5 32B** | Q4_K_M | llama.cpp | ~60 | Good mid‑range performance |

**Note:** Llama 3.1 70B Q4 doesn't fit (requires ~48GB with 2k context).

### RTX 3090 / 3090 Ti (24GB GDDR6X, 936 GB/s)

| Model | Quant | Engine | Tok/s | Notes |
|-------|-------|--------|-------|-------|
| **Llama 3.1 8B** | Q4_K_M | llama.cpp | ~150 | |
| **Qwen 2.5 32B** | Q4_K_M | llama.cpp | ~65 | |
| **Qwen 2.5 32B** | Q4_K_M | ExLlamaV2 | ~75 | Still excellent value used |

### RTX 4060 Ti 16GB (288 GB/s)

| Model | Quant | Engine | Tok/s | Notes |
|-------|-------|--------|-------|-------|
| **Llama 3.1 8B** | Q4_K_M | llama.cpp | ~45 | Bandwidth bottleneck! |
| **Qwen 2.5 14B** | Q4_K_M | llama.cpp | ~28 | |

**Warning:** Low bandwidth kills performance despite 16GB VRAM.

---

## 🍎 Apple Silicon (Metal)

### M5 Max (128GB, ~400 GB/s)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Llama 3.1 70B** | Q5_K_M | ~25 | Comfortable fit |
| **Llama 3.1 70B** | Q4_K_M | ~30 | |
| **Llama 3.1 8B** | Q4_K_M | ~120 | |

### M4 Max (128GB, 546 GB/s)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Llama 3.1 70B** | Q5_K_M | ~22 | |
| **Llama 3.1 70B** | Q4_K_M | ~27 | |
| **Qwen 2.5 72B** | Q4_K_M | ~26 | |

### M2 Ultra (192GB, 800 GB/s)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Llama 3.1 70B** | Q6_K | ~28 | Bandwidth king |
| **Llama 3.1 405B** | Q3_K_M | ~6 | Only place this fits locally |
| **Llama 3.1 405B** | Q4_K_M | ~8 | Comfortable with 192GB |

### M3 Max (128GB, 400 GB/s)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Llama 3.1 70B** | Q4_K_M | ~24 | |
| **Llama 3.1 8B** | Q4_K_M | ~110 | |

### M1 Max (64GB, 400 GB/s)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Qwen 2.5 32B** | Q4_K_M | ~35 | Sweet spot for 64GB |
| **Llama 3.1 8B** | Q4_K_M | ~100 | |

---

## 🔴 AMD (ROCm on Linux)

### RX 7900 XTX (24GB GDDR6, 960 GB/s)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Llama 3.1 8B** | Q4_K_M | ~125 | ~75% of NVIDIA speed |
| **Qwen 2.5 32B** | Q4_K_M | ~50 | |

**Note:** ROCm support is solid but still slower than CUDA.

---

## 🔋 CPU-Only (For Reference)

### AMD Ryzen 9 7950X (128GB DDR5-5200)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Llama 3.1 70B** | Q4_K_M | ~3 | Usable for short answers |
| **Llama 3.1 8B** | Q4_K_M | ~15 | Decent for chat |

---

## 🚀 Multi-GPU Setups

### 2x RTX 3090 (48GB total)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Llama 3.1 70B** | Q4_K_M | ~35 | Tensor split across both |
| **Llama 3.1 70B** | Q6_K | ~28 | Higher quality fit |

**Note:** Scaling is not perfect due to PCIe bandwidth between cards.

---

## 📈 Performance Scaling by Model Size

**RTX 4090, Q4_K_M, 2k context**

| Model Size | Tok/s | VRAM Used |
|------------|-------|-----------|
| **3B** | ~200 | ~3 GB |
| **7-8B** | ~165 | ~6 GB |
| **13-14B** | ~110 | ~10 GB |
| **32-34B** | ~75 | ~22 GB |

---

## 💡 Key Takeaways

1. **Bandwidth > Compute:** The RTX 5090's massive 1.79 TB/s bandwidth gives it a ~25% boost over 4090 despite similar CUDA cores.

2. **Apple Silicon Competitive:** M-series chips with high bandwidth (M2/M4 Ultra) match or beat NVIDIA in tok/s *per dollar* when you factor in the cost of multi-GPU setups.

3. **MoE Models Punch Above Weight:** Mixtral 8x7B (13B active) runs ~30% faster than Llama 3.1 13B despite having more total parameters.

4. **Quantization Impact:** Going from Q4 to Q6 improves quality slightly but costs ~20% speed due to increased memory traffic.

5. **AMD is Viable:** 75-80% of NVIDIA speed on Linux with ROCm. Great value if you're comfortable with CLI.

---

## 🔗 Benchmark Sources

- [r/LocalLLaMA Wiki](https://www.reddit.com/r/LocalLLaMA/wiki/index/) - Community benchmarks
- [llama.cpp Discussions](https://github.com/ggerganov/llama.cpp/discussions) - Official performance reports
- ViVi Buddy Community Submissions - Real users, real hardware

**Want to contribute?** Submit your benchmarks with hardware specs to improve this research!
