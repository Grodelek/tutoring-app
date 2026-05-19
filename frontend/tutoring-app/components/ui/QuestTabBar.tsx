import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { C, T } from '@/constants/theme';
import AsyncStorage from "@react-native-async-storage/async-storage";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type TabDef = { route: string; label: string; icon: IconName; color: string };

function hexAlpha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

type Props = BottomTabBarProps & { staticTabs?: TabDef[] };

export function QuestTabBar({ state, navigation, staticTabs }: Props) {
  const insets = useSafeAreaInsets();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    if (staticTabs) return;
    let cancelled = false;
    (async () => {
      try {
        const t = await AsyncStorage.getItem('userType');
        if (!cancelled) setUserType(t);
      } catch {
        if (!cancelled) setUserType(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [staticTabs]);

  const authTabs: TabDef[] = useMemo(() => {
    if (staticTabs) return staticTabs;

    const base: TabDef[] = [
      { route: 'exploreTutors', label: 'EXPLORE', icon: 'compass', color: C.coral },
    ];

    if (userType === 'TUTOR') {
      base.push({ route: 'createPost', label: 'POST', icon: 'plus-box', color: C.amber });
    }

    base.push(
      { route: 'myAccount', label: 'PROFIL', icon: 'account', color: C.purple },
      { route: 'conversations', label: 'CHAT', icon: 'message-text', color: C.teal },
    );

    return base;
  }, [staticTabs, userType]);

  const tabs = authTabs;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      {tabs.map(({ route, label, icon, color }) => {
        const routeIndex = state.routes.findIndex((r: { name: string }) => r.name === route);
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
