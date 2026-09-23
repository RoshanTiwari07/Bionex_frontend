// ─── Auth Types ─────────────────────────────────────────────────────────────
export interface RequestAbhaOtpPayload {
  abhaId: string;
}

export interface VerifyAbhaOtpPayload {
  abhaId: string;
  otp: string;
  txnId: string;
}

export interface LoginWithPhonePayload {
  phone: string;
}

export interface VerifyPhoneOtpPayload {
  phone: string;
  otp: string;
  txnId: string;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  abhaId?: string;
  abhaAddress?: string;
  avatar?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  txnId?: string;
}

export interface OtpResponse {
  txnId: string;
  message: string;
  expiresIn: number; // seconds
}

// ─── Vitals / Wearable Types ─────────────────────────────────────────────────
export interface VitalMetric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
}

export interface HealthScore {
  score: number;
  maxScore: number;
  label: string;
  lastUpdated: string;
}

export interface WearableDevice {
  id: string;
  name: string;
  type: 'APPLE_HEALTH' | 'GOOGLE_HEALTH' | 'FITBIT' | 'SAMSUNG' | 'GARMIN' | 'OTHER';
  connected: boolean;
  lastSync?: string;
}

export interface HealthData {
  score: HealthScore;
  steps: VitalMetric;
  heartRate: VitalMetric;
  sleep: VitalMetric;
  bloodOxygen?: VitalMetric;
  calories?: VitalMetric;
  history: HealthHistoryPoint[];
}

export interface HealthHistoryPoint {
  date: string;
  steps: number;
  heartRate: number;
  sleepHours: number;
}

// ─── Records Types ────────────────────────────────────────────────────────────
export type RecordType = 'LAB_RESULT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'RADIOLOGY' | 'VACCINATION';

export interface MedicalRecord {
  id: string;
  title: string;
  type: RecordType;
  date: string;
  doctor?: string;
  hospital?: string;
  thumbnailUrl?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  ocrStatus: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
  tags?: string[];
}

export interface UploadRecordPayload {
  file: {
    uri: string;
    name: string;
    type: string;
    size: number;
  };
  recordType: RecordType;
}

export interface UploadRecordResponse {
  recordId: string;
  status: 'QUEUED' | 'UPLOADING' | 'PROCESSING' | 'DONE';
  progress: number;
}

export interface OcrParseStatus {
  recordId: string;
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
  extractedText?: string;
  summary?: string;
}

// ─── Diagnostics / Lab Tests Types ───────────────────────────────────────────
export type TestCategory =
  | 'FULL_BODY'
  | 'FEVER'
  | 'THYROID'
  | 'DIABETES'
  | 'CARDIAC'
  | 'ALLERGY'
  | 'HAIR_SKIN'
  | 'WOMENS_HEALTH'
  | 'KIDNEY'
  | 'LIVER';

export interface LabTest {
  id: string;
  name: string;
  category: TestCategory;
  description: string;
  price: number;
  discountedPrice?: number;
  fasting: boolean;
  sampleType: 'BLOOD' | 'URINE' | 'STOOL' | 'SWAB' | 'MULTIPLE';
  turnaroundHours: number;
  includes?: string[];
  aiPowered: boolean;
  popular?: boolean;
}

export interface LabPartner {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  address: string;
  timings: string;
  nabl: boolean;
  cap: boolean;
  homeCollection: boolean;
  price: number;
  discountedPrice?: number;
}

export interface LabSearchResult {
  test: LabTest;
  labs: LabPartner[];
}

export interface BookLabTestPayload {
  testId: string;
  labId: string;
  date: string;
  timeSlot: string;
  address?: string;
  homeCollection: boolean;
  patientName: string;
  patientAge: number;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface BookingConfirmation {
  bookingId: string;
  status: 'CONFIRMED' | 'PENDING';
  date: string;
  timeSlot: string;
  labName: string;
  testName: string;
  totalAmount: number;
}

// ─── Pharmacy / Medicine Types ────────────────────────────────────────────────
export type MedicineCategory =
  | 'VITAMINS'
  | 'DAILY_ESSENTIALS'
  | 'CARDIAC'
  | 'DIABETES'
  | 'PAIN_RELIEF'
  | 'ANTIBIOTICS'
  | 'COLD_FLU'
  | 'DIGESTIVE';

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  generic?: string;
  category: MedicineCategory;
  packSize: string;
  price: number;
  discountedPrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  requiresPrescription: boolean;
  inStock: boolean;
  description?: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface PlaceOrderPayload {
  items: { medicineId: string; quantity: number }[];
  prescriptionId?: string;
  deliveryAddress: string;
  paymentMethod: 'COD' | 'UPI' | 'CARD';
}

export interface Order {
  orderId: string;
  status: 'PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: CartItem[];
  totalAmount: number;
  estimatedDelivery: string;
  trackingUrl?: string;
  createdAt: string;
}

// ─── Smart Reminders Types ────────────────────────────────────────────────────
export interface MedicationReminder {
  id: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  status: 'UPCOMING' | 'TAKEN' | 'MISSED' | 'SKIPPED';
  refillLeft?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar?: string;
  abhaId?: string;
  alertActive?: boolean;
  alertMessage?: string;
}

// ─── API Generic Wrappers ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, string>;
}
