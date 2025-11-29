# VRAM & Memory Calculations Explained

*Last Updated: November 25, 2025*

This document explains how to calculate the VRAM/RAM requirements for running LLMs, so you can predict if a model will fit on your hardware.

## 🧮 The Core Formula

```
Total Memory = Model Weights + KV Cache + Overhead
```

Let's break down each component.

---

## 1️⃣ Model Weights

The static file size of the model.

### Formula
```
Weights (GB) = Parameters × Bytes per Parameter
```

### Bytes per Parameter by Quantization

| Quantization | Bits/Param | Bytes/Param | Example: 70B Model |
|--------------|------------|-------------|--------------------|
| **FP16** | 16 | 2.0 | 140 GB |
| **Q8_0** | 8 | 1.0 | 70 GB |
| **Q6_K** | ~6.6 | 0.825 | ~58 GB |
| **Q5_K_M** | ~5.7 | 0.7125 | ~50 GB |
| **Q4_K_M** | ~4.8 | 0.6 | **42 GB** ⭐ |
| **Q3_K_M** | ~3.9 | 0.4875 | ~34 GB |
| **Q2_K** | ~2.6 | 0.325 | ~23 GB |

**Example:** Llama 3.1 70B at Q4_K_M  
`70B params × 0.6 bytes = 42 GB`

---

## 2️⃣ KV Cache

The memory needed to store the conversation context.

### Formula
```
KV Cache (GB) = 2 × Context × Hidden Size × Num Layers × KV Precision × Batch Size
                ─────────────────────────────────────────────────────────────────
                                    1,073,741,824
```

Breaking it down:
- **`2`** = Key + Value caches
- **Context** = Context length in tokens (e.g., 8192)
- **Hidden Size** = Model's hidden dimension (e.g., 4096 for Llama 2 7B, 8192 for 70B)
- **Num Layers** = Number of transformer layers (e.g., 32 for 7B, 80 for 70B)
- **KV Precision** = Bytes per element
  - FP16 = 2 bytes
  - INT8 = 1 byte
- **Batch Size** = Number of sequences processed in parallel (usually 1 for local chat)

### Example: Llama 3.1 70B, 8k context, FP16 KV, batch=1

```
KV Cache = (2 × 8192 × 8192 × 80 × 2 × 1) / 1,073,741,824
         = 20,401,094,656 bytes / 1,073,741,824
         ≈ 19 GB
```

**Key Insight:** KV cache grows linearly with context length. Doubling context doubles KV cache size.

---

## 3️⃣ Overhead

Additional memory for activations, temporary buffers, and the inference engine itself.

### Typical Overhead by Engine

| Engine | Overhead |
|--------|----------|
| **llama.cpp** | ~500 MB - 1 GB |
| **ExLlamaV2** | ~1 - 2 GB |
| **Ollama** | ~1 - 1.5 GB (wraps llama.cpp) |
| **vLLM** | ~3 - 5 GB (aggressive KV cache pooling) |

**Conservative Estimate:** Add **1-2 GB** for overhead.

---

## 🔢 Full Example Calculation

**Scenario:** Llama 3.1 70B, Q4_K_M quant, 8k context, FP16 KV cache, RTX 4090 (24GB VRAM)

### Step 1: Model Weights
```
70B × 0.6 bytes/param = 42 GB
```

### Step 2: KV Cache
```
(2 × 8192 × 8192 × 80 × 2 × 1) / 1,073,741,824 = 19 GB
```

### Step 3: Overhead
```
~1.5 GB
```

### Total
```
42 + 19 + 1.5 = 62.5 GB
```

**Conclusion:** This won't fit in 24GB VRAM. You'd need to:
- Reduce context to 2k → KV cache drops to ~5 GB → Total ~48.5 GB (still too much)
- Use Q3_K_M quant → Weights drop to ~34 GB → Total ~54.5 GB (still too much)
- **Offload to RAM** → Hybrid CPU/GPU inference

---

## 🎯 Quick Reference Table

### Llama 3.1 70B Memory Requirements

| Quant | Context | KV Cache | Total VRAM |
|-------|---------|----------|------------|
| **Q4_K_M** | 2k | 5 GB | ~48 GB |
| **Q4_K_M** | 4k | 10 GB | ~53 GB |
| **Q4_K_M** | 8k | 19 GB | ~62 GB |
| **Q3_K_M** | 2k | 5 GB | ~40 GB |
| **Q3_K_M** | 4k | 10 GB | ~45 GB |
| **Q3_K_M** | 8k | 19 GB | ~54 GB |

---

## 💡 Optimization Strategies

### 1. Reduce Context Length
If you don't need long conversations:
- 2k context is fine for short chats
- 4k is comfortable for most tasks
- 8k+ only if you need to reference lots of prior messages

### 2. Use INT8 KV Cache
Switching from FP16 to INT8 cuts KV cache in half with minimal quality loss.
- **FP16:** 19 GB (8k context, 70B model)
- **INT8:** 9.5 GB (same settings)

**How to enable:** Most engines support `--cache-type-k int8 --cache-type-v int8` flag.

### 3. Lower Quantization
If you can tolerate slight quality drop:
- Q4_K_M → Q3_K_M saves ~8 GB
- Only do this if you're VRAM-constrained

### 4. FlashAttention
Reduces memory usage during the forward pass (not weights or KV cache, but activations).
- Supported by LM Studio, newer llama.cpp builds
- Can save 1-3 GB depending on model size

---

## 🚀 Real-World Configurations

### 24GB VRAM (RTX 4090, RTX 3090)
- **Best Fit:** Llama 3.1 8B (FP16, 32k context)
- **Stretch:** Qwen 2.5 32B (Q4, 4k context)
- **Not Recommended:** Llama 3.1 70B (requires offloading or extreme quant)

### 32GB VRAM (RTX 5090)
- **Comfortable:** Llama 3.1 70B (Q4, 2k context)
- **Stretch:** Llama 3.1 70B (Q4, 4k context with INT8 KV)

### 64GB Unified (Mac Studio M2 Max)
- **Comfortable:** Llama 3.1 70B (Q5, 8k context)
- **Elite:** Llama 3.1 405B (Q2, 2k context)

### 192GB Unified (Mac Studio M2 Ultra)
- **No Limits:** Llama 3.1 405B (Q4, 8k+ context)

---

## 🔗 Calculators & Tools

- **ViVi Buddy (this app!):** Interactive VRAM estimator
- **llama.cpp `--dry-run`:** Reports exact memory usage before loading
- **LM Studio:** Shows VRAM bar before loading models
