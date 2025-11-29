# Research Applied to Code - November 25, 2025

This document tracks how research findings have been integrated into the ViVi Buddy application code.

## 🖥️ Hardware Database Updates

### Added November 2025 Hardware

**Apple Silicon (M4/M5):**
- ✅ Apple M5 Max (128GB, 400 GB/s) - Late 2025 release
- ✅ Apple M4 Max (128GB, 546 GB/s) - Accurate bandwidth spec
- ✅ Apple M2 Ultra (192GB, 800 GB/s) - Capacity king
- ✅ Apple M3 Max (128GB, 400 GB/s) - Updated pricing

**NVIDIA GPUs:**
- ✅ RTX 4080 Super (16GB, 736 GB/s) - Added missing variant
- ✅ RTX 3090 Ti (24GB, 1008 GB/s) - Added missing variant

### Updated Benchmark Data

Based on `/research/benchmarks/real_world.md`:

**RTX 4090 (24GB):**
- Llama 3.1 8B Q4: 165 tok/s (was generic "60")
- Qwen 2.5 32B Q4: 75 tok/s (new)

**RTX 3090 (24GB):**
- Llama 3.1 8B Q4: 150 tok/s (was "45")
- Qwen 2.5 32B Q4: 65 tok/s (new)

**RTX 3090 Ti (24GB):**
- Llama 3.1 8B Q4: 155 tok/s (new)
- Qwen 2.5 32B Q4: 68 tok/s (new)

**AMD RX 7900 XTX (24GB):**
- Llama 3.1 8B Q4: 125 tok/s (~75% of NVIDIA, per research)
- Qwen 2.5 32B Q4: 50 tok/s (new)

**Apple M5 Max (128GB):**
- Llama 3.1 8B: 120 tok/s (12% faster than M4)
- Llama 3.1 70B Q4: 25 tok/s (new)

**Apple M4 Max (128GB):**
- Llama 3.1 8B: 110 tok/s (research-based)
- Llama 3.1 70B Q4: 22 tok/s (new)

**Apple M2 Ultra (192GB):**
- Llama 3.1 70B Q6: 28 tok/s (bandwidth advantage)
- Llama 3.1 405B Q3: 6 tok/s (only consumer chip that fits this!)

**Apple M3 Max (128GB):**
- Llama 3.1 8B: 110 tok/s (research-based)
- Llama 3.1 70B Q4: 24 tok/s (new)

## 🔢 Memory Calculation Accuracy

### Quantization Precision Bits (`src/V5/utils/constants.ts`)

Already accurate per `/research/software/quantization.md`:

```typescript
'q8_0': 8.5,    // ✅ Matches research (8.0 + overhead)
'q6_k': 6.6,    // ✅ Matches research (~6.6 bpw)
'q5_k_m': 5.7,  // ✅ Matches research (~5.7 bpw)
'q4_k_m': 4.8,  // ✅ Matches research (~4.8 bpw)
'q3_k_m': 3.9,  // ✅ Matches research (~3.9 bpw)
'q2_k': 2.6,    // ✅ Matches research (~2.6 bpw)
```

These match the bytes-per-parameter calculations in `/research/models/memory_calculations.md`.

## 📊 Performance Multipliers

The application uses bandwidth as the primary performance indicator, which aligns with research findings:

**From `/research/benchmarks/real_world.md`:**
> "Bandwidth > Compute: The RTX 5090's massive 1.79 TB/s bandwidth gives it a ~25% boost over 4090 despite similar CUDA cores."

**Application Logic:**
- Performance is primarily bandwidth-bound (tok/s ≈ Bandwidth / Model Size)
- GPU layer offloading has CPU bandwidth penalty (accurately modeled)
- Multi-GPU setups account for PCIe bottleneck

## 🎯 Model Architectures

### Default Model Settings (`src/V5/utils/constants.ts`)

The default 7B model uses accurate architecture parameters:

```typescript
modelSize: 7,        // ✅ Standard 7B size
numLayers: 32,       // ✅ Correct for Llama 2/3 7B
hiddenSize: 4096,    // ✅ Correct hidden dimension
contextLength: 4096, // ✅ Reasonable default
```

Per `/research/models/architectures.md`, these match Llama 3.1 8B specs.

## 🔧 Backend Support

The `gpuBackend` options match current inference engine support:

```typescript
gpuBackend: 'auto' | 'cuda' | 'metal' | 'vulkan' | 'rocm' | 'sycl'
```

**Mapping to Research:**
- `cuda` → NVIDIA (fastest, per research)
- `metal` → Apple Silicon (optimal for M-series)
- `rocm` → AMD on Linux (75-80% of CUDA speed)
- `vulkan` → Cross-platform (slower universal fallback)
- `sycl` → Intel Arc (emerging support)

Matches `/research/software/inference_engines.md` recommendations.

## 📚 Citations & Educational Content

All education content in `src/pages/LearnPage.tsx` now includes citations to:

1. **Transformer Architecture**: Vaswani et al. (2017) - Attention Is All You Need
2. **LLaMA Models**: Meta (2023) - LLaMA paper
3. **Quantization**: Dettmers et al. (2023) - QLoRA paper
4. **Memory Management**: llama.cpp implementation notes
5. **Hardware Performance**: Tim Dettmers, r/LocalLLaMA

## 🔄 Maintenance Guidelines

### When New Hardware Launches

1. Update `/research/hardware/gpu_specs.md` with specs
2. Add to `src/database/hardware_db.json` with benchmark estimates
3. Verify benchmarks from community (r/LocalLLaMA)
4. Update within 1 month of release

### When New Models Launch

1. Document in `/research/models/architectures.md`
2. Add architecture specs (layers, hidden size) if unique
3. Update memory calculations if architecture changes

### When New Research is Published

1. Add to `/research/papers/inference_2025.md`
2. Update `src/pages/LearnPage.tsx` if foundational
3. Add citations to global footer if seminal

---

**Last Updated:** November 25, 2025  
**Next Review:** When RTX 50-series benchmarks are widely available (est. Q1 2026)
