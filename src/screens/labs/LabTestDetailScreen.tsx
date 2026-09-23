import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star, Clock, Home as HomeIcon, CheckCircle2, Bot } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { useLabTestDetail } from '../../api/diagnosticsApi';
import { MOCK_LAB_PARTNERS } from '../../api/diagnosticsApi';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type RouteProps = RouteProp<RootStackParamList, 'LabTestDetail'>;

export function LabTestDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { testId } = route.params;
  const { data: test, isLoading } = useLabTestDetail(testId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.royalBlue} />
      </SafeAreaView>
    );
  }
  if (!test) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity id="btn-back-lab-detail" onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={Colors.textPrimary} size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>+ {test.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Test Hero */}
        <LinearGradient colors={[Colors.blueBg, Colors.tealBg]} style={styles.testHero}>
          <Text style={styles.testHeroEmoji}>🔬</Text>
          <View style={styles.testHeroInfo}>
            <Text style={styles.testHeroName}>{test.name}</Text>
            <Text style={styles.testHeroDesc}>{test.description}</Text>
            <View style={styles.testHeroMeta}>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipLabel}>FASTING</Text>
                <Text style={[styles.metaChipValue, { color: test.fasting ? Colors.error : Colors.success }]}>
                  {test.fasting ? 'YES' : 'NO'}
                </Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipLabel}>SAMPLE</Text>
                <Text style={styles.metaChipValue}>{test.sampleType}</Text>
              </View>
              <View style={[styles.labBadge]}>
                <Text style={styles.labBadgeText}>Tata 1mg{'\n'}lab</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {test.description} This test measures important blood parameters and is used to assess
            overall health and detect a wide range of disorders. Recommended annually for
            preventive care monitoring.
          </Text>
        </View>

        {/* Test Includes */}
        {test.includes && test.includes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Includes ({test.includes.length} parameters)</Text>
            <View style={styles.includesGrid}>
              {test.includes.map((item, i) => (
                <View key={i} style={styles.includeChip}>
                  <CheckCircle2 size={12} color={Colors.teal} strokeWidth={2.5} />
                  <Text style={styles.includeText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Powered Reports Banner */}
        <LinearGradient
          colors={['#EEF3FF', '#EAF8F4']}
          style={styles.aiBanner}
        >
          <View style={styles.aiBannerLeft}>
            <View style={styles.aiBadge}>
              <Bot size={16} color={Colors.royalBlue} strokeWidth={2} />
              <Text style={styles.aiBadgeText}>AI Powered Reports</Text>
            </View>
            <Text style={styles.aiBannerTitle}>Get AI Powered Reports with Bionex</Text>
            <Text style={styles.aiBannerSub}>
              Accurate reports and every step of the way
            </Text>
            <View style={styles.aiBannerFeatures}>
              {['Accurate Analysis', 'Personalized Insights', 'Quick & Easy'].map((f) => (
                <View key={f} style={styles.aiFeature}>
                  <Text style={styles.aiFeatureEmoji}>✅</Text>
                  <Text style={styles.aiFeatureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.aiRobotEmoji}>🤖</Text>
        </LinearGradient>

        {/* Lab Partners */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Top Trusted Labs</Text>
          {MOCK_LAB_PARTNERS.map((lab) => (
            <View key={lab.id} style={styles.labCard}>
              <View style={styles.labCardLeft}>
                <View style={styles.labLogoPlaceholder}>
                  <Text style={styles.labLogoText}>{lab.name.charAt(0)}</Text>
                </View>
                <View style={styles.labInfo}>
                  <Text style={styles.labName}>{lab.name}</Text>
                  <Text style={styles.labAddress}>{lab.address}</Text>
                  <Text style={styles.labTimings}>{lab.timings}</Text>
                  <View style={styles.labBadgesRow}>
                    {lab.nabl && (
                      <View style={styles.nablBadge}>
                        <Text style={styles.nablText}>NABL</Text>
                      </View>
                    )}
                    {lab.cap && (
                      <View style={[styles.nablBadge, { backgroundColor: Colors.orangeBg }]}>
                        <Text style={[styles.nablText, { color: Colors.orange }]}>CAP</Text>
                      </View>
                    )}
                    {lab.homeCollection && (
                      <View style={styles.homeCollectionBadge}>
                        <HomeIcon size={10} color={Colors.teal} strokeWidth={2} />
                        <Text style={[styles.nablText, { color: Colors.teal }]}>Home</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.labCardRight}>
                <View style={styles.ratingRow}>
                  <Star size={12} color={Colors.warning} fill={Colors.warning} strokeWidth={0} />
                  <Text style={styles.ratingText}>{lab.rating}</Text>
                </View>
                <Text style={styles.labPrice}>₹{lab.discountedPrice ?? lab.price}</Text>
                {lab.discountedPrice && (
                  <Text style={styles.labOriginalPrice}>₹{lab.price}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Book Now CTA */}
      <View style={styles.bookNowContainer}>
        <TouchableOpacity id="btn-book-now-detail" activeOpacity={0.85} style={styles.bookNowBtn}>
          <LinearGradient
            colors={[Colors.royalBlue, Colors.royalBlueDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookNowGradient}
          >
            <Text style={styles.bookNowText}>Book Now</Text>
            <Text style={styles.bookNowPlus}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  scrollContent: { paddingBottom: 100 },
  testHero: {
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.base,
    margin: Spacing.base,
    borderRadius: BorderRadius.xl,
  },
  testHeroEmoji: { fontSize: 50 },
  testHeroInfo: { flex: 1 },
  testHeroName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  testHeroDesc: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.fontSize.sm * 1.6,
  },
  testHeroMeta: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  metaChip: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignItems: 'center',
  },
  metaChipLabel: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  metaChipValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  labBadge: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  labBadgeText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.royalBlue,
    textAlign: 'center',
  },
  section: { paddingHorizontal: Spacing.base, marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.base * 1.7,
  },
  includesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  includeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.tealBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  includeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.tealDark,
  },
  aiBanner: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  aiBannerLeft: { flex: 1 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  aiBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.royalBlue,
  },
  aiBannerTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  aiBannerSub: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  aiBannerFeatures: { gap: 3 },
  aiFeature: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiFeatureEmoji: { fontSize: 10 },
  aiFeatureText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  aiRobotEmoji: { fontSize: 60 },
  labCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  labCardLeft: { flex: 1, flexDirection: 'row', gap: Spacing.md },
  labLogoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labLogoText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.royalBlue,
  },
  labInfo: { flex: 1 },
  labName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  labAddress: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  labTimings: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  labBadgesRow: { flexDirection: 'row', gap: 4 },
  nablBadge: {
    backgroundColor: Colors.tealBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nablText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.teal,
    letterSpacing: 0.5,
  },
  homeCollectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.tealBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labCardRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  labPrice: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  labOriginalPrice: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  bookNowContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookNowBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  bookNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
  },
  bookNowText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
  },
  bookNowPlus: {
    color: Colors.white,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
});
