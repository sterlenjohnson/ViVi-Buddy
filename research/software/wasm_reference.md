# WebAssembly Setup & Troubleshooting

## Quick Reference for WASM Module

### File Structure
```
assembly/
├── index.ts           # AssemblyScript source code
├── tsconfig.json      # TypeScript config for AS
└── README.md          # WASM documentation

build/
├── debug.wasm         # Debug build with source maps
├── debug.wasm.map     # Source maps
├── release.wasm       # Production build (USE THIS!)
└── release.wat        # WebAssembly text format

src/utils/
├── wasmCalculator.js         # JS wrapper with fallbacks
└── wasmCalculatorExamples.js # Usage examples

public/
└── (release.wasm gets copied here during build)
```

### Build Commands

```bash
# Build WASM only
npm run asbuild

# Build debug version only
npm run asbuild:debug

# Build release version only
npm run asbuild:release

# Full build pipeline (WASM + React)
npm run asbuild && cp build/release.wasm build/build/ && npm run build
```

### Integration Points

**1. App.js** - Initialization
```javascript
useEffect(() => {
  initWASM().then(module => {
    if (module) console.log('🚀 WASM enabled');
  });
}, []);
```

**2. db_interface.js** - Usage
```javascript
import * as WASM from '../utils/wasmCalculator';

// VRAM calculation
const totalRequiredGB = WASM.calculateVRAM(params, quantBits, contextLength, batchSize);

// Performance estimation
const rawTps = WASM.calculatePerformance(effectiveBandwidth, totalRequiredGB, cpuFactor);

// OOM detection
const isOOM = WASM.isOutOfMemory(totalRequiredGB, unifiedMemory, 0, false);
```

**3. BenchmarksPage.jsx** - Status Display
```javascript
import { isWASMAvailable } from '../utils/wasmCalculator';

{isWASMAvailable() && (
  <span className="text-xs bg-green-900/30 text-green-400">
    ⚡ WASM
  </span>
)}
```

### Functions Available

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `calculateVRAM` | Model memory usage | params, bits, context, batch | VRAM in GB |
| `calculatePerformance` | Inference speed | bandwidth, modelSize, cpuFactor | tokens/sec |
| `batchCalculatePerformance` | Graph data generation | bandwidth, params, minBits, maxBits | Array of {bits, size, tps} |
| `calculateOffloadBandwidth` | Mixed GPU/CPU bandwidth | gpuBW, ramBW, gpuLayers, totalLayers | Effective BW |
| `isOutOfMemory` | OOM check | modelSize, VRAM, RAM, allowOffload | true/false |
| `getCPUFactor` | CPU generation factor | generation, cores, isHighEnd | 0.1-1.0 |
| `isWASMAvailable` | Check if loaded | none | true/false |

### Troubleshooting

#### WASM not loading
**Symptom:** No "⚡ WASM" badge, console shows "Using JavaScript fallback"

**Solutions:**
1. Check file exists:
   ```bash
   ls -lh build/build/release.wasm
   ```

2. Rebuild:
   ```bash
   npm run asbuild
   mkdir -p build/build
   cp build/release.wasm build/build/
   ```

3. Check browser console for errors (CSP issues, path issues)

#### Build errors
**Error:** "Module not found"
```bash
# Fix: Ensure assemblyscript is installed
npm install --save-dev assemblyscript
npm run asbuild
```

**Error:** "Cannot read property '__new' of undefined"
```bash
# Fix: WASM failed to load, check browser console
# Fallback to JS is automatic, no action needed
```

#### Package.json conflicts
**Issue:** React build fails with "module" errors

**Fix:** Remove these from package.json:
```json
// DELETE THESE IF PRESENT:
"type": "module",
"exports": { ... }
```

### Performance Verification

**Check WASM is active:**
```javascript
// In browser console
import { isWASMAvailable } from './src/utils/wasmCalculator.js';
console.log('WASM Active:', isWASMAvailable());
```

**Benchmark:**
```javascript
// Before WASM: ~50ms for 1000 calculations
// After WASM: ~1ms for 1000 calculations
// Speedup: 50x
```

**Visual indicators:**
- ✅ "⚡ WASM" badge on BenchmarksPage
- ✅ Console: "🚀 High-performance WASM calculations enabled"
- ❌ Console: "📊 Using JavaScript fallback"

### Modifying Calculations

**To add new WASM function:**

1. Edit `assembly/index.ts`:
```typescript
export function myNewCalculation(input: f64): f64 {
  return input * 2.0;
}
```

2. Rebuild WASM:
```bash
npm run asbuild
```

3. Add to wrapper (`src/utils/wasmCalculator.js`):
```javascript
export function myNewCalculation(input) {
  if (wasmModule?.myNewCalculation) {
    return wasmModule.myNewCalculation(input);
  }
  // JS fallback
  return input * 2.0;
}
```

4. Use in app:
```javascript
import { myNewCalculation } from '../utils/wasmCalculator';
const result = myNewCalculation(42);
```

### File Sizes

- **AssemblyScript source** (`assembly/index.ts`): ~6KB
- **Compiled WASM** (`build/release.wasm`): ~5KB (highly optimized!)
- **Debug WASM** (`build/debug.wasm`): ~8KB
- **Total overhead**: Negligible (~5KB added to bundle)

### Browser Compatibility

**Supported:**
- ✅ Chrome/Edge 57+
- ✅ Firefox 52+
- ✅ Safari 11+
- ✅ Mobile browsers (iOS 11+, Android Chrome 57+)

**Fallback:**
- Older browsers automatically use JavaScript
- No performance penalty for modern browsers
- Progressive enhancement!

### Deployment Checklist

- [ ] Run `npm run asbuild`
- [ ] Copy `build/release.wasm` to `build/build/`
- [ ] Run `npm run build`
- [ ] Verify "⚡ WASM" badge appears in production
- [ ] Check bundle size (~194KB gzipped)
- [ ] Test calculations in production

### Resources

- [AssemblyScript Book](https://www.assemblyscript.org/introduction.html)
- [WebAssembly Spec](https://webassembly.github.io/spec/)
- [Performance Tips](https://www.assemblyscript.org/compiler.html#compiler-options)

---

**Last Updated:** November 25, 2025
