# AMD Radeon GPU Specifications (2025)

*Last Updated: November 25, 2025*

AMD's RDNA 3 and upcoming RDNA 4 architectures provide competitive options for LLM inference, particularly on Linux with ROCm support.

## ⚠️ Important Notes for LLM Users

### Software Support Status (as of Nov 2025)
- **ROCm (Linux):** ✅ Excellent support via llama.cpp (HIP backend)
- **Windows:** ⚠️ Limited - Some tools work via Vulkan, but slower than CUDA
- **macOS:** ❌ Not supported

### Best Use Case
AMD cards shine on **Linux** for users who:
- Want better price-to-VRAM ratio than NVIDIA
- Are comfortable with command-line tools
- Don't need maximum inference speed (CUDA is still ~20-30% faster)

## RDNA 3 Series (Current Gen)

### High-End Cards

| Model | VRAM | Type | Bus Width | Bandwidth | Compute Units | TBP | Launch Price |
|-------|------|------|-----------|-----------|---------------|-----|--------------|
| **RX 7900 XTX** | 24 GB | GDDR6 | 384-bit | 960 GB/s | 96 | 355W | $999 |
| **RX 7900 XT** | 20 GB | GDDR6 | 320-bit | 800 GB/s | 84 | 300W | $799 |

**LLM Performance Notes:**
- **7900 XTX:** Excellent value for 24GB VRAM. Comparable to RTX 3090 Ti at a better price.
- **7900 XT:** 20GB is an odd capacity - not enough for 70B models, overkill for 13B.

### Mid-Range Cards

| Model | VRAM | Type | Bandwidth | Notes |
|-------|------|------|-----------|-------|
| **RX 7800 XT** | 16 GB | GDDR6 | 624 GB/s | Good for 13B-30B models. |
| **RX 7700 XT** | 12 GB | GDDR6 | 432 GB/s | Entry-level for 7B-13B models. |

## RDNA 4 Series (Expected 2025 Q4 / 2026 Q1)

**Status:** Rumored specifications, not yet released.

Expected improvements:
- Enhanced AI/ML compute units
- Potentially GDDR7 memory (unclear)
- Better power efficiency
- Improved ROCm compatibility

## RDNA 2 Series (Previous Gen - Still Viable)

| Model | VRAM | Bandwidth | Notes |
|-------|------|-----------|-------|
| **RX 6900 XT** | 16 GB | 512 GB/s | Solid used option for 16GB inference. |
| **RX 6800 XT** | 16 GB | 512 GB/s | Similar performance, often cheaper used. |

## ROCm Compatibility

### Supported Cards (as of ROCm 6.0+)
- ✅ RX 7900 XTX / XT
- ✅ RX 7800 XT / 7700 XT
- ✅ RX 6900 XT / 6800 XT / 6700 XT (RDNA 2)

### llama.cpp HIP Backend Performance
On Linux with ROCm, llama.cpp achieves approximately:
- **Prompt processing:** ~80% of NVIDIA CUDA speed
- **Token generation:** ~75% of NVIDIA CUDA speed

Actual speed depends heavily on model size and quant level.

## AMD vs NVIDIA for LLMs (Quick Comparison)

| Factor | AMD Advantage | NVIDIA Advantage |
|--------|---------------|------------------|
| **Price/VRAM** | ✅ Better (7900 XTX = 24GB for $999) | ❌ Worse (RTX 4090 = 24GB for $1,599+) |
| **Raw Speed** | ❌ ~75% of NVIDIA | ✅ Fastest (CUDA ecosystem) |
| **Software Support** | ⚠️ Linux-only via ROCm | ✅ Universal (Windows/Linux/WSL) |
| **Ease of Use** | ❌ Requires CLI comfort | ✅ GUI tools (LM Studio, etc.) |

## Recommendation

**Choose AMD if:**
- You're on Linux and comfortable with terminal
- Budget is tight and you need 24GB VRAM
- You're okay with slightly slower inference

**Choose NVIDIA if:**
- You're on Windows
- You want plug-and-play GUI tools
- Maximum speed matters more than cost
