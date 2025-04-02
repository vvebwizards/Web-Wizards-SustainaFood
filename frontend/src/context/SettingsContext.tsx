import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const SETTINGS_API_URL = "http://localhost:5000/api/settings";

interface Settings {
    userId: string;
    expiredNotifHour: number;
    expiredNotifMinute: number;
    expiredNotifDate: number;
}

interface SettingsContextType {
    settings: Settings | null;
    fetchSettings: () => Promise<void>;
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
    error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !user.id) {
            console.warn("⚠️ No user found, skipping settings fetch.");
            return;
        }
        fetchSettings();
    }, [user]);

    const fetchSettings = async () => {
        if (!user || !user.id) return;
        try {
            const response = await fetch(`${SETTINGS_API_URL}/get`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`Failed to fetch settings: ${response.status}`);
            const data = await response.json();
            setSettings(data);
        } catch (err) {
            setError(err.message || 'Error fetching settings');
            console.error("❌ Error fetching settings:", err);
        }
    };

    const updateSettings = async (newSettings: Partial<Settings>) => {
        try {
            const response = await fetch(`${SETTINGS_API_URL}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
                credentials: 'include',
            });
            if (!response.ok) throw new Error(`Failed to update settings: ${response.status}`);
            const data = await response.json();
            setSettings(data);
        } catch (err) {
            setError(err.message || 'Error updating settings');
            console.error("❌ Error updating settings:", err);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, fetchSettings, updateSettings, error }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
};
