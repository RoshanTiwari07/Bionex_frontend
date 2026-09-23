import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  MapPin,
  ChevronDown,
  ShoppingCart,
  Activity,
  Footprints,
  Heart,
  Moon,
  Upload,
  FlaskConical,
  Shield,
  Clock,
  AlertCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useHealthData } from '../../api/vitalsApi';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const cartTotal = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const { data: healthData, isLoading: healthLoading, refetch } = useHealthData(user?.id ?? '');

  const firstName = user?.name?.split(' ')[0] ?? 'User';

  const REMINDERS = [
    {
      id: 'rem-1',
      medicine: 'Pan-40',
      dosage: '40mg · After Meal',
      time: '9:00 AM Today',
      status: 'UPCOMING' as const,
      refillLeft: 5,
      priority: 'HIGH' as const,
    },
    {
      id: 'rem-2',
      medicine: 'Blood Test',
      dosage: 'City Lab · Fasting',
      time: '8:00 AM · Tomorrow, 13 Jun',
      status: 'UPCOMING' as const,
      location: '42 Health St, Medical District',
      priority: 'LOW' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[Colors.white, Colors.background]}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerTopRow}>
            <View style={styles.locationRow}>
              <MapPin size={14} color={Colors.royalBlue} strokeWidth={2.5} />
              <Text style={styles.locationText}>Goregaon</Text>
              <ChevronDown size={14} color={Colors.royalBlue} strokeWidth={2.5} />
            </View>
          </View>
          <Text style={styles.greetingLine}>
            Welcome <Text style={styles.greetingName}>{firstName}</Text> 👋
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity id="btn-notifications" style={styles.iconBtn}>
            <Bell size={20} color={Colors.textSecondary} strokeWidth={2} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            id="btn-cart"
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <ShoppingCart size={20} color={Colors.textSecondary} strokeWidth={2} />
            {cartTotal > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartTotal}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={healthLoading} onRefresh={refetch} />}
      >
        {/* ── Health Score + Wearable Card ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Synced with your OnePlus watch</Text>
          <View style={styles.healthCard}>
            {/* Score Ring */}
            <View style={styles.scoreRingContainer}>
              <View style={styles.scoreRing}>
                <View style={styles.scoreInner}>
                  {healthLoading ? (
                    <ActivityIndicator color={Colors.royalBlue} />
                  ) : (
                    <>
                      <Text style={styles.scoreNumber}>{healthData?.score.score ?? 79}</Text>
                      <Text style={styles.scoreMax}>out of 100</Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Metric Pills */}
            <View style={styles.metricRow}>
              <View style={[styles.metricPill, { backgroundColor: Colors.tealBg }]}>
                <Footprints size={16} color={Colors.teal} strokeWidth={2} />
                <Text style={[styles.metricValue, { color: Colors.tealDark }]}>
                  {healthData?.steps.value.toLocaleString() ?? '5,000'}
                </Text>
                <Text style={styles.metricUnit}>Steps</Text>
              </View>
              <View style={[styles.metricPill, { backgroundColor: '#FFF0F0' }]}>
                <Heart size={16} color={Colors.error} strokeWidth={2} />
                <Text style={[styles.metricValue, { color: Colors.error }]}>
                  {healthData?.heartRate.value ?? 89}
                </Text>
                <Text style={styles.metricUnit}>BPM</Text>
              </View>
              <View style={[styles.metricPill, { backgroundColor: Colors.blueBg }]}>
                <Moon size={16} color={Colors.royalBlue} strokeWidth={2} />
                <Text style={[styles.metricValue, { color: Colors.royalBlue }]}>
                  {healthData?.sleep.value ?? 9}hr
                </Text>
                <Text style={styles.metricUnit}>Sleep</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Action Banners ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you can do with Bionex.</Text>
          <View style={styles.bannerRow}>
            {/* Upload Banner */}
            <TouchableOpacity id="btn-upload-today" activeOpacity={0.88} style={styles.uploadBanner}>
              <LinearGradient
                colors={[Colors.white, Colors.tealBg]}
                style={styles.bannerGradient}
              >
                <Text style={styles.bannerEmoji}>📋</Text>
                <Text style={styles.bannerTitle}>Store, manage, and analyze all your medical reports in one place.</Text>
                <View style={styles.bannerCta}>
                  <Text style={styles.bannerCtaText}>Upload Today</Text>
                  <Upload size={12} color={Colors.teal} strokeWidth={2.5} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Lab Banner */}
            <TouchableOpacity id="btn-book-lab" activeOpacity={0.88} style={styles.labBanner}>
              <LinearGradient
                colors={[Colors.white, Colors.blueBg]}
                style={styles.bannerGradient}
              >
                <Text style={styles.bannerEmoji}>🔬</Text>
                <Text style={styles.bannerTitle}>Book a lab test at home in minutes.</Text>
                <View style={[styles.bannerCta, { opacity: 0.6 }]}>
                  <Text style={[styles.bannerCtaText, { color: Colors.royalBlue }]}>Coming Soon</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Book Lab Tests Orange Card ── */}
        <TouchableOpacity id="btn-book-lab-main" activeOpacity={0.88} style={styles.orangeCard}>
          <LinearGradient
            colors={[Colors.orange, Colors.orangeDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orangeCardGradient}
          >
            <View style={styles.orangeCardLeft}>
              <Text style={styles.orangeCardLabel}>Coming Soon</Text>
              <Text style={styles.orangeCardTitle}>Book Lab Tests near you.</Text>
              <Text style={styles.orangeCardSub}>100+ labs available near you</Text>
              <View style={styles.orangeCardCta}>
                <Text style={styles.orangeCardCtaText}>+</Text>
              </View>
            </View>
            <Text style={styles.orangeCardEmoji}>🏥</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Dark Coming Soon Card ── */}
        <TouchableOpacity id="btn-global-labs" activeOpacity={0.88} style={styles.darkCard}>
          <LinearGradient
            colors={['#0D1B3E', '#1E2D5A']}
            style={styles.darkCardGradient}
          >
            <View>
              <Text style={styles.darkCardLabel}>Coming Soon</Text>
              <Text style={styles.darkCardTitle}>Book Lab Tests near you.</Text>
              <Text style={styles.darkCardSub}>100+ labs available near you</Text>
            </View>
            <Text style={styles.darkCardEmoji}>🌍</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Smart Reminders ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Smart Reminders</Text>
            <TouchableOpacity id="btn-view-all-reminders">
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {REMINDERS.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderLeft}>
                <Text style={styles.reminderMed}>{reminder.medicine}</Text>
                <Text style={styles.reminderDosage}>{reminder.dosage}</Text>
                <View style={styles.reminderTimeRow}>
                  <Clock size={12} color={Colors.textMuted} strokeWidth={2} />
                  <Text style={styles.reminderTime}>{reminder.time}</Text>
                </View>
                {reminder.refillLeft !== undefined && (
                  <View style={styles.refillBadge}>
                    <Text style={styles.refillText}>REFILL NEEDED ({reminder.refillLeft} LEFT)</Text>
                  </View>
                )}
              </View>
              <View style={styles.reminderRight}>
                <View style={[
                  styles.statusBadge,
                  reminder.priority === 'HIGH' ? styles.statusHigh : styles.statusRoutine,
                ]}>
                  <Text style={[
                    styles.statusText,
                    reminder.priority === 'HIGH' ? { color: Colors.error } : { color: Colors.royalBlue },
                  ]}>
                    {reminder.priority === 'HIGH' ? 'HIGH PRIORITY' : 'ROUTINE'}
                  </Text>
                </View>
                <View style={[
                  styles.reminderStatusBadge,
                  { backgroundColor: Colors.blueBg },
                ]}>
                  <Text style={[styles.reminderStatusText, { color: Colors.royalBlue }]}>
                    Upcoming
                  </Text>
                </View>
                {reminder.refillLeft !== undefined && (
                  <TouchableOpacity id={`btn-order-now-${reminder.id}`} style={styles.orderNowBtn}>
                    <Text style={styles.orderNowText}>Order Now →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Family Monitoring ── */}
        <View style={[styles.section, styles.familySection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Monitoring</Text>
            <TouchableOpacity id="btn-family-settings">
              <Text style={styles.viewAllText}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.familyCard}>
            <View style={styles.familyAvatar}>
              <Text style={styles.familyAvatarEmoji}>👴</Text>
            </View>
            <View style={styles.familyInfo}>
              <Text style={styles.familyName}>Grandpa Joe</Text>
              <Text style={styles.familyAlert}>MISSED MORNING MEDICINES</Text>
            </View>
            <View style={styles.escalationBadge}>
              <AlertCircle size={12} color={Colors.error} strokeWidth={2} />
              <Text style={styles.escalationText}>ESCALATION ACTIVE</Text>
            </View>
          </View>
          <TouchableOpacity id="btn-notify-caregiver" style={styles.notifyCaregiverBtn}>
            <LinearGradient
              colors={[Colors.error, '#C0392B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.notifyCaregiverGradient}
            >
              <Bell size={16} color={Colors.white} strokeWidth={2} />
              <Text style={styles.notifyCaregiverText}>Notify Caregiver</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Privacy Badge ── */}
        <View style={styles.privacySection}>
          <Text style={styles.privacyMain}>Your Data Is</Text>
          <Text style={styles.privacyDevanagari}>सुरक्षित & Private</Text>
          <Text style={styles.privacyWith}>with Bionex.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flex: 1 },
  headerTopRow: { marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.royalBlue,
  },
  greetingLine: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  greetingName: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  headerRight: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { position: 'relative', padding: 4 },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
  },
  scrollContent: { paddingBottom: Spacing['4xl'] },
  section: { paddingHorizontal: Spacing.base, marginTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.royalBlue,
  },
  // Health Card
  healthCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.md,
  },
  scoreRingContainer: { alignItems: 'center', marginBottom: Spacing.base },
  scoreRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    borderColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tealBg,
  },
  scoreInner: { alignItems: 'center' },
  scoreNumber: {
    fontSize: Typography.fontSize['5xl'],
    fontFamily: Typography.fontFamily.extraBold,
    color: Colors.textPrimary,
  },
  scoreMax: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  metricRow: { flexDirection: 'row', gap: Spacing.sm },
  metricPill: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  metricValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  metricUnit: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  // Action Banners
  bannerRow: { flexDirection: 'row', gap: Spacing.sm },
  uploadBanner: { flex: 1 },
  labBanner: { flex: 1 },
  bannerGradient: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  bannerEmoji: { fontSize: 28, marginBottom: 4 },
  bannerTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.sm * 1.5,
    marginBottom: Spacing.sm,
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.tealBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  bannerCtaText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.teal,
  },
  // Orange Card
  orangeCard: { marginHorizontal: Spacing.base, marginTop: Spacing.md, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  orangeCardGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.xl },
  orangeCardLeft: { flex: 1 },
  orangeCardLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.orangeLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  orangeCardTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  orangeCardSub: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.md,
  },
  orangeCardCta: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orangeCardCtaText: { fontSize: 20, color: Colors.white, fontFamily: Typography.fontFamily.bold },
  orangeCardEmoji: { fontSize: 60 },
  // Dark Card
  darkCard: { marginHorizontal: Spacing.base, marginTop: Spacing.sm, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  darkCardGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.xl },
  darkCardLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.tealLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  darkCardTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  darkCardSub: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.6)',
  },
  darkCardEmoji: { fontSize: 60 },
  // Reminders
  reminderCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  reminderLeft: { flex: 1 },
  reminderMed: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  reminderDosage: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  reminderTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reminderTime: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  refillBadge: {
    marginTop: 6,
    backgroundColor: Colors.errorBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  refillText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.error,
    letterSpacing: 0.5,
  },
  reminderRight: { alignItems: 'flex-end', gap: Spacing.xs },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusHigh: { backgroundColor: Colors.errorBg },
  statusRoutine: { backgroundColor: Colors.blueBg },
  statusText: { fontSize: 9, fontFamily: Typography.fontFamily.bold, letterSpacing: 0.5 },
  reminderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  reminderStatusText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.semiBold },
  orderNowBtn: { backgroundColor: Colors.tealBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  orderNowText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.semiBold, color: Colors.teal },
  // Family
  familySection: { marginBottom: Spacing.base },
  familyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  familyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.orangeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyAvatarEmoji: { fontSize: 22 },
  familyInfo: { flex: 1 },
  familyName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  familyAlert: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  escalationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.errorBg,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  escalationText: { fontSize: 9, fontFamily: Typography.fontFamily.bold, color: Colors.error, letterSpacing: 0.5 },
  notifyCaregiverBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  notifyCaregiverGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  notifyCaregiverText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
  },
  // Privacy
  privacySection: {
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    alignItems: 'flex-start',
    paddingHorizontal: Spacing['2xl'],
  },
  privacyMain: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  privacyDevanagari: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    lineHeight: 40,
  },
  privacyWith: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.medium,
    color: Colors.teal,
  },
});
