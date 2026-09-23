import { USE_MOCK_DATA } from './client';
import apiClient from './client';
import { useQuery } from '@tanstack/react-query';
import type { HealthData, WearableDevice } from './types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_HEALTH_DATA: HealthData = {
  score: { score: 79, maxScore: 100, label: 'Good', lastUpdated: new Date().toISOString() },
  steps: {
    label: 'Steps',
    value: 5000,
    unit: 'steps',
    trend: 'up',
    timestamp: new Date().toISOString(),
  },
  heartRate: {
    label: 'Heart Rate',
    value: 89,
    unit: 'BPM',
    trend: 'stable',
    timestamp: new Date().toISOString(),
  },
  sleep: {
    label: 'Sleep',
    value: 9,
    unit: 'hr',
    trend: 'down',
    timestamp: new Date().toISOString(),
  },
  bloodOxygen: {
    label: 'SpO2',
    value: 98,
    unit: '%',
    trend: 'stable',
    timestamp: new Date().toISOString(),
  },
  history: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
    steps: 3000 + Math.floor(Math.random() * 4000),
    heartRate: 72 + Math.floor(Math.random() * 20),
    sleepHours: 6 + Math.random() * 3,
  })),
};

const MOCK_DEVICES: WearableDevice[] = [
  {
    id: 'dev-1',
    name: 'OnePlus Watch 2',
    type: 'OTHER',
    connected: true,
    lastSync: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'dev-2',
    name: 'Apple Health',
    type: 'APPLE_HEALTH',
    connected: false,
  },
  {
    id: 'dev-3',
    name: 'Google Health Connect',
    type: 'GOOGLE_HEALTH',
    connected: false,
  },
];

// ─── API Functions ─────────────────────────────────────────────────────────────
export async function fetchHealthData(userId: string): Promise<HealthData> {
  if (USE_MOCK_DATA) {
    await delay(800);
    return MOCK_HEALTH_DATA;
  }
  const { data } = await apiClient.get(`/vitals/${userId}/summary`);
  return data.data;
}

export async function fetchWearableDevices(userId: string): Promise<WearableDevice[]> {
  if (USE_MOCK_DATA) {
    await delay(600);
    return MOCK_DEVICES;
  }
  const { data } = await apiClient.get(`/vitals/${userId}/devices`);
  return data.data;
}

// ─── React Query Hooks ─────────────────────────────────────────────────────────
export function useHealthData(userId: string) {
  return useQuery({
    queryKey: ['health', userId],
    queryFn: () => fetchHealthData(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useWearableDevices(userId: string) {
  return useQuery({
    queryKey: ['devices', userId],
    queryFn: () => fetchWearableDevices(userId),
    enabled: !!userId,
  });
}
