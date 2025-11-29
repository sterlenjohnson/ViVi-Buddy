// @ts-nocheck
// @ts-nocheck
import { precisionBits } from './constants';

/**
 * Calculate quality score based on model settings
 * Returns a 0-100 score where 100 is maximum quality
 */
export const calculateQualityScore = (model) => {
    let score = 100;

    // Quantization impact (research-based)
    const quantizationPenalty = {
        'fp32': 0,     // Perfect quality
        'fp16': 0,     // Virtually no loss
        'bf16': 0.5,   // Minimal loss
        'q8_0': 1,     // ~1% perplexity increase
        'int8': 1,
        'q6_k': 3,     // ~3% perplexity increase
        'q5_k_m': 5,   // ~5% perplexity increase
        'q4_k_m': 8,   // ~8-10% perplexity increase
        'q4_0': 10,
        'int4': 10,
        'q3_k_m': 18,  // ~18-20% perplexity increase
        'q2_k': 35     // ~35-40% perplexity increase (significant degradation)
    };

    score -= quantizationPenalty[model.precision] || 10;

    // KV Cache precision impact
    if (model.kvCachePrecision === 'int8') {
        score -= 2; // ~2% quality impact (minimal)
    }

    // Flash Attention impact (negligible to none)
    if (model.flashAttention) {
        score -= 0.5; // Virtually no quality loss, mostly implementation dependent
    }

    // Context length impact (longer context can reduce quality slightly)
    if (model.contextLength > 32000) {
        score -= 2; // Long context can affect coherence
    } else if (model.contextLength > 64000) {
        score -= 5; // Very long context more noticeable
    }

    // Ensure score stays in valid range
    return Math.max(0, Math.min(100, score));
};

/**
 * Get quality tier description
 */
export const getQualityTier = (score) => {
    if (score >= 98) return { tier: 'Perfect', color: 'emerald', desc: 'Near-zero quality loss' };
    if (score >= 95) return { tier: 'Excellent', color: 'green', desc: 'Imperceptible quality loss' };
    if (score >= 90) return { tier: 'Very Good', color: 'blue', desc: 'Minimal quality loss (<5%)' };
    if (score >= 85) return { tier: 'Good', color: 'cyan', desc: 'Minor quality loss (5-10%)' };
    if (score >= 75) return { tier: 'Acceptable', color: 'yellow', desc: 'Noticeable loss (10-20%)' };
    if (score >= 60) return { tier: 'Fair', color: 'orange', desc: 'Moderate loss (20-35%)' };
    return { tier: 'Poor', color: 'red', desc: 'Significant quality degradation (>35%)' };
};

/**
 * Calculate perplexity increase estimate
 * Lower is better (baseline fp16 = 0%)
 */
export const estimatePerplexityIncrease = (model) => {
    const perplexityMap = {
        'fp32': 0,
        'fp16': 0,
        'bf16': 0.2,
        'q8_0': 0.5,
        'int8': 0.8,
        'q6_k': 2.5,
        'q5_k_m': 4.5,
        'q4_k_m': 8.0,
        'q4_0': 10.0,
        'int4': 10.0,
        'q3_k_m': 18.0,
        'q2_k': 38.0
    };

    let increase = perplexityMap[model.precision] || 10;

    // KV cache adds minimal impact
    if (model.kvCachePrecision === 'int8') {
        increase += 0.5;
    }

    return increase.toFixed(1);
};

export default {
    calculateQualityScore,
    getQualityTier,
    estimatePerplexityIncrease
};
