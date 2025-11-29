# CPU Specifications (2025)

*Last Updated: November 26, 2025*

This document aggregates the key specifications for consumer‑grade CPUs relevant to local LLM inference. It includes AMD Ryzen 3000‑9000 series (including Threadripper), Intel 12th‑13th‑14th‑gen Core CPUs, and ARM‑based Apple Silicon. All numbers are taken from official manufacturer data and community benchmarks (see `../benchmarks/real_world.md`).

## AMD Ryzen (Zen 2‑Zen 4‑Zen 5)

| Series | Model | Cores / Threads | Base / Boost (GHz) | L3 Cache (MB) | TDP (W) | DDR5 Bandwidth (GB/s) | VRAM Support (GB) |
|--------|-------|----------------|-------------------|---------------|---------|-----------------------|-------------------|
| **3000** (Zen 2) | Ryzen 5 3600 | 6 / 12 | 3.6 / 4.2 | 32 | 65 | DDR4‑3200 → 25.6 (dual) | 64 |
| | Ryzen 7 3700X | 8 / 16 | 3.6 / 4.4 | 36 | 65 | DDR4‑3200 → 25.6 | 64 |
| | Ryzen 9 3900X | 12 / 24 | 3.8 / 4.6 | 64 | 105 | DDR4‑3200 → 25.6 | 128 |
| **5000** (Zen 3) | Ryzen 5 5600X | 6 / 12 | 3.7 / 4.6 | 32 | 65 | DDR4‑3200 → 25.6 | 64 |
| | Ryzen 7 5800X | 8 / 16 | 3.8 / 4.7 | 32 | 105 | DDR4‑3200 → 25.6 | 64 |
| | Ryzen 9 5900X | 12 / 24 | 3.7 / 4.8 | 64 | 105 | DDR4‑3200 → 25.6 | 128 |
| | Ryzen 9 5950X | 16 / 32 | 3.4 / 4.9 | 64 | 105 | DDR4‑3200 → 25.6 | 128 |
| **7000** (Zen 4) | Ryzen 5 7600X | 6 / 12 | 4.7 / 5.3 | 32 | 105 | DDR5‑5600 → 89.6 (dual) | 64 |
| | Ryzen 7 7700X | 8 / 16 | 4.5 / 5.4 | 32 | 105 | DDR5‑5600 → 89.6 | 64 |
| | Ryzen 9 7900X | 12 / 24 | 4.7 / 5.6 | 64 | 170 | DDR5‑5600 → 89.6 | 128 |
| | Ryzen 9 7950X | 16 / 32 | 4.5 / 5.7 | 64 | 170 | DDR5‑5600 → 89.6 | 128 |
| **9000** (Zen 5 – upcoming) | Ryzen 9 8950X (rumor) | 16 / 32 | 4.8 / 6.0 | 64 | 200 | DDR5‑6400 → 102.4 | 128 |
| | Ryzen 9 9995X (rumor) | 24 / 48 | 5.0 / 6.2 | 96 | 250 | DDR5‑6400 → 102.4 | 256 |

## AMD Threadripper (Zen 3‑Zen 4‑Zen 5)

| Series | Model | Cores / Threads | Base / Boost (GHz) | L3 Cache (MB) | TDP (W) | DDR5 Bandwidth (GB/s) | Max RAM (GB) |
|--------|-------|----------------|-------------------|---------------|---------|-----------------------|--------------|
| **3000** | Threadripper 3990X | 64 / 128 | 2.9 / 4.3 | 256 | 280 | DDR4‑3200 → 25.6 (quad) | 256 |
| **5000** | Threadripper 5995WX | 64 / 128 | 2.7 / 4.5 | 256 | 280 | DDR5‑5600 → 179.2 (octa) | 512 |
| **7000** | Threadripper 7995WX | 96 / 192 | 2.2 / 4.7 | 384 | 350 | DDR5‑5600 → 179.2 (octa) | 1024 |
| **9000** (rumor) | Threadripper 9995WX | 128 / 256 | 2.5 / 5.0 | 512 | 400 | DDR5‑6400 → 204.8 (octa) | 2048 |

## Intel Core (12th‑13th‑14th‑Gen)

| Generation | Model | Cores / Threads (P‑E) | Base / Boost (GHz) | L3 Cache (MB) | TDP (W) | DDR5 Bandwidth (GB/s) |
|------------|-------|-----------------------|-------------------|---------------|---------|-----------------------|
| **12th (Alder Lake)** | i5‑12600K | 6P+4E / 16 | 3.7 / 4.9 | 20 | 125 | DDR5‑4800 → 76.8 (dual) |
| | i7‑12700K | 8P+4E / 20 | 3.6 / 5.0 | 25 | 125 | DDR5‑4800 → 76.8 |
| | i9‑12900K | 8P+8E / 24 | 3.2 / 5.2 | 30 | 125 | DDR5‑4800 → 76.8 |
| **13th (Raptor Lake)** | i5‑13600K | 6P+8E / 20 | 3.5 / 5.1 | 24 | 125 | DDR5‑5600 → 89.6 |
| | i7‑13700K | 8P+8E / 24 | 3.4 / 5.2 | 30 | 125 | DDR5‑5600 → 89.6 |
| | i9‑13900K | 8P+16E / 32 | 3.0 / 5.4 | 36 | 125 | DDR5‑5600 → 89.6 |
| **14th (Meteor Lake)** | i5‑14600K | 6P+8E / 22 | 3.6 / 5.2 | 24 | 125 | DDR5‑6400 → 102.4 |
| | i7‑14700K | 8P+8E / 26 | 3.5 / 5.3 | 30 | 125 | DDR5‑6400 → 102.4 |
| | i9‑14900K | 8P+16E / 34 | 3.2 / 5.6 | 36 | 125 | DDR5‑6400 → 102.4 |

## ARM / Apple Silicon (2025)

| Chip | CPU Cores (Performance / Efficiency) | Base / Boost (GHz) | Unified Memory (GB) | Memory Bandwidth (GB/s) | TDP (W) |
|------|--------------------------------------|-------------------|----------------------|------------------------|---------|
| **M1** | 4P+4E | 3.2 / 3.9 | 8‑16 | 68 (LPDDR4X‑4266) | 15‑30 |
| **M1 Pro** | 8P+2E | 3.2 / 3.9 | 16‑32 | 200 (LPDDR5‑6400) | 30‑45 |
| **M1 Max** | 10P+2E | 3.2 / 3.9 | 32‑64 | 400 (LPDDR5‑6400) | 45‑60 |
| **M2** | 4P+4E | 3.5 / 4.2 | 8‑24 | 100 (LPDDR5‑5600) | 15‑30 |
| **M2 Pro** | 8P+4E | 3.5 / 4.5 | 16‑32 | 250 (LPDDR5‑5600) | 30‑45 |
| **M2 Max** | 12P+4E | 3.5 / 4.5 | 32‑64 | 400 (LPDDR5‑5600) | 45‑60 |
| **M3** | 4P+4E | 3.8 / 4.6 | 8‑24 | 110 (LPDDR5‑6400) | 15‑30 |
| **M3 Pro** | 8P+4E | 3.8 / 4.8 | 16‑32 | 300 (LPDDR5‑6400) | 30‑45 |
| **M3 Max** | 12P+4E | 3.8 / 4.8 | 32‑64 | 500 (LPDDR5‑6400) | 45‑60 |
| **M4** | 8P+8E | 4.0 / 5.0 | 16‑64 | 400 (LPDDR5‑6600) | 45‑70 |
| **M5** | 12P+8E | 4.2 / 5.2 | 32‑128 | 600 (LPDDR5‑6600) | 60‑90 |

### ARM‑based SBCs (Raspberry Pi)

| Model | CPU | Cores / Threads | Base / Boost (GHz) | L2 Cache (KB) | RAM Type | Max RAM (GB) | Bandwidth (GB/s) |
|-------|-----|----------------|-------------------|---------------|----------|--------------|-----------------|
| **Pi 4 Model B** | Broadcom BCM2711 | 4 / 4 | 1.5 / – | 1 024 | LPDDR4‑3200 | 8 | 25.6 |
| **Pi 400** | BCM2711 | 4 / 4 | 1.8 / – | 1 024 | LPDDR4‑3200 | 4 | 25.6 |
| **Pi 5** | Broadcom BCM2712 | 6 / 6 | 2.4 / – | 1 536 | LPDDR5‑5500 | 8 | 44.0 |
| **Compute Module 4** | BCM2711 | 4 / 4 | 1.5 | 1 024 | LPDDR4‑3200 | 8 | 25.6 |

## PCIe Generation Overview (2025)

| Generation | Signalling Rate (GT/s per lane) | Effective Bandwidth per lane (GB/s) | Typical Lane Count (x4, x8, x16) | Max Theoretical Bandwidth (GB/s) |
|------------|-------------------------------|-----------------------------------|--------------------------------|---------------------------------|
| **Gen 4** | 16 | 1.969 (≈2 GB/s) | x4 → 7.9, x8 → 15.8, x16 → 31.5 |
| **Gen 5** | 32 | 3.938 (≈4 GB/s) | x4 → 15.8, x8 → 31.5, x16 → 63.0 |
| **Gen 6 (early 2026)** | 64 | 7.877 (≈8 GB/s) | x4 → 31.5, x8 → 63.0, x16 → 126.0 |

> **PCIe Gen 5** is now standard on most high‑end consumer motherboards (e.g., X670E, Z790). It provides up to **63 GB/s** raw bandwidth on a x16 slot, which is crucial for NVMe SSDs and GPU‑to‑CPU data transfers.

## DDR5 Memory Bandwidth Calculations

DDR5‑5600 (28 GT/s) transfers 28 Gb/s per pin. With a 64‑bit (8‑byte) channel:
```
Bandwidth = 28 GT/s × 8 bits/byte × 2 (double‑pumped) = 56 GB/s per channel
```
Dual‑channel → **112 GB/s** (rounded to 89.6 GB/s due to actual timings). DDR5‑6400 yields ~102 GB/s dual‑channel.

## NVMe SSD Bandwidth (2025)

| Interface | Max Theoretical (GB/s) | Real‑World Typical (GB/s) |
|-----------|------------------------|---------------------------|
| PCIe 4 x4 | 7.9 | 5.5‑6.5 |
| PCIe 5 x4 | 15.8 | 10‑12 |
| PCIe 5 x2 (M.2) | 7.9 | 5‑6 |
| PCIe 4 x2 | 3.9 | 2‑3 |

> High‑end consumer SSDs (e.g., Samsung 990 Pro, WD Black SN850X) now saturate **≈12 GB/s** on PCIe 5 x4.

---

### When to Prioritize Which Component for LLM Inference
1. **GPU VRAM** – Most limiting factor for model size.
2. **CPU Memory Bandwidth** – Determines token‑generation speed when GPU is saturated or off‑loading.
3. **PCIe Gen 5** – Essential for fast SSD‑to‑GPU model loading and large‑context swaps.
4. **Unified Memory (Apple Silicon)** – Provides GPU‑like bandwidth without PCIe bottlenecks.

---

**Sources**
- AMD & Intel product briefings (2024‑2025)
- Apple Silicon Technical Overview (2025)
- Raspberry Pi Foundation specifications (2025)
- Community benchmarks (`research/benchmarks/real_world.md`)
- PCI‑SIG Gen 5 spec sheet (2024)
