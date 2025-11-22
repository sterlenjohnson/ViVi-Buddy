# ViVi Buddy

**Video RAM Visualizer** - A modern, interactive VRAM calculator for LLM inference and AI model deployment.

![ViVi Buddy Screenshot](screenshot.png)

## 🌟 Features

### 📊 Accurate VRAM Calculations
- **Model Weights**: Calculates memory needed based on model size and  precision (FP16, INT8, various GGUF quantizations)
- **KV Cache**: Accounts for key-value cache based on context length and batch size
- **Activations**: Estimates activation memory during inference
- **Layer Distribution**: Smart GPU/CPU layer split with real-time optimization

### 🎯 Two Modes for Every User
- **Basic Mode**: Simplified interface for quick estimates - just select your hardware and model
- **Advanced Mode**: Full control over GPU vendor, RAM specs, storage type, and advanced configurations

### 🔧 Hardware Support
- **Discrete GPUs**: NVIDIA, AMD, Intel Arc support with multi-GPU configurations
- **Apple Silicon**: Native support for unified memory (M1/M2/M3 Macs)
- **Mismatched GPUs**: Configure different GPU models in the same system

### 💾 Memory Size Sliders
- **Interactive Sliders**: Adjust VRAM and KV cache sizes with visual feedback
- **Reverse Calculation**: Change memory targets to see required model parameters
- **Real-time Updates**: See memory impact instantly as you adjust parameters

### 🎨 Modern UI/UX
- **Dark Theme**: Easy on the eyes with glassmorphism effects
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Tooltips**: Hover over any technical term for helpful explanations
- **Hardware Presets**: Quick-select common GPU configurations (RTX 4090, Mac Studio, etc.)

### 💡 Smart Features
- **Save/Load Configurations**: Save your hardware setups for later

- **CLI Export**: Generate llama.cpp commands for your configuration
- **Performance Estimates**: Get relative performance multipliers
- **Constraint Enforcement**: Auto-optimize layer splits to fit available memory

## 🚀 Quick Start

### Online Version
Visit [https://your-deployment-url.com](https://your-deployment-url.com) to use ViVi Buddy instantly - no installation required!

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/vivi-buddy.git
cd vivi-buddy

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 📖 Usage Examples

### Example 1: Running Llama 3.1 8B on RTX 4090
1. Click "RTX 4090 24GB" hardware preset
2. Enter model: 8B parameters, q4_k_m precision
3. Set context length: 4096
4. Results show: ~5GB VRAM needed, can run fully on GPU

### Example 2: Llama 3.1 70B on Mac Studio Ultra
1. Toggle to "Unified Memory" mode
2. Set 192GB unified memory
3. Enter model: 70B parameters, q4_k_m precision
4. Context: 8192
5. Results show: ~38GB needed, plenty of headroom

### Example 3: Mixtral 8x7B with Limited VRAM
1. Set hardware: RTX 3060 12GB
2. Enter model: 56B parameters (effective), q4_k_m
3. Enable "Hybrid" mode
4. Adjust GPU layers slider to fit within 12GB
5. See CPU layer count and performance impact

## 🛠️ Technology Stack

- **React 18**: Modern UI framework
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icon library
- **Create React App**: Zero-config build setup

## 📝 Documentation

### Understanding the Results

- **Weights (GPU)**: Model parameters loaded on GPU
- **KV Cache**: Memory for conversation history
- **Activations**: Temporary memory during token generation
- **CPU Layers**: Layers offloaded to system RAM
- **Performance Multiplier**: Relative inference speed estimate

### Precision Types

- `fp16`: Full half-precision, highest quality
- `q8_0`: 8-bit quantization, minimal quality loss
- `q4_k_m`: 4-bit with k-quants, good balance
- `q2_k`: 2-bit, most compressed, some quality loss

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the LLM community's need for accurate VRAM estimation
- Built with love for AI enthusiasts and developers
- Special thanks to all contributors and users

## 📬 Contact

- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/vivi-buddy/issues)
- Discussions: [Join the community](https://github.com/yourusername/vivi-buddy/discussions)

---

Made with ❤️ for the AI community
# ViVi-Buddy
