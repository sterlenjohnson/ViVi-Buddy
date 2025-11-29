# Software & OS Limitations by Hardware

*Last Updated: November 26, 2025*

This document outlines software compatibility and performance limitations for LLM inference tools across different hardware/OS combinations.

---

## 🍎 macOS Intel Macs (Critical Limitations)

### ❌ LM Studio - NOT SUPPORTED

**Status:** LM Studio officially **does NOT support Intel Macs** running macOS.

- **Official Requirement:** Apple Silicon (M1/M2/M3/M4/M5) only
- **Workaround:** Install Windows (Boot Camp) or Linux to use LM Studio
  - Boot Camp requires macOS 15 or earlier (removed in macOS 26 Tahoe)
  - Parallels/VMware will not provide GPU passthrough

**Source:** [LM Studio Official Docs](https://lmstudio.ai/docs)

---

### ⚠️ Ollama - CPU-ONLY

**Status:** Ollama runs on Intel Macs but **GPU acceleration is NOT available**.

| Feature | Apple Silicon | Intel Mac (macOS) |
|---------|---------------|-------------------|
| Metal GPU Acceleration | ✅ Yes | ❌ No |
| AMD GPU Support | ✅ Yes (M-series) | ❌ No (Radeon Pro) |
| CPU Inference | ✅ Yes | ✅ Yes (slow) |

**Why?**
- Ollama uses Apple's **Metal API** for GPU acceleration
- Metal GPU offloading is **exclusive to Apple Silicon**
- Intel Mac AMD GPUs (Radeon Pro 5700 XT, W6800X) are **not recognized** for Metal compute

**Performance Impact:**
```
Mac Pro 2019 (W6800X Duo, 64GB VRAM)
- Expected (if GPU worked): ~96 tok/s (Llama 3 8B)
- Actual (CPU-only):        ~15 tok/s (DDR4 bottleneck)
```

**Workaround:** Use `llama.cpp` directly with Vulkan backend on Linux.

---

### ⚙️ llama.cpp - Limited GPU Support

**Status:** Partially works, but AMD GPU support on macOS is hit-or-miss.

| Backend | Intel Mac (macOS) | Notes |
|---------|-------------------|-------|
| **Metal** | ⚠️ Unreliable | May work for some AMD GPUs, not officially supported |
| **Vulkan** | ❌ Not available | Vulkan 1.3+ not supported on macOS |
| **CPU** | ✅ Works | Slow (DDR4 bandwidth) |

**Recommended Setup for Intel Macs:**
1. **Install Linux** (Ubuntu 22.04+ or Fedora 38+)
2. Use **ROCm** for AMD Radeon Pro GPUs
3. Achieve ~70-80% of CUDA performance

---

## 🐧 Linux (Best for Intel Macs)

If you have a Mac Pro 2019 or iMac 2020 and want GPU acceleration:

### Install Linux for Full Performance

| Software | GPU Support | Performance |
|----------|-------------|-------------|
| **llama.cpp (ROCm)** | ✅ AMD Radeon Pro | ~80% of NVIDIA equivalent |
| **Ollama (ROCm)** | ✅ AMD Radeon Pro | Full GPU acceleration |
| **LM Studio** | ❌ Not available | Windows/macOS only |
| **text-generation-webui** | ✅ AMD Radeon Pro | Excellent with ROCm |

**ROCm Compatibility:**
- Radeon Pro W6800X: ✅ Supported
- Radeon Pro 5700 XT: ✅ Supported (may need hacky drivers)
- Radeon Pro Vega II: ⚠️ Legacy support

---

## 🪟 Windows (Boot Camp - Legacy)

**⚠️ Boot Camp Removed:** macOS 26 Tahoe does NOT support Boot Camp.

If you're still on **macOS 15 Sequoia or earlier**, you can install Windows 11:

| Software | GPU Support | Notes |
|----------|-------------|-------|
| **LM Studio** | ✅ Full support | Best option for GUI |
| **Ollama** | ❌ AMD not supported | NVIDIA/CPU only |
| **llama.cpp** | ⚠️ Vulkan | Requires AMD GPU drivers |

**Recommended:** Use **LM Studio on Windows** for the best Intel Mac experience.

---

## 🍏 Apple Silicon (M1-M5) - No Limitations

For reference, Apple Silicon Macs have **zero software limitations**:

| Software | Support | Performance |
|----------|---------|-------------|
| **LM Studio** | ✅ Full | Excellent |
| **Ollama** | ✅ Full | Metal acceleration |
| **llama.cpp** | ✅ Full | Optimized Metal backend |

**Verdict:** If you're buying new hardware, **do not buy Intel Macs** for LLM work.

---

## 📊 Performance Summary (Intel Mac on macOS)

| Hardware | Software | GPU Used? | Llama 3 8B Q4 Speed |
|----------|----------|-----------|---------------------|
| Mac Pro 2019 (W6800X Duo) | Ollama (macOS) | ❌ CPU-only | ~15 tok/s |
| Mac Pro 2019 (W6800X Duo) | llama.cpp (Linux ROCm) | ✅ GPU | ~96 tok/s |
| iMac 2020 (5700 XT) | Ollama (macOS) | ❌ CPU-only | ~12 tok/s |
| iMac 2020 (5700 XT) | LM Studio (Windows) | ✅ GPU | ~65 tok/s |
| M3 Max (128GB) | Any software (macOS) | ✅ GPU | ~110 tok/s |

---

## 🚨 Key Takeaways

1. **Intel Macs on macOS are crippled for LLMs:**
   - LM Studio: ❌ Doesn't work
   - Ollama: ⚠️ CPU-only (10x slower than expected)
   - llama.cpp: ⚠️ Unreliable GPU support

2. **Workarounds exist but are painful:**
   - Install Linux for ROCm support (best performance)
   - Install Windows for LM Studio (if on macOS 15 or earlier)

3. **Apple Silicon has no such issues:**
   - Everything works out of the box
   - Metal acceleration is excellent

**Recommendation:** If you own a Mac Pro 2019 or iMac 2020, **install Linux** (dual boot or replace macOS entirely) to unlock full GPU performance for LLM inference.
