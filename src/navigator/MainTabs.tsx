// src/navigator/MainTabs.tsx
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LivePlanScreen } from '../screens/LivePlanScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { MapsScreen } from '../screens/MapsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useLivePlan } from '../state/AppStateContext';
import { colors, font } from '../theme/theme';

export type MainTabsParamList = {
  Live: undefined;
  Plans: undefined;
  Maps: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

function PulsingDot() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  return <Animated.View style={[styles.dot, { opacity }]} />;
}

function TabIcon({ icon, focused, badge }: { icon: string; focused: boolean; badge?: boolean }) {
  return (
    <View>
      <Text style={[styles.icon, { opacity: focused ? 1 : 0.45 }]}>{icon}</Text>
      {badge ? <PulsingDot /> : null}
    </View>
  );
}

export function MainTabs() {
  const livePlan = useLivePlan();
  const hasLivePlan = !!livePlan;

  return (
    <Tab.Navigator
      initialRouteName="Plans"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: font.size.xs, fontWeight: font.weight.semibold },
      }}
    >
      <Tab.Screen
        name="Live"
        component={LivePlanScreen}
        options={{
          tabBarLabel: 'Live',
          tabBarIcon: ({ focused }) => <TabIcon icon="📡" focused={focused && hasLivePlan} badge={hasLivePlan} />,
          tabBarButton: hasLivePlan
            ? undefined
            : ({ style, children }) => (
              <TouchableOpacity
                activeOpacity={1}
                style={[style, styles.disabled]}
                onPress={() =>
                  Alert.alert(
                    'No live plan right now',
                    'This tab lights up automatically starting 15 minutes before a plan you’ve joined begins.',
                  )
                }
              >
                {children}
              </TouchableOpacity>
            ),
        }}
      />
      <Tab.Screen
        name="Plans"
        component={PlansScreen}
        options={{ tabBarLabel: 'Plans', tabBarIcon: ({ focused }) => <TabIcon icon="🗂️" focused={focused} /> }}
      />
      <Tab.Screen
        name="Maps"
        component={MapsScreen}
        options={{ tabBarLabel: 'Map', tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 22 },
  dot: {
    position: 'absolute', top: -2, right: -6, width: 8, height: 8,
    borderRadius: 4, backgroundColor: colors.live,
  },
  disabled: { opacity: 0.35 },
});
