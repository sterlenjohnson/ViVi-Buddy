# Quantization & Software Formats (2025)

*Last Updated: November 25, 2025*

## 📦 Model File Formats

### GGUF (GPT-Generated Unified Format)
*   **Best For:** CPU, Apple Silicon, and Hybrid (CPU+GPU) inference.
*   **Engine:** llama.cpp, Ollama, LM Studio.
*   **Key Feature:** Single-file format that contains everything (weights, tokenizer, config). Supports "k-quants" (see below).

### EXL2 (ExLlamaV2)
*   **Best For:** NVIDIA GPUs (Speed).
*   **Engine:** ExLlamaV2, TabbyAPI, Text-Generation-WebUI.
*   **Key Feature:** Variable bitrate quantization. You can mix 2.5bpw, 4.0bpw, and 6.0bpw layers in the same model to perfectly fill your VRAM (e.g., a 23.5GB model for a 24GB card).

### AWQ (Activation-aware Weight Quantization)
*   **Best For:** Production serving (vLLM).
*   **Engine:** vLLM, AutoGPTQ.
*   **Key Feature:** Better quality than GPTQ at low bitrates by protecting important weights.

## 📉 Quantization Levels (GGUF)

| Quantization | Bits/Weight | Perplexity Increase | Use Case |
|--------------|-------------|---------------------|----------|
| **Q8_0** | 8.0 | ~0.0% | Archival / Reference. |
| **Q6_K** | ~6.6 | ~0.1% | "Perceptually Lossless". |
| **Q5_K_M** | ~5.7 | ~0.5% | High accuracy, saves VRAM vs Q6. |
| **Q4_K_M** | ~4.8 | ~1.5% | **The Sweet Spot.** Best balance of size/smarts. |
| **Q3_K_M** | ~3.9 | ~3.0% | Good for very large models (70B+) on constrained hardware. |
| **IQ2_XXS** | ~2.0 | High | Experimental. Only for massive models (400B+) where size is critical. |

## 🚀 Inference Engines Comparison

| Engine | Primary Hardware | Pros | Cons |
|--------|------------------|------|------|
| **llama.cpp** | Apple Silicon / CPU | Universal compatibility, GGUF support, low VRAM overhead. | Slower prompt processing on NVIDIA compared to ExLlamaV2. |
| **ExLlamaV2** | NVIDIA GPU | **Fastest** inference speed. Dynamic generator. | NVIDIA only. No GGUF support. |
| **MLX** | Apple Silicon | Native Apple framework. growing ecosystem. | Newer, fewer tools than llama.cpp. |
| **vLLM** | Server GPUs | High throughput (batching). | High VRAM overhead (KV cache). Complex setup. |
