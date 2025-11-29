import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HardwareProvider } from './contexts/HardwareContext';
import { ModelProvider } from './contexts/ModelContext';
import SharedLayout from './components/SharedLayout';
import VRAMVisualizer from './V5';
import BenchmarksPage from './pages/BenchmarksPage';
import LearnPage from './pages/LearnPage';
import ComparePage from './pages/ComparePage';
import HardwareConfigPage from './pages/HardwareConfigPage';
import { initWASM } from './utils/wasmCalculator';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize WASM module for high-performance calculations
    initWASM().then(module => {
      if (module) {
        console.log('🚀 High-performance WASM calculations enabled');
      } else {
        console.log('📊 Using JavaScript fallback for calculations');
      }
    });
  }, []);

  return (
    <Router>
      <HardwareProvider>
        <ModelProvider>
          <SharedLayout>
            <Routes>
              <Route path="/" element={<VRAMVisualizer />} />
              <Route path="/benchmarks" element={<BenchmarksPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/hardware" element={<HardwareConfigPage />} />
            </Routes>
          </SharedLayout>
        </ModelProvider>
      </HardwareProvider>
    </Router>
  );
}

export default App;
