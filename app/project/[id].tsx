import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { getAgencyById } from '@/src/data/repositories/agencies';
import { getUpcomingProjectById } from '@/src/data/repositories/projects';
import { Agency, UpcomingProject } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { openPhone, openWhatsApp } from '@/src/utils/contact';
import { formatKesFull, formatPropertyType } from '@/src/utils/format';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [project, setProject] = useState<UpcomingProject | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getUpcomingProjectById(id);
      setProject(p);
      if (p) {
        const a = await getAgencyById(p.agencyId);
        setAgency(a);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.loader}>
        <EmptyState title="Project not found" />
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View>
          <Image source={{ uri: project.imageUrl }} style={styles.hero} contentFit="cover" />
          <Pressable
            style={[styles.iconBtn, { top: insets.top + 8, left: spacing.lg }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.upcomingBadge}>
            <Ionicons name="construct" size={13} color={colors.textInverse} />
            <Text style={styles.upcomingBadgeText}>Upcoming project</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{project.name}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.location}>
              {project.estate}, {project.county}
            </Text>
          </View>

          <View style={styles.facts}>
            <Fact icon="pricetag-outline" label={`From ${formatKesFull(project.priceFromKes)}`} />
            <Fact icon="calendar-outline" label={project.completionLabel} />
            <Fact icon="home-outline" label={formatPropertyType(project.propertyType)} />
            {project.unitsLeft != null && (
              <Fact icon="business-outline" label={`${project.unitsLeft} units left`} />
            )}
          </View>

          <Text style={styles.section}>About this project</Text>
          <Text style={styles.description}>{project.description}</Text>

          {agency && (
            <>
              <Text style={styles.section}>Developed by</Text>
              <Pressable
                style={styles.agencyCard}
                onPress={() => router.push(`/agency/${agency.id}`)}
              >
                <Image source={{ uri: agency.logoUrl }} style={styles.agencyLogo} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <View style={styles.agencyNameRow}>
                    <Text style={styles.agencyName}>{agency.name}</Text>
                    {agency.verified && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.verified} />
                    )}
                  </View>
                  <Text style={styles.agencyMeta}>
                    ★ {agency.rating.toFixed(1)} · {agency.listingCount} listings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      {agency && (
        <View style={[styles.sticky, { paddingBottom: insets.bottom + spacing.md }]}>
          <PrimaryButton
            label="Call"
            icon="call"
            variant="secondary"
            fullWidth
            onPress={() => openPhone(agency.phone)}
          />
          <PrimaryButton
            label="WhatsApp"
            icon="logo-whatsapp"
            variant="accent"
            fullWidth
            onPress={() =>
              openWhatsApp(
                agency.whatsapp,
                `Hi, I'm interested in the "${project.name}" project on Nyumba.`
              )
            }
          />
        </View>
      )}
    </View>
  );
}

function Fact({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.factText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  hero: {
    width: '100%',
    height: 260,
    backgroundColor: colors.chip,
  },
  iconBtn: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  upcomingBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  upcomingBadgeText: {
    ...typography.captionBold,
    color: colors.textInverse,
  },
  body: {
    padding: spacing.lg,
  },
  name: {
    ...typography.title,
    color: colors.text,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  location: {
    ...typography.body,
    color: colors.textSecondary,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factText: {
    ...typography.captionBold,
    color: colors.text,
  },
  section: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  agencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  agencyLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.chip,
  },
  agencyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agencyName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  agencyMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.sticky,
  },
});
