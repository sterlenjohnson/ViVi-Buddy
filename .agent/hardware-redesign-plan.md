# Hardware Page Redesign Plan

## User Requirements:
1. Hardware menu item first in navigation ✅ DONE
2. Move ALL hardware config OUT of Calculator and Benchmarks pages
3. Keep presets in Hardware page
4. New selection flow:
   - Step 1: OS selection (Windows/Linux/macOS)
   - Step 2: CPU/GPU/Both toggle
   - Step 3: Brand dropdown (based on CPU/GPU selection)
   - Step 4: Hardware selection from brand
5. Add: RAM configuration
6. Add: Storage (SSD) configuration
7. Add: CPU selection (for CPU or Both modes)

## Implementation Plan:

### Phase 1: Redesign Hardware Page
- [x] Move Hardware to first in nav
- [ ] Add OS selection (Windows, Linux, macOS)
- [ ] Add CPU/GPU/Both toggle
- [ ] Add Brand dropdown (NVIDIA, AMD, Intel for GPU; AMD, Intel for CPU)
- [ ] Filter hardware based on selections
- [ ] Add RAM type/speed configuration
- [ ] Add Storage type configuration
- [ ] Add CPU selection dropdownfor offloading/CPU mode
- [ ] Keep QuickPresets for common configs
- [ ] Keep Auto-Detect feature

### Phase 2: Remove from Calculator (V5/index.tsx)
- [ ] Remove HardwareConfig component
- [ ] Remove OS selection
- [ ] Remove chipType selection  
- [ ] Remove RAM type/speed
- [ ] Remove storage type
- [ ] Just show current hardware from context (read-only display)
- [ ] Add "Configure Hardware" button that links to /hardware

### Phase 3: Remove from Benchmarks
- [ ] Remove hardware selection dropdown
- [ ] Remove GPU count input
- [ ] Remove NVLink toggle
- [ ] Remove System RAM input   
- [ ] Remove CPU selection
- [ ] Remove RAM type/speed
- [ ] Just show current hardware from context (read-only display)
- [ ] Add "Change Hardware" button that links to /hardware
- [ ] Keep model/quality/context size controls

### Phase 4: Update Context
- [ ] Add OS to HardwareContext
- [ ] Add RAM type/speed to HardwareContext
- [ ] Add Storage type to HardwareContext
- [ ] Add selected CPU ID to HardwareContext

## New Hardware Page Flow:

```
┌─────────────────────────────────────────┐
│  1. Operating System                    │
│  ○ Windows  ○ Linux  ○ macOS           │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  2. Hardware Type                        │
│  ○ GPU Only  ○ CPU Only  ○ GPU + CPU    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  3. Brand (if GPU selected)             │
│  Dropdown: NVIDIA │ AMD │ Intel         │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  4. Select Hardware                     │
│  [Filteredlist based on above]         │
│  - RTX 4090 24GB                        │
│  - RTX 3090 24GB                        │
│  - ...                                  │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  5. System Configuration                │
│  GPU Count: [1] [✓] NVLink             │
│  System RAM: [64] GB                    │
│  RAM Type: DDR5 │ Speed: 6400 MT/s     │
│  Storage: NVMe Gen4                     │
│  CPU (for offload): Ryzen 9 7950X      │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Quick Presets (optional shortcuts)    │
│  [Budget] [Gaming] [Pro] [Workstation] │
└─────────────────────────────────────────┘
```

## Files to Modify:
1. `src/pages/HardwareConfigPage.tsx` - Complete redesign
2. `src/V5/index.tsx` - Remove hardware config, add read-only display
3. `src/pages/BenchmarksPage.tsx` - Remove hardware config, add read-only display
4. `src/contexts/HardwareContext.tsx` - Add OS, RAM, Storage fields
