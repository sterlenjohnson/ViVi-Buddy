# Intel Arc GPU Specifications (2025)

*Last Updated: November 25, 2025*

Intel's Arc series provides a modest entry point for LLM inference on Windows and Linux (via the open‑source `llama.cpp` HIP backend). While bandwidth and raw compute lag behind NVIDIA and AMD, the GPUs are useful for low‑budget or secondary‑GPU setups.

## Arc A-Series (Consumer)

| Model | VRAM | Type | Bus Width | Bandwidth | Xe‑Cores | Launch Price |
|-------|------|------|-----------|-----------|----------|--------------|
| **Arc A770 16GB** | 16 GB | GDDR6 | 256-bit | **560 GB/s** | 4 096 | $299 |
| **Arc A750 8GB** | 8 GB | GDDR6 | 128-bit | 512 GB/s | 3 584 | $249 |
| **Arc A580 8GB** | 8 GB | GDDR6 | 128-bit | 512 GB/s | 3 072 | $179 |
| **Arc A380 6GB** | 6 GB | GDDR6 | 96-bit | 186 GB/s | 1 024 | $139 |

### LLM Benchmark (Llama 3.1 8B Q4, 2k context)
- **Arc A770 16GB:** ~10 tok/s (≈ 75 % of RTX 4060 Ti)
- **Arc A750 8GB:** ~6 tok/s
- **Arc A580 8GB:** ~6 tok/s
- **Arc A380 6GB:** ~4 tok/s

These numbers are derived from community testing on `llama.cpp` (Nov 2025) and are included in the real‑world benchmarks file.

---

## Intel Arc Pro (Workstation) – Not yet consumer‑grade

Future updates will add the Pro series once they become widely available.
