import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Model {
    id: string;
    name: string;
    params: number;
    [key: string]: any;
}

interface ModelContextType {
    selectedModelId: string;
    setSelectedModelId: (id: string) => void;
    quality: number;
    setQuality: (quality: number) => void;
    contextSize: number;
    setContextSize: (size: number) => void;
    customModels: Record<string, Model>;
    addCustomModel: (model: Model) => void;
    removeCustomModel: (id: string) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const useModel = (): ModelContextType => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModel must be used within ModelContext');
    }
    return context;
};

interface ModelProviderProps {
    children: ReactNode;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({ children }) => {
    const [selectedModelId, setSelectedModelId] = useState<string>('llama3_70b');
    const [quality, setQuality] = useState<number>(4);
    const [contextSize, setContextSize] = useState<number>(4096);
    const [customModels, setCustomModels] = useState<Record<string, Model>>({});

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('vivi_model_context');
            if (saved) {
                const data = JSON.parse(saved);
                setSelectedModelId(data.selectedModelId || 'llama3_70b');
                setQuality(data.quality || 4);
                setContextSize(data.contextSize || 4096);
                setCustomModels(data.customModels || {});
            }
        } catch (error) {
            console.error('Failed to load model context:', error);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        try {
            const data = {
                selectedModelId,
                quality,
                contextSize,
                customModels,
            };
            localStorage.setItem('vivi_model_context', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save model context:', error);
        }
    }, [selectedModelId, quality, contextSize, customModels]);

    const addCustomModel = (model: Model) => {
        setCustomModels(prev => ({
            ...prev,
            [model.id]: model,
        }));
    };

    const removeCustomModel = (id: string) => {
        setCustomModels(prev => {
            const newModels = { ...prev };
            delete newModels[id];
            return newModels;
        });
    };

    const value: ModelContextType = {
        selectedModelId,
        setSelectedModelId,
        quality,
        setQuality,
        contextSize,
        setContextSize,
        customModels,
        addCustomModel,
        removeCustomModel,
    };

    return (
        <ModelContext.Provider value={value}>
            {children}
        </ModelContext.Provider>
    );
};

export default ModelContext;
