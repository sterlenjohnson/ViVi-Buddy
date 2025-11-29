import React, { useState, ChangeEvent, FormEvent } from 'react';
import { HardwareItem } from '../database/db_interface';
import { useHardware } from '../contexts/HardwareContext';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface CustomHardwareFormProps {
    onAdd: (hardware: HardwareItem) => void;
    onClose?: () => void;
}

interface FormState {
    name: string;
    architecture: string;
    vram_gb: number;
    bandwidth_gbps: number;
    price_usd: number;
    cuda_cores: number;
    cores: number;
    threads: number;
    boost_clock_mhz: number;
    tdp_watts: number;
    memory_bus_width_bits: number;
    // System specs for custom build
    system_ram_gb: number;
    system_ram_mt: number;
    storage_type: string;
    storage_interface: string;
}

const CustomHardwareForm: React.FC<CustomHardwareFormProps> = ({ onAdd, onClose }) => {
    const { saveCustomHardware } = useHardware();
    const [type, setType] = useState<'consumer' | 'cpu'>('consumer'); // consumer (GPU), cpu
    const [brand, setBrand] = useState<string>('NVIDIA');
    const [errors, setErrors] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [form, setForm] = useState<FormState>({
        name: '',
        architecture: '',
        vram_gb: 24,
        bandwidth_gbps: 900,
        price_usd: 1000,
        cuda_cores: 0,
        cores: 0,
        threads: 0,
        boost_clock_mhz: 0,
        tdp_watts: 0,
        memory_bus_width_bits: 0,
        system_ram_gb: 32,
        system_ram_mt: 6000,
        storage_type: 'nvme',
        storage_interface: 'pcie4'
    });

    const ARCHITECTURES: Record<string, string[] | { gpu: string[], cpu: string[] }> = {
        NVIDIA: ['Blackwell', 'Ada Lovelace', 'Ampere', 'Turing', 'Pascal', 'Maxwell'],
        AMD: {
            gpu: ['RDNA 4', 'RDNA 3', 'RDNA 2', 'RDNA', 'GCN'],
            cpu: ['Zen 5', 'Zen 4', 'Zen 3', 'Zen 2', 'Zen', 'Zen+']
        },
        Intel: {
            gpu: ['Battlemage', 'Alchemist', 'Xe'],
            cpu: ['Arrow Lake', 'Raptor Lake Refresh', 'Raptor Lake', 'Alder Lake', 'Rocket Lake', 'Comet Lake']
        },
        Apple: ['Apple Silicon (M3)', 'Apple Silicon (M2)', 'Apple Silicon (M1)']
    };

    const getArchitectureOptions = (): string[] => {
        if (brand === 'NVIDIA') return ARCHITECTURES.NVIDIA as string[];
        if (brand === 'Apple') return ARCHITECTURES.Apple as string[];

        const brandArchs = ARCHITECTURES[brand];
        if (brandArchs && typeof brandArchs === 'object' && 'gpu' in brandArchs) {
            return type === 'consumer' ? brandArchs.gpu : brandArchs.cpu;
        }
        return [];
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Helper for number inputs: allow empty string (clearable)
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '') {
            setForm(prev => ({ ...prev, [name]: 0 })); // Temporarily 0 for empty
        } else {
            setForm(prev => ({ ...prev, [name]: Number(value) }));
        }
    };

    // Helper for number inputs on blur: default to 1 if empty/invalid
    const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '' || Number(value) < 1) {
            setForm(prev => ({ ...prev, [name]: 1 }));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setErrors([]);
        setSuccessMessage('');

        const newHw: Partial<HardwareItem> = {
            ...form,
            name: form.name.trim(),
            type: type === 'cpu' ? 'cpu' : 'gpu',
            brand,
            category: 'Custom',
            cpu_cores: type === 'cpu' ? form.cores : undefined,
            cpu_threads: type === 'cpu' ? form.threads : undefined,
            ram_type: 'ddr5',
            ram_speed: form.system_ram_mt,
            storage_type: form.storage_type as any,
            benchmarks: {}
        };

        const result = saveCustomHardware(newHw);

        if (result.success && result.item) {
            setSuccessMessage(`✓ "${result.item.name}" saved successfully!`);
            onAdd(result.item);

            // Reset form after short delay
            setTimeout(() => {
                setForm({
                    name: '',
                    architecture: '',
                    vram_gb: 24,
                    bandwidth_gbps: 900,
                    price_usd: 1000,
                    cuda_cores: 0,
                    cores: 0,
                    threads: 0,
                    boost_clock_mhz: 0,
                    tdp_watts: 0,
                    memory_bus_width_bits: 0,
                    system_ram_gb: 32,
                    system_ram_mt: 6000,
                    storage_type: 'nvme',
                    storage_interface: 'pcie4'
                });
                setSuccessMessage('');
                if (onClose) onClose();
            }, 1500);
        } else {
            setErrors(result.errors || ['Failed to save custom hardware']);
        }
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Add Custom Hardware</h3>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Close form"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-300">Please fix the following errors:</p>
                            <ul className="mt-2 space-y-1">
                                {errors.map((error, idx) => (
                                    <li key={idx} className="text-xs text-red-200">• {error}</li>
                                ))}
                            </ul>
                        </div>
                        <button
                            onClick={() => setErrors([])}
                            className="text-red-400 hover:text-red-300"
                            aria-label="Dismiss errors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <p className="text-sm text-green-200 font-medium">{successMessage}</p>
                    </div>
                </div>
            )}

            <div className="flex gap-2 mb-4">
                <button
                    type="button"
                    onClick={() => { setType('consumer'); setBrand('NVIDIA'); }}
                    className={`px-3 py-1 rounded text-sm ${type === 'consumer' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                    GPU
                </button>
                <button
                    type="button"
                    onClick={() => { setType('cpu'); setBrand('AMD'); }}
                    className={`px-3 py-1 rounded text-sm ${type === 'cpu' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                    CPU
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Brand</label>
                    <div className="flex gap-2">
                        {type === 'consumer' ? (
                            <>
                                {['NVIDIA', 'AMD', 'Intel'].map(b => (
                                    <button
                                        key={b}
                                        type="button"
                                        onClick={() => setBrand(b)}
                                        className={`px-3 py-1 rounded text-xs ${brand === b ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </>
                        ) : (
                            <>
                                {['AMD', 'Intel', 'Apple'].map(b => (
                                    <button
                                        key={b}
                                        type="button"
                                        onClick={() => setBrand(b)}
                                        className={`px-3 py-1 rounded text-xs ${brand === b ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Model Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. RTX 5090"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1">Architecture</label>
                    <select
                        name="architecture"
                        value={form.architecture}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                    >
                        <option value="">Select...</option>
                        {getArchitectureOptions().map(arch => (
                            <option key={arch} value={arch}>{arch}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1">Price ($)</label>
                    <input
                        type="number"
                        name="price_usd"
                        value={form.price_usd || ''}
                        onChange={handleNumberChange}
                        onBlur={handleNumberBlur}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                    />
                </div>

                {type === 'consumer' ? (
                    <>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">VRAM (GB)</label>
                            <input
                                type="number"
                                name="vram_gb"
                                value={form.vram_gb || ''}
                                onChange={handleNumberChange}
                                onBlur={handleNumberBlur}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Bandwidth (GB/s)</label>
                            <input
                                type="number"
                                name="bandwidth_gbps"
                                value={form.bandwidth_gbps || ''}
                                onChange={handleNumberChange}
                                onBlur={handleNumberBlur}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">CUDA/Stream Cores</label>
                            <input
                                type="number"
                                name="cuda_cores"
                                value={form.cuda_cores || ''}
                                onChange={handleNumberChange}
                                onBlur={handleNumberBlur}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Bus Width (bits)</label>
                            <input
                                type="number"
                                name="memory_bus_width_bits"
                                value={form.memory_bus_width_bits || ''}
                                onChange={handleNumberChange}
                                onBlur={handleNumberBlur}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Cores</label>
                            <input
                                type="number"
                                name="cores"
                                value={form.cores || ''}
                                onChange={handleNumberChange}
                                onBlur={handleNumberBlur}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Threads</label>
                            <input
                                type="number"
                                name="threads"
                                value={form.threads || ''}
                                onChange={handleNumberChange}
                                onBlur={handleNumberBlur}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Boost Clock (MHz)</label>
                            <input
                                type="number"
                                name="boost_clock_mhz"
                                value={form.boost_clock_mhz || ''}
                                onChange={handleNumberChange}
                                onBlur={handleNumberBlur}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-xs text-slate-400 mb-1">TDP (Watts)</label>
                    <input
                        type="number"
                        name="tdp_watts"
                        value={form.tdp_watts || ''}
                        onChange={handleNumberChange}
                        onBlur={handleNumberBlur}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                    />
                </div>

                <div className="col-span-2 mt-2">
                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold transition-colors"
                    >
                        Add Custom Hardware
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomHardwareForm;
