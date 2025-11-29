# Consumer GPU Specifications (2025)

*Last Updated: November 25, 2025*

This document tracks the specifications of consumer GPUs relevant for Local LLM inference, focusing on VRAM capacity and memory bandwidth.

## NVIDIA GeForce RTX 50-Series (Blackwell)

Released in January 2025, the RTX 50-series introduces GDDR7 memory and the Blackwell architecture.

### RTX 5080 (16 GB GDDR7, 960 GB/s)

| Model | Quant | Engine | Tok/s | Notes |
|-------|-------|--------|-------|-------|
| **Llama 3.1 8B** | Q4_K_M | llama.cpp | ~140 | Slightly faster than RTX 4090 in compute, but VRAM limited |
| **Llama 3.1 70B** | Q4_K_M | llama.cpp | ~45 | Fits 16 GB VRAM with off‑loading |
| **Qwen 2.5 32B** | Q4_K_M | llama.cpp | ~60 | Good mid‑range performance |

---

| Model | VRAM | Type | Bus Width | Speed | Bandwidth | CUDA Cores | TBP | Launch Price |
|-------|------|------|-----------|-------|-----------|------------|-----|--------------|
| **RTX 5090** | 32 GB | GDDR7 | 512-bit | 28 Gbps | **1,792 GB/s** | 21,760 | 575W | $1,999 |
| **RTX 5080** | 16 GB | GDDR7 | 256-bit | 30 Gbps | **960 GB/s** | 10,752 | 360W | $999 |

### Key Insights for LLMs
*   **RTX 5090:** The new king of local inference. 32GB VRAM allows running unquantized 30B models or quantized 70B models comfortably with massive context. The 1.8 TB/s bandwidth provides near-instant token generation.
*   **RTX 5080:** While faster than the 4090 in compute, the 16GB VRAM limit makes it less ideal for large models compared to a used 3090/4090 (24GB).

## NVIDIA GeForce RTX 20-Series (Turing)

| Model | VRAM | Type | Bus Width | Bandwidth | CUDA Cores | TBP | Launch Price |
|-------|------|------|-----------|-----------|------------|-----|--------------|
| **RTX 2080 Ti** | 11 GB | GDDR6 | 352-bit | 616 GB/s | 4352 | 260W | $999 |
| **RTX 2080 Super** | 8 GB | GDDR6 | 256-bit | 448 GB/s | 3072 | 250W | $699 |
| **RTX 2070 Super** | 8 GB | GDDR6 | 256-bit | 448 GB/s | 2560 | 215W | $499 |
| **RTX 2060** | 6 GB | GDDR6 | 192-bit | 336 GB/s | 1920 | 160W | $349 |

### Key Insights for LLMs (RTX 20 Series)
- **VRAM limited** (6‑11 GB) – suitable only for 7‑8 B models with aggressive quantization.
- **Bandwidth** ~300‑600 GB/s, roughly half of RTX 30‑series, resulting in ~30‑40 % lower token throughput.
- **Benchmark example (Llama 3.1 8B Q4)**: ~7 tok/s on RTX 2070 Super, ~5 tok/s on RTX 2060.


| Model | VRAM | Type | Bus Width | Bandwidth | Notes |
|-------|------|------|-----------|-----------|-------|
| **RTX 4090** | 24 GB | GDDR6X | 384-bit | 1,008 GB/s | Previous flagship. Still excellent. |
| **RTX 4080 Super** | 16 GB | GDDR6X | 256-bit | 736 GB/s | Good for 13B-20B models. |
| **RTX 4060 Ti** | 16 GB | GDDR6 | 128-bit | 288 GB/s | Budget 16GB card. Bandwidth bottleneck. |

## NVIDIA GeForce RTX 30-Series (Ampere)

| Model | VRAM | Type | Bus Width | Bandwidth | Notes |
|-------|------|------|-----------|-----------|-------|
| **RTX 3090 / Ti** | 24 GB | GDDR6X | 384-bit | 936 GB/s | Best value used card for LLMs. |
| **RTX 3060** | 12 GB | GDDR6 | 192-bit | 360 GB/s | Best entry-level starter card. |
