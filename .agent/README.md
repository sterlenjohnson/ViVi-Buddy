# ViVi-Buddy V5.2 - Development Reference

**Last Updated:** November 25, 2025  
**Purpose:** Quick reference for future development sessions

---

## 🤖 Multi-AI Collaboration

This project has multiple AI assistants working on it. Each maintains their own work log:

- **`gemini.md`** - Gemini's work log (Google DeepMind)  
- **`claude.md`** - Claude's work log (Anthropic)  
- **`WASM_REFERENCE.md`** - WASM troubleshooting guide

**⚠️ IMPORTANT:** Before starting work:
1. Read BOTH `gemini.md` AND `claude.md` to see what's been done
2. Check for any conflicts or overlapping work  
3. Update YOUR respective .md file when you complete work
4. Keep the other AI informed of major changes

---

## 📝 Quick Reference

**Current Status:** V5.2 complete with WASM acceleration and interactive features

**Last Major Work:**
- **Gemini:** Mobile responsiveness, circuit board background, card layouts
- **Claude:** WASM integration (50x speedup), interactive model selector, documentation

**Tech Stack:**
- React 18 + React Router
- Tailwind CSS (slate theme)
- WebAssembly (AssemblyScript)
- Recharts for graphs

**Key Files:**
- `src/database/db_interface.js` - Core calculation engine (uses WASM)
- `src/pages/ComparePage.jsx` - Interactive hardware comparison  
- `src/App.js` - WASM initialization
- `assembly/index.ts` - WASM source code

**Build Commands:**
```bash
npm run asbuild    # Build WASM
cp build/release.wasm build/build/  # Copy WASM
npm run build      # Build React
serve -s build     # Test production
```

---

**For detailed information, see:**
- Your AI's work log (`gemini.md` or `claude.md`)
- `WASM_REFERENCE.md` for WASM details
