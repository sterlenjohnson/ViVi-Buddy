# LLM Model Architectures (2025)

*Last Updated: November 25, 2025*

This document provides an overview of the most popular open-source LLM families and their characteristics for local inference.

## 🏛️ Major Model Families

### Llama 3 Series (Meta)
**Release:** March 2024 (Llama 3), October 2024 (Llama 3.1/3.2)

| Model | Parameters | Context | Architecture Highlights |
|-------|-----------|---------|------------------------|
| **Llama 3.1 405B** | 405B | 128k | Largest open model. Requires 240GB+ VRAM (Q4). |
| **Llama 3.1 70B** | 70B | 128k | The "sweet spot" flagship. ~40GB VRAM (Q4). |
| **Llama 3.1 8B** | 8B | 128k | Best small model. ~5GB VRAM (Q4). |

**Best For:** General-purpose tasks, coding, instruction following.
**Standout Feature:** Excellent long-context performance (128k tokens).

### Mistral / Mixtral (Mistral AI)
**Release:** September 2023 (Mistral 7B), December 2023 (Mixtral 8x7B)

| Model | Parameters | Active Params | Context | Type |
|-------|-----------|---------------|---------|------|
| **Mixtral 8x22B** | 141B | 39B | 64k | MoE (Sparse) |
| **Mixtral 8x7B** | 47B | 13B | 32k | MoE (Sparse) |
| **Mistral 7B** | 7B | 7B | 32k | Dense |

**Best For:** Efficiency. MoE models only load active experts (uses less VRAM than dense models of same parameter count).
**Standout Feature:** Mixtral 8x7B performs like a 30B model but uses 13B VRAM.

### Qwen 2.5 (Alibaba)
**Release:** September 2024

| Model | Parameters | Context | Specialization |
|-------|-----------|---------|----------------|
| **Qwen 2.5 72B** | 72B | 32k | General, Math, Code |
| **Qwen 2.5 32B** | 32B | 32k | Best mid-size model |
| **Qwen 2.5 14B** | 14B | 32k | Excellent coding |
| **Qwen 2.5 7B** | 7B | 128k | Long context specialist |

**Best For:** Multilingual tasks, math, coding.
**Standout Feature:** Qwen 2.5 32B often outperforms Llama 3.1 70B on benchmarks while using half the VRAM.

### Phi-3 (Microsoft)
**Release:** April 2024

| Model | Parameters | Context | Notes |
|-------|-----------|---------|-------|
| **Phi-3-Medium** | 14B | 128k | Trained on high-quality data only. |
| **Phi-3-Small** | 7B | 128k | Punches above its weight. |
| **Phi-3-Mini** | 3.8B | 128k | Runs on phones. |

**Best For:** Resource-constrained environments, edge devices.
**Standout Feature:** Tiny models with surprising capability due to curated training data.

### DeepSeek-V2 (DeepSeek AI)
**Release:** May 2024

| Model | Parameters | Active Params | Context | Type |
|-------|-----------|---------------|---------|------|
| **DeepSeek-V2 236B** | 236B | 21B | 128k | MoE |

**Best For:** Advanced reasoning, code generation.
**Standout Feature:** Massive total parameters (236B) but only 21B active = fits in 24GB VRAM (Q4).

## 🧬 Architecture Comparison

### Dense vs Mixture-of-Experts (MoE)

| Type | Example | VRAM Usage | Pros | Cons |
|------|---------|------------|------|------|
| **Dense** | Llama 3.1 70B | All 70B params loaded | Consistent quality | High VRAM |
| **MoE** | Mixtral 8x7B | Only active experts (13B) | Lower VRAM for size | Complex routing |

### Context Length Evolution

| Year | Typical Context | Example Model |
|------|----------------|---------------|
| 2022 | 2k - 4k | GPT-3 |
| 2023 | 8k - 32k | Llama 2, Mistral |
| 2024 | 32k - 128k | Llama 3.1, Qwen 2.5 |
| 2025 | 128k - 1M | Gemini, Claude (proprietary) |

**Note:** Longer context = more KV cache = more VRAM needed.

## 📊 Recommended Models by VRAM Budget

### 8GB VRAM
- **Llama 3.1 8B** (Q4) - Best overall
- **Phi-3-Small** (Q4) - If you need long context
- **Mistral 7B** (Q5/Q6) - Higher quality quant

### 12GB VRAM
- **Qwen 2.5 14B** (Q4)
- **Phi-3-Medium** (Q4)
- **Llama 3.1 8B** (Q8) - Highest quality

### 16GB VRAM
- **Qwen 2.5 32B** (Q3/Q4)
- **Mixtral 8x7B** (Q4)
- **Llama 3.1 8B** (FP16) - No quality loss

### 24GB VRAM
- **Llama 3.1 70B** (Q4)
- **Qwen 2.5 72B** (Q4)
- **DeepSeek-V2** (Q4) - 236B total params!

### 32GB+ VRAM (RTX 5090, Dual GPUs, Mac Studio)
- **Llama 3.1 70B** (Q6/Q8) - Near-lossless
- **Llama 3.1 405B** (Q2/Q3) - If you have 64GB+

## 🔗 Model Download Sources

- **Hugging Face:** [huggingface.co](https://huggingface.co) - Official hub
- **Ollama Library:** [ollama.com/library](https://ollama.com/library) - One-command download
- **TheBloke (GGUF):** Legacy, but many quantized versions archived

## 📈 Performance vs Size (General Rule)

```
Parameters    |  Capability Level
------------- | ------------------
3-7B          |  Good for chat, simple tasks
13-20B        |  Solid reasoning, decent coding
30-40B        |  Strong coding, complex logic
70B+          |  Near-GPT-4 level (with good training)
```

**Important:** Model quality depends heavily on training data and methods, not just parameter count. A well-trained 32B model can outperform a poorly-trained 70B model.
