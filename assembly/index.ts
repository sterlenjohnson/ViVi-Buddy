// ViVi-Buddy Performance Calculations - WebAssembly Module
// Fast, efficient calculations for LLM inference performance estimation

/**
 * Calculate VRAM usage for a model
 * @param paramCount - Model parameters in billions
 * @param bitsPerWeight - Quantization level (2-16)
 * @param contextLength - Context window size
 * @param batchSize - Batch size
 * @returns VRAM usage in GB
 */
export function calculateVRAM(
  paramCount: f64,
  bitsPerWeight: f64,
  contextLength: i32,
  batchSize: i32
): f64 {
  // Model weights in GB
  const modelSize = (paramCount * bitsPerWeight) / 8.0;

  // KV cache estimation (approximate)
  // Formula: 2 * layers * hiddenSize * contextLength * batchSize * bytes
  // Simplified: ~0.002 GB per billion params per 1k context
  const kvCache = (paramCount * f64(contextLength) * f64(batchSize) * 0.000002);

  // Activations (small, ~5% of model size)
  const activations = modelSize * 0.05;

  return modelSize + kvCache + activations;
}

/**
 * Calculate inference speed (tokens/sec)
 * @param bandwidth - Memory bandwidth in GB/s
 * @param modelSizeGB - Model size in GB
 * @param cpuFactor - CPU generation performance factor (0-1)
 * @returns Estimated tokens per second
 */
export function calculatePerformance(
  bandwidth: f64,
  modelSizeGB: f64,
  cpuFactor: f64
): f64 {
  if (modelSizeGB <= 0.0) return 0.0;

  // Base calculation: bandwidth / model size
  let tps = bandwidth / modelSizeGB;

  // Apply CPU factor if using offloading
  if (cpuFactor < 1.0) {
    tps = tps * cpuFactor;
  }

  // Clamp to reasonable range
  if (tps > 1000.0) tps = 1000.0;
  if (tps < 0.0) tps = 0.0;

  return tps;
}

/**
 * Batch calculate performance for multiple quantization levels
 * @param bandwidth - Memory bandwidth in GB/s
 * @param paramCount - Model parameters in billions
 * @param minBits - Minimum bits (2)
 * @param maxBits - Maximum bits (16)
 * @param step - Step size (0.5)
 * @param results - Output array (pre-allocated)
 * @returns Number of results
 */
export function batchCalculatePerformance(
  bandwidth: f64,
  paramCount: f64,
  minBits: f64,
  maxBits: f64,
  step: f64,
  results: Float64Array
): i32 {
  let index = 0;
  let bits = minBits;

  while (bits <= maxBits) {
    const modelSize = (paramCount * bits) / 8.0;
    const tps = calculatePerformance(bandwidth, modelSize, 1.0);

    // Store: [bits, modelSize, tps]
    results[index * 3] = bits;
    results[index * 3 + 1] = modelSize;
    results[index * 3 + 2] = tps;

    bits += step;
    index++;
  }

  return index;
}

/**
 * Calculate effective bandwidth with offloading
 * @param gpuBandwidth - GPU memory bandwidth
 * @param ramBandwidth - System RAM bandwidth  
 * @param gpuLayers - Number of layers on GPU
 * @param totalLayers - Total model layers
 * @returns Effective bandwidth
 */
export function calculateOffloadBandwidth(
  gpuBandwidth: f64,
  ramBandwidth: f64,
  gpuLayers: i32,
  totalLayers: i32
): f64 {
  if (totalLayers <= 0) return gpuBandwidth;
  if (gpuLayers >= totalLayers) return gpuBandwidth;
  if (gpuLayers <= 0) return ramBandwidth;

  const gpuRatio = f64(gpuLayers) / f64(totalLayers);
  const ramRatio = 1.0 - gpuRatio;

  // Harmonic mean (bottleneck model)
  const effectiveBW = 1.0 / (
    (gpuRatio / gpuBandwidth) + (ramRatio / ramBandwidth)
  );

  return effectiveBW;
}

/**
 * Determine if configuration is out of memory
 * @param modelSizeGB - Model size in GB
 * @param vramGB - Available VRAM in GB
 * @param systemRAMGB - Available system RAM in GB
 * @param allowOffload - Whether offloading is allowed
 * @returns 1 if OOM, 0 otherwise
 */
export function isOutOfMemory(
  modelSizeGB: f64,
  vramGB: f64,
  systemRAMGB: f64,
  allowOffload: bool
): i32 {
  if (modelSizeGB <= vramGB) return 0;
  if (allowOffload && modelSizeGB <= (vramGB + systemRAMGB)) return 0;
  return 1;
}

/**
 * Calculate CPU generation performance factor
 * @param generation - CPU generation (1-5 for Zen, 10-14 for Intel)
 * @param coreCount - Number of cores
 * @param isHighEnd - Whether it's a high-end SKU
 * @returns Performance factor (0.1 - 1.0)
 */
export function getCPUFactor(
  generation: i32,
  coreCount: i32,
  isHighEnd: bool
): f64 {
  let baseFactor = 0.15; // Very old/slow CPUs

  // AMD Zen factorsgit
  if (generation >= 1 && generation <= 5) {
    if (generation === 5) baseFactor = 0.45;
    else if (generation === 4) baseFactor = 0.40;
    else if (generation === 3) baseFactor = 0.35;
    else if (generation === 2) baseFactor = 0.28;
    else baseFactor = 0.22;
  }
  // Intel generations (simplified)
  else if (generation >= 10 && generation <= 15) {
    if (generation >= 13) baseFactor = 0.42;
    else if (generation >= 12) baseFactor = 0.38;
    else baseFactor = 0.30;
  }

  // Core count bonus (diminishing returns)
  let coreBonus = 0.0;
  if (coreCount >= 16) coreBonus = 0.10;
  else if (coreCount >= 12) coreBonus = 0.07;
  else if (coreCount >= 8) coreBonus = 0.05;
  else if (coreCount >= 6) coreBonus = 0.03;

  // High-end SKU bonus
  const skuBonus = isHighEnd ? 0.05 : 0.0;

  let factor = baseFactor + coreBonus + skuBonus;

  // Clamp
  if (factor > 1.0) factor = 1.0;
  if (factor < 0.1) factor = 0.1;

  return factor;
}
