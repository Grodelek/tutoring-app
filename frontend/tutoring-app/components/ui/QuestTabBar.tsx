import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { C, T } from '@/constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const TABS: { route: string; label: string; icon: IconName; color: string }[] = [
  { route: 'home',          label: 'START',  icon: 'home',         color: C.amber  },
  { route: 'exploreTutors', label: 'EXPLORE', icon: 'compass',      color: C.coral  },
  { route: 'conversations', label: 'CHAT',   icon: 'message-text', color: C.teal   },
  { route: 'myAccount',     label: 'PROFIL', icon: 'account',      color: C.purple },
];

function hexAlpha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function QuestTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      {TABS.map(({ route, label, icon, color }) => {
        const routeIndex = state.routes.findIndex((r) => r.name === route);
        const isActive = routeIndex !== -1 && state.index === routeIndex;

        const onPress = () => {
          if (routeIndex === -1) return;
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[routeIndex].key,
            canPreventDefault: true,
          });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route);
          }
        };

        const tint = isActive ? color : 'rgba(255,255,255,0.38)';

        return (
          <Pressable key={route} onPress={onPress} style={styles.tab}>
            <View
              style={[
                styles.pill,
                isActive && { backgroundColor: hexAlpha(color, 0.13) },
              ]}
            >
              <MaterialCommunityIcons name={icon} size={22} color={tint} />
            </View>
            <Text style={[styles.label, { color: tint }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: C.bgDeep,
    borderTopWidth: 2,
    borderTopColor: C.border,
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    minWidth: 60,
    alignItems: 'center',
    gap: 2,
  },
  pill: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
