import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '@/src/context/AppContext';
import { getCounties } from '@/src/data/repositories/locations';
import { County } from '@/src/data/types';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function CountyPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { county, setCounty } = useApp();
  const [counties, setCounties] = useState<County[]>([]);

  useEffect(() => {
    getCounties().then(setCounties);
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose county</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>
      <FlatList
        data={counties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 40 }}
        renderItem={({ item }) => {
          const active = item.name === county;
          return (
            <Pressable
              style={[styles.row, active && styles.rowActive]}
              onPress={() => {
                setCounty(item.name);
                router.back();
              }}
            >
              <View>
                <Text style={[styles.name, active && styles.nameActive]}>{item.name}</Text>
                <Text style={styles.estates}>
                  {item.estates.slice(0, 3).join(', ')}
                  {item.estates.length > 3 ? '…' : ''}
                </Text>
              </View>
              {active && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  name: {
    ...typography.bodyBold,
    color: colors.text,
  },
  nameActive: {
    color: colors.primary,
  },
  estates: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
