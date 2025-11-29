import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

export interface GraphDataPoint {
    context: number;
    speed: number;
    vram: number;
    isOffloading: boolean;
    isOOM: boolean;
    limit: number;
}

interface PerformanceGraphProps {
    data: GraphDataPoint[];
    offloadStart?: number;
    oomStart?: number;
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({
    data,
    offloadStart,
    oomStart
}) => {
    return (
        <div className="w-full h-96 bg-gray-900 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Token Speed vs Context Size</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="context" stroke="#9CA3AF" label={{ value: 'Context Size (Tokens)', position: 'insideBottom', offset: -5 }} />
                    <YAxis stroke="#9CA3AF" label={{ value: 'Tokens / Sec', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#F3F4F6' }}
                        formatter={(value: any, name: string) => [typeof value === 'number' ? value.toFixed(2) : value, name === 'speed' ? 'T/s' : name]}
                    />
                    <Legend />

                    {/* The Performance Line */}
                    <Line type="monotone" dataKey="speed" stroke="#8884d8" strokeWidth={3} dot={false} activeDot={{ r: 8 }} name="Speed (T/s)" />

                    {/* Yellow Area for Offloading (only if offloading exists and is NOT immediately OOM) */}
                    {offloadStart && (
                        <ReferenceArea
                            x1={offloadStart}
                            x2={oomStart || data[data.length - 1].context}
                            strokeOpacity={0.3}
                            fill="#EAB308"
                            fillOpacity={0.2}
                            label={{ value: "RAM Offload", position: 'insideTopRight', fill: '#EAB308' }}
                        />
                    )}

                    {/* Red Area for OOM (Out of Memory) */}
                    {oomStart && (
                        <ReferenceArea
                            x1={oomStart}
                            x2={data[data.length - 1].context}
                            strokeOpacity={0.3}
                            fill="#DC2626"
                            fillOpacity={0.3}
                            label={{ value: "Out of Memory", position: 'insideTopRight', fill: '#DC2626' }}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PerformanceGraph;
