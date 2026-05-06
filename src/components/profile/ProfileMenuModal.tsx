import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Typography, Strings } from '../../constants';
import { useNotificationsPref } from '../../utils/userPreferences';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onEditProfile?: () => void;
  onBookmarks?: () => void;
  onMyQR?: () => void;
  onAbout?: () => void;
}

/**
 * Slide-up action sheet triggered by the ⋯ icon in the profile hero.
 * Items:
 *  - Edit profile (push)
 *  - Bookmarks (push)
 *  - Notifications (inline toggle, no push)
 *  - About (push)
 *  - Logout (destructive)
 */
export const ProfileMenuModal: React.FC<Props> = ({
  visible,
  onClose,
  onLogout,
  onEditProfile,
  onBookmarks,
  onMyQR,
  onAbout,
}) => {
  const insets = useSafeAreaInsets();
  const { enabled: notifEnabled, toggle: toggleNotif } = useNotificationsPref();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.handle} />
              <Text style={styles.title}>خيارات الحساب</Text>

              {/* Edit profile (navigates) */}
              <Pressable
                onPress={() => { onClose(); onEditProfile?.(); }}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed, styles.rowBorder]}
              >
                <Ionicons name="chevron-back" size={18} color={Colors.text.muted} />
                <Text style={styles.rowLabel}>{Strings.profile.editProfile}</Text>
                <View style={styles.iconCircle}>
                  <Ionicons name="person-outline" size={20} color={Colors.primary.purple} />
                </View>
              </Pressable>

              {/* Bookmarks (navigates) */}
              <Pressable
                onPress={() => { onClose(); onBookmarks?.(); }}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed, styles.rowBorder]}
              >
                <Ionicons name="chevron-back" size={18} color={Colors.text.muted} />
                <Text style={styles.rowLabel}>{Strings.profile.bookmarks}</Text>
                <View style={styles.iconCircle}>
                  <Ionicons name="bookmark-outline" size={20} color={Colors.primary.purple} />
                </View>
              </Pressable>

              {/* My QR (navigates) */}
              <Pressable
                onPress={() => { onClose(); onMyQR?.(); }}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed, styles.rowBorder]}
              >
                <Ionicons name="chevron-back" size={18} color={Colors.text.muted} />
                <Text style={styles.rowLabel}>رمز QR الخاص بي</Text>
                <View style={styles.iconCircle}>
                  <Ionicons name="qr-code-outline" size={20} color={Colors.primary.purple} />
                </View>
              </Pressable>

              {/* Notifications (inline switch, no navigation) */}
              <View style={[styles.row, styles.rowBorder]}>
                <Switch
                  value={notifEnabled}
                  onValueChange={(v) => toggleNotif(v)}
                  trackColor={{ false: Colors.ui.border, true: Colors.primary.purple }}
                  thumbColor={Colors.text.white}
                  ios_backgroundColor={Colors.ui.border}
                />
                <Text style={styles.rowLabel}>{Strings.profile.notifications}</Text>
                <View style={styles.iconCircle}>
                  <Ionicons name="notifications-outline" size={20} color={Colors.primary.purple} />
                </View>
              </View>

              {/* About (navigates) */}
              <Pressable
                onPress={() => { onClose(); onAbout?.(); }}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed, styles.rowBorder]}
              >
                <Ionicons name="chevron-back" size={18} color={Colors.text.muted} />
                <Text style={styles.rowLabel}>{Strings.profile.about}</Text>
                <View style={styles.iconCircle}>
                  <Ionicons name="information-circle-outline" size={20} color={Colors.primary.purple} />
                </View>
              </Pressable>

              {/* Logout (destructive) */}
              <Pressable
                onPress={() => { onClose(); onLogout(); }}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Ionicons name="chevron-back" size={18} color={Colors.text.muted} />
                <Text style={[styles.rowLabel, { color: Colors.status.error }]}>
                  {Strings.profile.logout}
                </Text>
                <View style={[styles.iconCircle, { backgroundColor: '#FFE4EA' }]}>
                  <Ionicons name="log-out-outline" size={20} color={Colors.status.error} />
                </View>
              </Pressable>

              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelButton}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12,
  },
  handle: {
    width: 42, height: 4, borderRadius: 2,
    backgroundColor: Colors.ui.border,
    alignSelf: 'center', marginBottom: 16,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    textAlign: 'center', marginBottom: 8,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14,
  },
  rowPressed: { opacity: 0.5 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.ui.divider },
  iconCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.opportunity.hackathonLight,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  cancelButton: {
    marginTop: 8, paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.ui.divider, alignItems: 'center',
  },
  cancelText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
});

export default ProfileMenuModal;
