import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/src/theme';

const AnimatedPressable = Animated.createAnimatedComponent(
  require('react-native').Pressable
);

const BAR_COLOR = colors.primary; // #0B6E4F
const ACTIVE_PILL = '#FFFFFF';
const INACTIVE_ICON = 'rgba(255,255,255,0.7)';

type IconName = keyof typeof Ionicons.glyphMap;

function getIcon(routeName: string, color: string): React.ReactNode {
  const map: Record<string, { outline: IconName; filled: IconName }> = {
    index: { outline: 'home-outline', filled: 'home' },
    search: { outline: 'search-outline', filled: 'search' },
    map: { outline: 'map-outline', filled: 'map' },
    favorites: { outline: 'heart-outline', filled: 'heart' },
    settings: { outline: 'settings-outline', filled: 'settings' },
  };

  const icons = map[routeName] ?? { outline: 'ellipse-outline', filled: 'ellipse' };
  return <Ionicons name={icons.filled} size={18} color={color} />;
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          // Hide profile (and any internal routes)
          if (route.name === 'profile' || route.name.startsWith('+') || route.name === '_sitemap') {
            return null;
          }

          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <AnimatedPressable
              key={route.key}
              layout={LinearTransition.springify().mass(0.5)}
              onPress={onPress}
              style={[
                styles.tabItem,
                { backgroundColor: isFocused ? ACTIVE_PILL : 'transparent' },
              ]}
            >
              {getIcon(route.name, isFocused ? BAR_COLOR : INACTIVE_ICON)}

              {isFocused && (
                <Animated.Text
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(180)}
                  style={styles.label}
                >
                  {label as string}
                </Animated.Text>
              )}
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BAR_COLOR,
    borderRadius: 40,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 30,
  },
  label: {
    color: BAR_COLOR,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
});
