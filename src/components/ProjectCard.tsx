import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UpcomingProject } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { formatKes } from '@/src/utils/format';

type Props = {
  project: UpcomingProject;
  onPress: () => void;
};

export function ProjectCard({ project, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        <Image source={{ uri: project.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={styles.badge}>
          <Ionicons name="construct" size={11} color={colors.textInverse} />
          <Text style={styles.badgeText}>Upcoming</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {project.name}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {project.estate}, {project.county}
        </Text>
        <View style={styles.row}>
          <Text style={styles.price}>From {formatKes(project.priceFromKes)}</Text>
        </View>
        <Text style={styles.completion}>{project.completionLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
    ...shadows.soft,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: colors.chip,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: {
    ...typography.captionBold,
    color: colors.textInverse,
    fontSize: 10,
  },
  body: {
    padding: spacing.md,
    gap: 2,
  },
  name: {
    ...typography.bodyBold,
    color: colors.text,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  row: {
    marginTop: 4,
  },
  price: {
    ...typography.captionBold,
    color: colors.accent,
  },
  completion: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
