import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { C, T } from '@/constants/theme';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function BackHeader({ title, subtitle, onBack }: BackHeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.header}>
      <Pressable onPress={handleBack} style={styles.btn} hitSlop={8}>
        <MaterialCommunityIcons name="arrow-left" size={20} color={C.textDim} />
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        )}
      </View>

      {/* mirror spacer keeps title visually centered */}
      <View style={styles.btn} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 4,
    borderTopColor: C.border,
    borderLeftColor: C.border,
    borderRightColor: C.border,
    borderBottomColor: C.bgDeep,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  title: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 18,
    letterSpacing: -0.5,
    color: C.text,
  },
  subtitle: {
    fontFamily: T.family.medium,
    fontWeight: '600',
    fontSize: 12,
    color: C.textDim,
  },
});
