# LLM Inference Research (2025)

*Last Updated: November 25, 2025*

This document summarizes key research papers and trends in Large Language Model inference from 2024-2025.

## 🧠 Key Research Trends

### 1. Extreme Quantization (3-bit & 2-bit)
Research in 2025 has pushed quantization limits further.
*   **Power-of-Two (PoT) Quantization:** New methods for 3-bit quantization have shown to reduce perplexity by nearly 90% compared to traditional integer quantization, making 3-bit models viable for production.
*   **Impact:** Running Llama-3-70B on 24GB cards with minimal quality loss.

### 2. Test-Time Compute / Scaling
*   **Reinforcement Learning Teachers:** A July 2025 paper introduced "RL Teachers of Test Time Scaling". Instead of just training a model to answer, policies guide the model *during inference* to break down problems, use tools, or seek clarification.
*   **Impact:** Smarter models that "think" longer before answering, trading time for accuracy.

### 3. Determinism in Inference
*   **The Reproducibility Crisis:** A September 2025 paper highlighted that even with temperature=0, GPU floating-point non-associativity makes results non-deterministic across different batch sizes and hardware.
*   **Impact:** Critical for code generation and scientific applications where exact reproducibility is needed.

## 📚 Notable Papers (2024-2025)

| Title | Date | Key Insight | Link |
|-------|------|-------------|------|
| **Inference Optimization Techniques** | July 2025 | Comprehensive survey of latency reduction methods (GPTailor, VocabTrim). | [Report](https://budecosystem.com) |
| **Reproducibility in LLM Inference** | Sept 2025 | Explores non-determinism in GPU kernels affecting LLM outputs. | [Paper](https://thinkingmachines.ai) |
| **RL Teachers of Test Time Scaling** | July 2025 | Using RL to guide inference-time reasoning steps. | [Paper](https://medium.com) |
| **FlashAttention-3** | 2024 | Further optimization of attention mechanisms for Hopper/Blackwell GPUs. | [ArXiv](https://arxiv.org) |

## 🏛️ Foundational Papers (Reference)

| Title | Year | Significance |
|-------|------|--------------|
| **Attention Is All You Need** | 2017 | The birth of the Transformer architecture. |
| **LLaMA** | 2023 | Proved smaller, better-trained models can outperform giants. |
| **QLoRA** | 2023 | Democratized fine-tuning on consumer hardware. |
