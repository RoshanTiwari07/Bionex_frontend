import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MapPin,
  ChevronDown,
  Search,
  Star,
  Clock,
  Home as HomeIcon,
  CheckCircle2,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { useLabTests } from '../../api/diagnosticsApi';
import { MOCK_LAB_PARTNERS, MOCK_POPULAR_TESTS } from '../../api/diagnosticsApi';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import type { TestCategory } from '../../api/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES: { id: TestCategory; label: string; emoji: string }[] = [
  { id: 'FULL_BODY', label: 'Full Body Checkup', emoji: '🧬' },
  { id: 'FEVER', label: 'Fever', emoji: '🤒' },
  { id: 'THYROID', label: 'Thyroid', emoji: '🦋' },
  { id: 'DIABETES', label: 'Diabetes', emoji: '🩸' },
  { id: 'CARDIAC', label: 'Cardiac Care', emoji: '❤️' },
  { id: 'ALLERGY', label: 'Allergy', emoji: '🌿' },
  { id: 'HAIR_SKIN', label: 'Hair & Skin', emoji: '💆' },
  { id: 'WOMENS_HEALTH', label: 'Women\'s Health', emoji: '🌸' },
];

export function LabTestsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [location, setLocation] = useState('Goregaon');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | undefined>();

  const { data: tests, isLoading } = useLabTests(selectedCategory);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={[Colors.royalBlue, Colors.royalBlueDark]} style={styles.header}>
        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.white} strokeWidth={2.5} />
          <Text style={styles.locationText}>{location}</Text>
          <ChevronDown size={14} color={Colors.white} strokeWidth={2.5} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textMuted} strokeWidth={2} />
          <TextInput
            id="input-lab-search"
            style={styles.searchInput}
            placeholder="Search for a test..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Popular Tests Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Tests</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                id={`btn-category-${cat.id}`}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                style={[
                  styles.categoryCard,
                  selectedCategory === cat.id && styles.categoryCardActive,
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryLabel, selectedCategory === cat.id && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lab Delivery Banner */}
        <View style={styles.deliveryBanner}>
          <LinearGradient
            colors={['#EEF3FF', '#EAF8F4']}
            style={styles.deliveryGradient}
          >
            <Text style={styles.deliveryEmoji}>🚗</Text>
            <View>
              <Text style={styles.deliveryTitle}>Delivery at your doorstep,{'\n'}best prices overall</Text>
              <View style={styles.deliveryBadges}>
                {['NABL Accredited', 'Home Collection', 'On-time Reports'].map((badge) => (
                  <View key={badge} style={styles.badge}>
                    <CheckCircle2 size={10} color={Colors.teal} strokeWidth={2.5} />
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Tests List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? `${CATEGORIES.find(c => c.id === selectedCategory)?.label}` : 'Lab Tests & Packages'}
            </Text>
            <TouchableOpacity id="btn-view-all-tests">
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color={Colors.royalBlue} style={{ marginTop: Spacing.xl }} />
          ) : (
            (tests ?? MOCK_POPULAR_TESTS).map((test) => (
              <TouchableOpacity
                key={test.id}
                id={`btn-test-${test.id}`}
                onPress={() => navigation.navigate('LabTestDetail', { testId: test.id })}
                style={styles.testCard}
                activeOpacity={0.88}
              >
                <View style={styles.testCardLeft}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testIncludes}>
                    {test.includes?.slice(0, 3).join(' · ')}
                    {(test.includes?.length ?? 0) > 3 ? ` +${test.includes!.length - 3} more` : ''}
                  </Text>
                  <View style={styles.testMeta}>
                    <View style={[styles.metaTag, test.fasting ? styles.metaTagWarning : styles.metaTagSuccess]}>
                      <Text style={styles.metaTagText}>
                        {test.fasting ? '⚠️ Fasting YES' : '✅ No Fasting'}
                      </Text>
                    </View>
                    <View style={styles.metaTag}>
                      <Text style={styles.metaTagText}>🩸 {test.sampleType}</Text>
                    </View>
                    <View style={styles.metaTag}>
                      <Clock size={10} color={Colors.textMuted} strokeWidth={2} />
                      <Text style={styles.metaTagText}>{test.turnaroundHours}h</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.testCardRight}>
                  {test.aiPowered && (
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiText}>🤖 AI</Text>
                    </View>
                  )}
                  <View style={styles.priceBlock}>
                    {test.discountedPrice && (
                      <Text style={styles.originalPrice}>₹{test.price}</Text>
                    )}
                    <Text style={styles.price}>₹{test.discountedPrice ?? test.price}</Text>
                  </View>
                  <TouchableOpacity
                    id={`btn-book-test-${test.id}`}
                    style={styles.bookBtn}
                    onPress={() => navigation.navigate('LabTestDetail', { testId: test.id })}
                  >
                    <Text style={styles.bookBtnText}>Book Test</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Combo Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Combo Offers</Text>
          <LinearGradient
            colors={[Colors.tealBg, Colors.blueBg]}
            style={styles.comboCard}
          >
            <Text style={styles.comboEmoji}>🎯</Text>
            <View style={styles.comboInfo}>
              <Text style={styles.comboTitle}>Accessible & Affordable</Text>
              <Text style={styles.comboSub}>Premium diagnostics at unbeatable prices</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Privacy Footer */}
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
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md },
  locationText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  scrollContent: { paddingBottom: Spacing['4xl'] },
  section: { paddingHorizontal: Spacing.base, marginTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  viewAll: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.royalBlue,
  },
  categoriesScroll: { gap: Spacing.sm, paddingBottom: 4 },
  categoryCard: {
    width: 85,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryCardActive: { borderColor: Colors.royalBlue, backgroundColor: Colors.blueBg },
  categoryEmoji: { fontSize: 28 },
  categoryLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoryLabelActive: { color: Colors.royalBlue },
  deliveryBanner: { marginHorizontal: Spacing.base, marginTop: Spacing.md, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  deliveryGradient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, padding: Spacing.base },
  deliveryEmoji: { fontSize: 40 },
  deliveryTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  deliveryBadges: { gap: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.medium, color: Colors.textSecondary },
  testCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  testCardLeft: { flex: 1, marginRight: Spacing.sm },
  testName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  testIncludes: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.fontSize.xs * 1.6,
  },
  testMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: Colors.surface,
    borderRadius: 4,
  },
  metaTagWarning: { backgroundColor: Colors.warningBg },
  metaTagSuccess: { backgroundColor: Colors.successBg },
  metaTagText: { fontSize: 9, fontFamily: Typography.fontFamily.medium, color: Colors.textSecondary },
  testCardRight: { alignItems: 'flex-end', gap: Spacing.xs },
  aiBadge: {
    backgroundColor: Colors.blueBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiText: { fontSize: 10, fontFamily: Typography.fontFamily.semiBold, color: Colors.royalBlue },
  priceBlock: { alignItems: 'flex-end' },
  originalPrice: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  bookBtn: {
    backgroundColor: Colors.royalBlue,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  bookBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
  },
  comboCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  comboEmoji: { fontSize: 40 },
  comboInfo: { flex: 1 },
  comboTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  comboSub: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  privacySection: { padding: Spacing.xl, paddingHorizontal: Spacing['2xl'] },
  privacyMain: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.regular, color: Colors.textSecondary },
  privacyDevanagari: { fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.bold, color: Colors.textPrimary },
  privacyWith: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.medium, color: Colors.teal },
});
