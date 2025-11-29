# Calculator ↔ Benchmarks Page Integration

## Summary
Fixed the hardware preset synchronization between the VRAM Calculator (V5) and Benchmarks pages to create a seamless, tightly integrated experience.

## Problems Solved

### 1. **Calculator Preset Hardware Broken**
   - **Issue**: Hardware presets in the calculator were using `setTotalVRAM()` and `setNumGPUs()` instead of properly constructing the `gpuList` array.
   - **Fix**: Updated `applyHardwarePreset()` to create proper `GpuItem` objects with correct names, VRAM, and brand information.

### 2. **Benchmarks Preset Hardware Empty**
   - **Issue**: The Benchmarks page had no way to know what hardware was selected in the Calculator.
   - **Fix**: Added `presetToHardwareId` mapping and `setSelectedHardwareId()` calls in the Calculator to sync hardware selection to the global `HardwareContext`.

### 3. **Tight Integration**
   - **Issue**: The two pages operated independently with no state sharing.
   - **Fix**: Implemented bidirectional synchronization using:
     - `HardwareContext` for global state
     - `localStorage` (`vivi_calculator_autosave`) for detailed configuration
     - Automatic hardware ID mapping between preset values and database IDs

## How It Works

### Calculator → Benchmarks Flow

1. **User selects a preset** in Calculator (e.g., "RTX 4090 24GB")
   ```tsx
   applyHardwarePreset('rtx4090')
   ```

2. **Calculator updates**:
   - Local state: `gpuList`, `systemRAMAmount`, etc.
   - Global context: `selectedHardwareId` (set to 'rtx_4090')
   - `localStorage`: Full configuration autosaved

3. **User navigates to Benchmarks** (`/benchmarks`)

4. **Benchmarks loads**:
   - Reads `selectedHardwareId` from `HardwareContext` → shows RTX 4090
   - Can also import full config from `localStorage.vivi_calculator_autosave`

### Benchmarks → Calculator Flow

1. **User clicks "Benchmark This"** on Compare page or changes hardware in Benchmarks
   
2. **Benchmarks updates**:
   - Global context: `selectedHardwareId`, `gpuCount`, `systemRamSize`
   - These are read by Calculator when user returns

## Preset ID Mapping

The Calculator uses short preset values (e.g., `rtx4090`) which are mapped to database IDs (e.g., `rtx_4090`):

```tsx
const presetToHardwareId: Record<string, string> = {
    'rtx5090': 'rtx_5090',
    'rtx5080': 'rtx_5080',
    'rtx4090': 'rtx_4090',
    'rtx3090': 'rtx_3090',
    'rtx4070ti': 'rtx_4070_ti',
    'rtx4060ti': 'rtx_4060_ti_16gb',
    'rtx3060': 'rtx_3060_12gb',
    'rx7900xtx': 'rx_7900xtx',
    'rx6800xt': 'rx_6800xt',
    'arca770': 'arc_a770',
    'arca750': 'arc_a750',
};
```

## State Synchronization Points

### From Calculator (`V5/index.tsx`)
```tsx
useEffect(() => {
    // Sync to HardwareContext
    setSystemRamSize(systemRAMAmount);
    setGpuCount(gpuList.length);
}, [gpuList, systemRAMAmount, setSystemRamSize, setGpuCount]);
```

### From Benchmarks (`BenchmarksPage.tsx`)
```tsx
useEffect(() => {
    // Auto-import from Calculator
    const saved = localStorage.getItem('vivi_calculator_autosave');
    if (saved) {
        const config = JSON.parse(saved);
        // Import GPU, model, RAM settings...
    }
}, [customHardware]);
```

## Testing Checklist

- [x] Calculator: Select a preset → GPU list populates correctly
- [x] Calculator: Navigate to Benchmarks → Same hardware selected
- [x] Benchmarks: Change hardware → Context updated
- [x] Benchmarks: Navigate back to Calculator → Settings persist
- [x] QuickPresets: Apply preset → Benchmarks updates immediately
- [x] Build succeeds without errors

## Future Enhancements

1. **Real-time sync**: Use a "sync" button or automatic sync on navigation
2. **Model sync**: Integrate `ModelContext` for model selection persistence
3. **Custom hardware**: Better handling of user-created custom hardware items
4. **Preset preloading**: Load preset into Calculator from Benchmarks page
