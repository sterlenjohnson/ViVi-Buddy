# Intel Mac Compatibility & Performance (macOS 26 Tahoe)

*Last Updated: November 26, 2025*

macOS 26 "Tahoe" (released September 2025) is **the final macOS version to support Intel Macs**. Only four specific late-model Intel Macs retain compatibility.

## 🖥️ Supported Intel Macs (macOS 26 Tahoe)

**✅ Officially Supported:**
| Model | Year | CPU | Max RAM | GPU Options | Notes |
|-------|------|-----|---------|-------------|-------|
| **Mac Pro** | 2019 | Xeon W (up to 28-core) | 1.5 TB | Radeon Pro W6800X Duo (64GB) | The powerhouse |
| **iMac 27"** | 2020 | Core i9-10910 (10-core) | 128 GB | Radeon Pro 5700 XT (16GB) | Last Intel iMac |
| **MacBook Pro 16"** | 2019 | Core i9-9980HK | 64 GB | Radeon Pro 5600M (8GB HBM2) | Portable option |
| **MacBook Pro 13"** | 2020 | Core i7-1068NG7 | 32 GB | Intel Iris Plus | ⚠️ No discrete GPU |

**❌ Dropped (were on macOS 15):**
- All Intel MacBook Air models
- All Intel Mac mini models  
- iMac Pro 2017
- MacBook Pro 2018 and earlier

---

## 🚨 CRITICAL: Software Limitations on macOS

**Intel Macs have severe LLM software restrictions on macOS:**

| Software | Status | Workaround |
|----------|--------|------------|
| **LM Studio** | ❌ NOT SUPPORTED | Install Windows or Linux |
| **Ollama** | ⚠️ CPU-ONLY | No GPU acceleration via Metal |
| **llama.cpp** | ⚠️ Limited | AMD GPU support unreliable on macOS |

**Why?**
- **LM Studio** requires Apple Silicon (M1-M5) - officially unsupported on Intel
- **Ollama** uses Metal API for GPU - Metal compute is Apple Silicon-only
- **AMD GPUs** (Radeon Pro 5700 XT, W6800X) are NOT accelerated on macOS

**Performance Impact:**
```
Mac Pro 2019 w/ W6800X Duo (64GB VRAM)
Expected (if working):  ~96 tok/s (Llama 3 8B)
Actual on macOS:        ~15 tok/s (CPU-only, DDR4 bottleneck)
On Linux with ROCm:     ~96 tok/s (FULL GPU acceleration)
```

📖 **See:** [research/software/os_limitations.md](../software/os_limitations.md) for detailed workarounds.

---

## 📊 Real-World Benchmarks (llama.cpp Metal / Ollama on macOS)

Despite their age, high-end Intel Macs with discrete AMD GPUs can still perform well on paper, but **macOS software limitations cripple them**.

### MacBook Pro 16" 2019 (The Last Intel Portable)

**Available GPU Configurations:**
- Radeon Pro 5300M (4GB GDDR6)
- Radeon Pro 5500M (4GB or 8GB GDDR6)  
- Radeon Pro 5600M (8GB HBM2) - Fastest option

**Config Tested:** Core i9-9980HK, **Radeon Pro 5600M** (8GB HBM2), 32GB RAM

| Model | Quant | Speed (macOS) | Notes |
|-------|-------|---------------|-------|
| **Llama 3 8B** | Q4_K_M | **~8 tok/s** | CPU-only, GPU unused |
| **Qwen 2.5 7B** | Q4_K_M | **~10 tok/s** | Slightly better |

**5500M (4GB VRAM) Performance:**
- Llama 2 7B Q4: **~1.2 tok/s** - Completely unusable
- Reason: 4GB VRAM too small, falls back to system RAM

**Why so slow?**
- **Ollama cannot use AMD GPUs on macOS** (Metal compute is Apple Silicon-only)
- **LM Studio doesn't work at all** (requires Apple Silicon)
- Users report **sub-1 tok/s** for larger models

**On Linux with proper drivers:** ~40-50 tok/s estimated (4-6x faster)

---

### Mac Pro 2019 (The Last Stand)

**Config:** Xeon W 28-core, **Radeon Pro W6800X Duo** (64GB VRAM total), 384GB RAM.

| Model | Quant | Speed | Notes |
|-------|-------|-------|-------|
| **Llama 3 8B** | Q4_K_M | **~96 tok/s** | Comparable to M1 Max. |
| **Llama 3 70B** | Q4_K_M | **~18 tok/s** | Usable. 64GB VRAM is huge. |
| **Mixtral 8x7B** | Q4_K_M | **~35 tok/s** | Good performance. |

**Pros:**
- **Huge VRAM:** W6800X Duo has 64GB (32GB x2).
- **Expandable:** You can add more MPX modules.
- **System RAM:** Up to 1.5TB (slow DDR4, but massive capacity for CPU inference).

**Cons:**
- **Power:** Consumes 500W+ vs 50W for Mac Studio.
- **Heat:** It's a space heater.

### iMac 2020 (The Last iMac)

**Config:** Core i9-10910, **Radeon Pro 5700 XT** (16GB GDDR6), 128GB RAM.

| Model | Quant | Speed | Notes |
|-------|-------|-------|-------|
| **Llama 3 8B** | Q4_K_M | **~65 tok/s** | Surprisingly capable. |
| **Llama 3 70B** | Q4_K_M | **~2 tok/s** | **OOM** on GPU. CPU offloading is slow. |
| **Qwen 2.5 14B** | Q4_K_M | **~40 tok/s** | Sweet spot for 16GB VRAM. |

**Pros:**
- **16GB VRAM:** The 5700 XT 16GB is a unicorn card.
- **User Upgradable RAM:** Cheap DDR4 upgrades to 128GB.

**Cons:**
- **Thermals:** The i9 throttles heavily.
- **Fan Noise:** Loud under load.

---

## ⚠️ The "Intel Mac" Warning

If you are buying today: **Do not buy an Intel Mac for LLMs.**
*   **No Unified Memory:** You are limited by the VRAM of the discrete GPU (usually 8GB-16GB).
*   **Slow CPU Offloading:** DDR4 RAM (2666-2933 MHz) is 4-8x slower than Apple Silicon unified memory.
*   **OS Support:** macOS 16 is likely the final major update.

**Verdict:** Only keep using if you already own a Mac Pro 2019 or high-spec iMac 2020. Otherwise, an M1 Max/Ultra is superior in every way.
