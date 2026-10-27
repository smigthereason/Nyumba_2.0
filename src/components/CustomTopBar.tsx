import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/src/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BAR_COLOR = colors.primary;
const ACTIVE_PILL = '#FFFFFF';
const INACTIVE_ICON = 'rgba(255,255,255,0.76)';

type IconName = keyof typeof Ionicons.glyphMap;

const icons: Record<
  string,
  {
    outline: IconName;
    filled: IconName;
  }
> = {
  index: {
    outline: 'home-outline',
    filled: 'home',
  },
  search: {
    outline: 'search-outline',
    filled: 'search',
  },
  map: {
    outline: 'map-outline',
    filled: 'map',
  },
  favorites: {
    outline: 'heart-outline',
    filled: 'heart',
  },
  profile: {
    outline: 'person-circle-outline',
    filled: 'person-circle',
  },
};

function getIcon(
  routeName: string,
  focused: boolean,
  color: string
): React.ReactNode {
  const item = icons[routeName] ?? {
    outline: 'ellipse-outline',
    filled: 'ellipse',
  };

  return (
    <Ionicons
      name={focused ? item.filled : item.outline}
      size={20}
      color={color}
    />
  );
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: Math.max(insets.bottom, 14),
        },
      ]}
    >
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          // Internal routes must not appear in the pill navigation.
          if (
            route.name === 'settings' ||
            route.name.startsWith('+') ||
            route.name === '_sitemap'
          ) {
            return null;
          }

          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <AnimatedPressable
              key={route.key}
              layout={LinearTransition.springify().mass(0.5)}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={
                isFocused
                  ? {
                      selected: true,
                    }
                  : {}
              }
              accessibilityLabel={label}
              style={[
                styles.tabItem,
                isFocused && styles.activeTabItem,
              ]}
            >
              {getIcon(
                route.name,
                isFocused,
                isFocused ? BAR_COLOR : INACTIVE_ICON
              )}

              {isFocused ? (
                <Animated.Text
                  entering={FadeIn.duration(160)}
                  exiting={FadeOut.duration(120)}
                  style={styles.label}
                  numberOfLines={1}
                >
                  {label}
                </Animated.Text>
              ) : null}
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
    paddingHorizontal: 16,
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BAR_COLOR,
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,

    elevation: 12,
  },

  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    minWidth: 44,
    height: 44,
    paddingHorizontal: 12,

    borderRadius: 30,
  },

  activeTabItem: {
    backgroundColor: ACTIVE_PILL,
  },

  label: {
    marginLeft: 7,
    color: BAR_COLOR,
    fontSize: 13,
    fontWeight: '700',
  },
});
