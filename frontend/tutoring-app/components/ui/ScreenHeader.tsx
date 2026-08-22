import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, T } from '@/constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface ActionButton {
  icon: IconName;
  onPress: () => void;
}

interface ScreenHeaderProps {
  title: string;
  action?: ActionButton;
}

export function ScreenHeader({ title, action }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
        {title}
      </Text>
      {action && (
        <Pressable onPress={action.onPress} style={styles.actionBtn}>
          <MaterialCommunityIcons name={action.icon} size={20} color={C.textDim} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    flex: 1,
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 24,
    letterSpacing: -0.55,
    color: C.text,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    // individual borders so bottom acts as hard shadow (0 2px 0 0 bgDeep)
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 4,
    borderTopColor: C.border,
    borderLeftColor: C.border,
    borderRightColor: C.border,
    borderBottomColor: C.bgDeep,
  },
});
