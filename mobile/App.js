/**
 * DIForM Mobile App
 * React Native application for iOS and Android
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import MSGraphService from './services/MSGraphService';

const Stack = createStackNavigator();

// Home Screen
function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await MSGraphService.getUser();
      setUser(currentUser);
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await MSGraphService.login();
      await checkAuth();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await MSGraphService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>DIForM</Text>
          <Text style={styles.tagline}>Work Done, Not Just Assisted</Text>
        </View>

        {/* Auth Section */}
        {!user ? (
          <View style={styles.authSection}>
            <Icon name="lock" size={64} color="#3B82F6" />
            <Text style={styles.authTitle}>Connect Your Workspace</Text>
            <Text style={styles.authDescription}>
              Sign in with Microsoft 365 to access your emails, calendar, and files
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.primaryButtonText}>Sign In with Microsoft</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* User Info */}
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user.name?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.username}</Text>
              </View>
              <TouchableOpacity onPress={handleLogout}>
                <Icon name="log-out" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Emails')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Icon name="mail" size={24} color="#3B82F6" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Email Management</Text>
                  <Text style={styles.actionDescription}>
                    View, summarize, and draft responses
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Calendar')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Icon name="calendar" size={24} color="#10B981" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Calendar & Meetings</Text>
                  <Text style={styles.actionDescription}>
                    Schedule and manage events
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Files')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#EDE9FE' }]}>
                  <Icon name="folder" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Files & Documents</Text>
                  <Text style={styles.actionDescription}>
                    Access and manage your files
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Demo')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name="zap" size={24} color="#F59E0B" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>AI Assistant</Text>
                  <Text style={styles.actionDescription}>
                    Ask DIForM to execute tasks
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Placeholder screens (to be implemented)
function EmailsScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.placeholderText}>Emails Screen</Text>
    </View>
  );
}

function CalendarScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.placeholderText}>Calendar Screen</Text>
    </View>
  );
}

function FilesScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.placeholderText}>Files Screen</Text>
    </View>
  );
}

function DemoScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.placeholderText}>AI Demo Screen</Text>
    </View>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Emails" component={EmailsScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Files" component={FilesScreen} />
        <Stack.Screen name="Demo" component={DemoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  authSection: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  authDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 9999,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  placeholderText: {
    fontSize: 18,
    color: '#6B7280',
  },
});
