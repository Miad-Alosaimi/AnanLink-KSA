import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Typography, Strings } from '../../constants';
import { User } from '../../types';
import { getUserById } from '../../database/db';
import { useAuth } from '../../context';
import { LoadingSpinner } from '../../components/common';

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { userId, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      getUserById(userId).then((u) => {
        setUser(u);
        setIsLoading(false);
      });
    }
  }, [userId]);

  const handleLogout = () => {
    Alert.alert('', Strings.profile.logoutConfirm, [
      { text: Strings.profile.logoutNo, style: 'cancel' },
      { text: Strings.profile.logoutYes, style: 'destructive', onPress: logout },
    ]);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.primary.purple, Colors.primary.teal]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <Text style={styles.headerTitle}>{Strings.profile.title}</Text>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>{user.university}</Text>
              <View style={styles.infoLabel}>
                <Ionicons name="school-outline" size={16} color={Colors.primary.purple} />
                <Text style={styles.infoLabelText}>{Strings.profile.university}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>{user.major}</Text>
              <View style={styles.infoLabel}>
                <Ionicons name="book-outline" size={16} color={Colors.primary.purple} />
                <Text style={styles.infoLabelText}>{Strings.profile.major}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>السنة {user.academicYear}</Text>
              <View style={styles.infoLabel}>
                <Ionicons name="layers-outline" size={16} color={Colors.primary.purple} />
                <Text style={styles.infoLabelText}>السنة الدراسية</Text>
              </View>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>{Strings.profile.logout}</Text>
            <Ionicons name="log-out-outline" size={20} color={Colors.status.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  header: { paddingHorizontal: 20, paddingBottom: 36, alignItems: 'center' },
  headerTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: '#fff', alignSelf: 'flex-end', marginBottom: 20 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  avatarText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: '#fff' },
  name: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: '#fff', marginBottom: 4 },
  email: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.8)' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  infoCard: {
    backgroundColor: Colors.background.card, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    marginBottom: 20,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLabelText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm, color: Colors.text.secondary },
  infoValue: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right', flex: 1 },
  divider: { height: 1, backgroundColor: Colors.ui.divider, marginVertical: 12 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
    backgroundColor: Colors.background.card, borderRadius: 14, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  logoutText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.status.error },
});

export default ProfileScreen;
