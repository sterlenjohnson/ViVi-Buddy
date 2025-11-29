# Inference Engines & Software Tools (2025)

*Last Updated: November 25, 2025*

A comprehensive guide to the software ecosystem for running LLMs locally.

## 🚂 Inference Engines

### llama.cpp
**URL:** [github.com/ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)  
**License:** MIT  
**Best For:** CPU, Apple Silicon, NVIDIA, AMD (via ROCm/HIP)

**Pros:**
- ✅ Universal compatibility (Windows/Mac/Linux)
- ✅ GGUF format support (standard for local LLMs)
- ✅ Active development (weekly updates)
- ✅ Low VRAM overhead
- ✅ Hybrid CPU+GPU inference

**Cons:**
- ❌ Slower prompt processing than ExLlamaV2 on NVIDIA
- ❌ Command-line focused (though many GUIs wrap it)

**Backend Support:**
- **CUDA** (NVIDIA)
- **Metal** (Apple)
- **ROCm/HIP** (AMD)
- **Vulkan** (Universal, slower)
- **SYCL** (Intel Arc)
- **CPU** (Always available)

**Typical Usage:**
```bash
llama-cli -m llama-3.1-70b-q4_k_m.gguf -c 8192 -ngl 99 --color
```

---

### Ollama
**URL:** [ollama.com](https://ollama.com)  
**License:** MIT  
**Best For:** Beginners, quick testing, API servers

**Pros:**
- ✅ One-command model downloads (`ollama run llama3`)
- ✅ Built-in model library
- ✅ OpenAI-compatible API
- ✅ Automatic GPU detection
- ✅ Simple updates (`ollama pull`)

**Cons:**
- ❌ Less control over advanced settings
- ❌ Wraps llama.cpp (adds overhead)
- ❌ Limited to curated model list (though you can import custom)

**Built on:** llama.cpp (uses GGUF files internally)

**Typical Usage:**
```bash
ollama run llama3.1:70b
```

---

### LM Studio
**URL:** [lmstudio.ai](https://lmstudio.ai)  
**License:** Proprietary (Free for personal use)  
**Best For:** GUI users, Windows/Mac

**Pros:**
- ✅ Beautiful GUI
- ✅ Built-in model browser (Hugging Face integration)
- ✅ Chat UI, server mode, and code completion
- ✅ Advanced settings exposed (RoPE scaling, Flash Attention, etc.)
- ✅ VRAM usage preview before loading

**Cons:**
- ❌ Proprietary (not open source)
- ❌ Slightly higher VRAM overhead than raw llama.cpp
- ❌ Intel Mac support is limited

**Built on:** llama.cpp

**Typical Usage:** Click, download, chat.

---

### ExLlamaV2
**URL:** [github.com/turboderp/exllamav2](https://github.com/turboderp/exllamav2)  
**License:** MIT  
**Best For:** NVIDIA GPUs (speed priority)

**Pros:**
- ✅ **Fastest** NVIDIA inference (beats llama.cpp by ~30%)
- ✅ EXL2 format (variable bitrate quantization)
- ✅ Dynamic generator (adaptive batching)

**Cons:**
- ❌ NVIDIA-only (CUDA required)
- ❌ No GGUF support (different format)
- ❌ More complex setup

**Format:** EXL2 (not GGUF)

**Typical Usage:**
```bash
python -m exllamav2.server --model llama-3.1-70b-exl2-4.0bpw
```

---

### vLLM
**URL:** [github.com/vllm-project/vllm](https://github.com/vllm-project/vllm)  
**License:** Apache 2.0  
**Best For:** Production servers, high throughput

**Pros:**
- ✅ Highest throughput (batching, continuous batching)
- ✅ PagedAttention (efficient KV cache management)
- ✅ OpenAI-compatible API
- ✅ Multi-GPU support

**Cons:**
- ❌ High VRAM overhead (reserves memory for batching)
- ❌ Complex setup
- ❌ Overkill for single-user chat

**Best Use Case:** Serving many users simultaneously.

---

### MLX (Apple-Specific)
**URL:** [github.com/ml-explore/mlx](https://github.com/ml-explore/mlx)  
**License:** MIT  
**Best For:** Apple Silicon (M1/M2/M3/M4/M5)

**Pros:**
- ✅ Native Apple framework
- ✅ Optimized for Metal
- ✅ Growing ecosystem

**Cons:**
- ❌ Apple-only
- ❌ Fewer pre-built models than GGUF
- ❌ Less mature than llama.cpp

**Note:** llama.cpp Metal backend is still faster on many models.

---

## 📱 GUI Applications

### LM Studio
See above. The most polished GUI.

### GPT4All
**URL:** [gpt4all.io](https://gpt4all.io)  
**License:** MIT  
**Best For:** Privacy-focused beginners

**Pros:**
- ✅ Simple, clean UI
- ✅ Curated model list
- ✅ Local-first

**Cons:**
- ❌ Limited to smaller models
- ❌ Less control than LM Studio

### Jan
**URL:** [jan.ai](https://jan.ai)  
**License:** AGPL-3.0  
**Best For:** Open-source GUI

**Pros:**
- ✅ Fully open source
- ✅ Multi-engine support

**Cons:**
- ❌ Newer, less polished

---

## 🖥️ Web UIs

### Text-Generation-WebUI (oobabooga)
**URL:** [github.com/oobabooga/text-generation-webui](https://github.com/oobabooga/text-generation-webui)  
**License:** AGPL-3.0  
**Best For:** Advanced users, extensions

**Pros:**
- ✅ Highly customizable
- ✅ Extension system
- ✅ Multi-backend (llama.cpp, ExLlamaV2, Transformers)

**Cons:**
- ❌ Complex setup
- ❌ UI is dated

### Open WebUI (formerly Ollama WebUI)
**URL:** [github.com/open-webui/open-webui](https://github.com/open-webui/open-webui)  
**License:** MIT  
**Best For:** Self-hosted ChatGPT-like interface

**Pros:**
- ✅ Modern UI (looks like ChatGPT)
- ✅ Multi-user support
- ✅ Works with Ollama or any OpenAI-compatible API

**Cons:**
- ❌ Requires Ollama/API backend

---

## ⚙️ Which Should You Use?

### Windows User, Want GUI
→ **LM Studio**

### Mac User (Apple Silicon)
→ **Ollama** or **LM Studio**

### Linux User, Want Speed
→ **llama.cpp** (direct) or **ExLlamaV2** (NVIDIA only)

### Want Maximum Speed (NVIDIA)
→ **ExLlamaV2**

### Want Simplicity
→ **Ollama**

### Serving Multiple Users
→ **vLLM** or **Ollama** (API mode)

### Privacy Paranoid
→ **GPT4All** (doesn't phone home)

---

## 📊 Performance Comparison (Rough Estimates)

**Llama 3.1 70B Q4, RTX 4090, 8k context, CUDA**

| Engine | Prompt (tok/s) | Generation (tok/s) |
|--------|----------------|---------------------|
| **ExLlamaV2** | ~600 | ~45 |
| **llama.cpp (CUDA)** | ~450 | ~42 |
| **Ollama (llama.cpp)** | ~420 | ~40 |
| **LM Studio** | ~400 | ~38 |

**Notes:**
- Prompt speed varies wildly based on context size
- Generation speed is more consistent
- These are ballpark figures; your mileage will vary

---

## 🔗 Installation Quick Links

- **llama.cpp releases:** [github.com/ggerganov/llama.cpp/releases](https://github.com/ggerganov/llama.cpp/releases)
- **Ollama install:** [ollama.com/download](https://ollama.com/download)
- **LM Studio download:** [lmstudio.ai](https://lmstudio.ai)
