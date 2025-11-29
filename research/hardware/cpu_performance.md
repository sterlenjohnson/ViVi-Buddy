# CPU Performance for LLM Inference (2025)

*Last Updated: November 25, 2025*

CPUs are viable for LLM inference when you don't have a GPU, need high memory capacity (128GB+ DDR5), or are running smaller models (<14B).

## ⚠️ Key Takeaway

**CPUs are 10-50x slower than GPUs** for LLM inference but offer:
- ✅ Massive memory capacity (128GB-512GB+ DDR5)
- ✅ Lower cost for high capacity
- ✅ Ability to run models that don't fit in any consumer GPU

## 📊 Real-World CPU Benchmarks

### AMD Ryzen 9 7950X (16 cores, 128GB DDR5-5200)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Llama 3.1 8B** | Q4 | ~15 | Usable for chat |
| **Llama 3.1 70B** | Q4 | ~3 | Slow but functional (~20 sec/sentence) |
| **Mixtral 8x7B** | Q8 | ~3.4 | Community benchmark |
| **30B models** | Q4 | ~2.2 | Barely usable |

**Key Specs:**
- **Memory Bandwidth:** ~96 GB/s (DDR5-5200)
- **Power:** ~142W typical, 230W max
- **Price:** $549 (Nov 2025)

### Intel Core i9-14900K (24 cores, 128GB DDR5-5600)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Llama 3.1 8B** | Q4 | ~16 | Slightly faster than 7950X |
| **Llama 3.1 70B** | Q4 | ~3 | Similar to AMD |
| **30B models** | Q4 | ~2.3 | Marginal improvement |

**Key Specs:**
- **Memory Bandwidth:** ~89.6 GB/s (DDR5-5600)
- **Power:** ~253W typical, 350W+ when boosting
- **Price:** $589 (Nov 2025)

**Verdict:** i9-14900K is ~5-10% faster but uses significantly more power. Not worth the premium for LLM inference.

### AMD Ryzen Threadripper PRO 7995WX (96 cores, 512GB DDR5)

| Model | Quant | Tok/s | Notes |
|-------|-------|-------|-------|
| **Llama 3.1 405B** | Q3 | ~1-2 | Only CPU that can fit this without swapping |
| **Llama 3.1 70B** | Q6 | ~6 | 2x faster than 7950X due to bandwidth |

**Key Specs:**
- **Memory Bandwidth:** ~332.8 GB/s (Octa-channel DDR5)
- **Capacity:** Supports up to 2TB RAM
- **Price:** ~$10,000 (workstation territory)

**Use Case:** Scientific/research workloads needing 100B+ models with high precision.

---

## 💡 CPU vs GPU Performance Comparison

**Llama 3.1 8B Q4 (2k context):**

| Hardware | Tok/s | Price | Price/Performance |
|----------|-------|-------|-------------------|
| **RTX 4090** | 165 | $1,599 | $9.69/tok/s |
| **RTX 3090** | 150 | $800 | $5.33/tok/s ⭐ |
| **Ryzen 9 7950X** | 15 | $549 | $36.60/tok/s |
| **i9-14900K** | 16 | $589 | $36.81/tok/s |

**Takeaway:** Even a used RTX 3090 is 10x faster and better price/performance than the best CPUs.

---

## 🧮 When to Use CPU Inference

### ✅ Good Reasons

1. **No GPU Available**
   - Laptops without discrete GPUs
   - Servers without GPU budget
   - Testing/development

2. **Extreme Memory Capacity**
   - Models >64GB (Llama 3.1 405B, DeepSeek V3, etc.)
   - Need 100+ GB available memory
   - Threadripper systems with 512GB+ RAM

3. **Budget for High Capacity**
   - 128GB DDR5 costs ~$400
   - 192GB Mac Studio M2 Ultra costs ~$6,000
   - Dual RTX 5090 (64GB total) costs ~$4,000+

### ❌ Bad Reasons

1. **"My CPU has 16 cores, it should be fast"**
   - LLM inference is bandwidth-bound, not compute-bound
   - More cores ≠ faster inference

2. **"I'll just offload to CPU to save money on GPU"**
   - Hybrid GPU+CPU is slow due to PCIe bottleneck
   - Better to run a smaller, faster model fully on GPU

3. **"DDR5 is fast, close to GDDR6"**
   - DDR5-6000: ~96 GB/s
   - GDDR6X (RTX 4090): 1,008 GB/s
   - **10x+ difference**

---

## ⚙️ Optimization Tips for CPU Inference

### 1. Max Out RAM Speed
- Enable XMP/EXPO in BIOS
- DDR5-6000+ gives noticeable improvement
- Ensure RAM is in correct slots (check motherboard manual for dual/quad channel)

### 2. Use llama.cpp (Best CPU Performance)
```bash
llama-cli -m model.gguf -c 2048 -t 16 --mlock
```
- `-t 16`: Use all cores (adjust to your CPU)
- `--mlock`: Keep model in RAM (don't swap to disk)

### 3. Lower Quantization If Needed
- Q4_K_M is the minimum viable quality
- Q3_K_M if desperate for size savings
- Avoid Q2 on CPU (already slow, quality loss not worth it)

### 4. Reduce Context Length
- 2k context uses less memory than 8k
- Faster inference (less KV cache to process)

---

## 📈 Future Outlook

### DDR5-8000+ (2026+)
Upcoming DDR5 speeds may reach 120-150 GB/s, improving CPU inference by 20-30%. Still nowhere near GPU speeds.

### CXL Memory Pooling
Server-grade tech allowing multiple CPUs to share memory pools. Enables 1TB+ configurations for massive models.

### AVX-512 Optimizations
Intel and AMD CPUs with AVX-512 can get ~10-15% speedup in llama.cpp. Already implemented in recent builds.

---

## 🎯 Recommendations

### Best CPU for LLM Inference (Consumer)

**Winner:** AMD Ryzen 9 7950X
- 16 cores, 128GB DDR5 support
- Best multi-core efficiency
- ~$549

**Runner-up:** Intel Core i9-14900K
- Slightly faster (~5%)
- Much higher power consumption
- Only if you need absolute max single-core speed

### Best "CPU Alternative" (Actually Use This)

**Mac Studio M2 Ultra (192GB)**
- Unified memory acts like VRAM
- ~800 GB/s bandwidth (8x faster than DDR5)
- ~28 tok/s for Llama 3.1 70B Q6
- $6,000 (cheaper than multi-GPU rig for this capacity)

---

## 📚 Sources

- [r/LocalLLaMA CPU Benchmarks](https://www.reddit.com/r/LocalLLaMA/)
- [Puget Systems: CPU for AI Inference](https://pugetsystems.com)
- [llama.cpp Performance Discussions](https://github.com/ggerganov/llama.cpp/discussions)
- AMD/Intel official specifications
