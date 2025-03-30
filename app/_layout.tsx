import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View, Text, StyleSheet } from 'react-native';

import Colors, { getColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/context/AuthContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const { logout } = useAuth();

  // Custom tab bar with logout button
  const renderTabBar = (props: any) => {
    return (
      <View>
        {/* Logout button above tab bar */}
        <View style={styles.logoutContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={logout}
          >
            <FontAwesome name="sign-out" size={16} color="#666" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
        
        {/* Default tab bar */}
        <View style={styles.tabBar}>
          {props.state.routes.map((route: any, index: number) => {
            const { options } = props.descriptors[route.key];
            const label = options.title || route.name;
            const isFocused = props.state.index === index;
            
            const onPress = () => {
              const event = props.navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                props.navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
              >
                <TabBarIcon
                  name={options.tabBarIcon({ color: '' }).props.name}
                  color={isFocused ? colors.tint : colors.tabIconDefault}
                />
                <Text style={{
                  color: isFocused ? colors.tint : colors.tabIconDefault,
                  fontSize: 12,
                  marginTop: 2
                }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: { display: 'none' }, // Hide default tab bar
        headerShown: useClientOnlyValue(false, true),
      }}
      tabBar={renderTabBar}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <TabBarIcon name="tasks" color={color} />,
          headerRight: () => (
            <Link href="/task/new" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="plus-circle"
                    size={25}
                    color={colors.tint}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  logoutText: {
    color: '#666',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    height: 55,
    paddingBottom: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});