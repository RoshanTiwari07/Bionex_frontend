import { USE_MOCK_DATA } from './client';
import type {
  RequestAbhaOtpPayload,
  VerifyAbhaOtpPayload,
  LoginWithPhonePayload,
  VerifyPhoneOtpPayload,
  AuthResponse,
  OtpResponse,
} from './types';
import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';

// ─── Mock Helpers ──────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MOCK_OTP_RESPONSE: OtpResponse = {
  txnId: 'mock-txn-' + Date.now(),
  message: 'OTP sent successfully',
  expiresIn: 300,
};

const MOCK_AUTH_RESPONSE: AuthResponse = {
  user: {
    id: 'user-001',
    name: 'Prajesh Kumar',
    phone: '+919876543210',
    abhaId: '12-3456-7890-1234',
    abhaAddress: 'prajesh.kumar@abdm',
    avatar: undefined,
    dob: '1992-05-15',
    gender: 'MALE',
  },
  accessToken: 'mock-access-token-bionex',
  refreshToken: 'mock-refresh-token-bionex',
};

// ─── API Functions ─────────────────────────────────────────────────────────────
export async function requestAbhaOtp(
  payload: RequestAbhaOtpPayload
): Promise<OtpResponse> {
  if (USE_MOCK_DATA) {
    await delay(1200);
    return { ...MOCK_OTP_RESPONSE, txnId: 'mock-txn-abha-' + Date.now() };
  }
  const { data } = await apiClient.post('/auth/abha/request-otp', payload);
  return data.data;
}

export async function verifyAbhaOtp(
  payload: VerifyAbhaOtpPayload
): Promise<AuthResponse> {
  if (USE_MOCK_DATA) {
    await delay(1500);
    if (payload.otp !== '123456') {
      throw { code: 'INVALID_OTP', message: 'Invalid OTP. Please try again.', statusCode: 400 };
    }
    await AsyncStorage.setItem('@bionex_access_token', MOCK_AUTH_RESPONSE.accessToken);
    await AsyncStorage.setItem('@bionex_refresh_token', MOCK_AUTH_RESPONSE.refreshToken);
    return MOCK_AUTH_RESPONSE;
  }
  const { data } = await apiClient.post('/auth/abha/verify-otp', payload);
  return data.data;
}

export async function requestPhoneOtp(
  payload: LoginWithPhonePayload
): Promise<OtpResponse> {
  if (USE_MOCK_DATA) {
    await delay(1000);
    return { ...MOCK_OTP_RESPONSE, txnId: 'mock-txn-phone-' + Date.now() };
  }
  const { data } = await apiClient.post('/auth/phone/request-otp', payload);
  return data.data;
}

export async function verifyPhoneOtp(
  payload: VerifyPhoneOtpPayload
): Promise<AuthResponse> {
  if (USE_MOCK_DATA) {
    await delay(1500);
    if (payload.otp !== '123456') {
      throw { code: 'INVALID_OTP', message: 'Invalid OTP. Please try again.', statusCode: 400 };
    }
    await AsyncStorage.setItem('@bionex_access_token', MOCK_AUTH_RESPONSE.accessToken);
    await AsyncStorage.setItem('@bionex_refresh_token', MOCK_AUTH_RESPONSE.refreshToken);
    return MOCK_AUTH_RESPONSE;
  }
  const { data } = await apiClient.post('/auth/phone/verify-otp', payload);
  return data.data;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove(['@bionex_access_token', '@bionex_refresh_token']);
}

// ─── React Query Hooks ─────────────────────────────────────────────────────────
export function useRequestAbhaOtp() {
  return useMutation({ mutationFn: requestAbhaOtp });
}

export function useVerifyAbhaOtp() {
  return useMutation({ mutationFn: verifyAbhaOtp });
}

export function useRequestPhoneOtp() {
  return useMutation({ mutationFn: requestPhoneOtp });
}

export function useVerifyPhoneOtp() {
  return useMutation({ mutationFn: verifyPhoneOtp });
}
