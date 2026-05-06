import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography } from '../../constants';

const APP_VERSION = '1.0.0';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={Colors.gradient.all}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.heroTopBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-forward" size={22} color={Colors.text.white} />
            </TouchableOpacity>
            <Text style={styles.heroTitle}>عن التطبيق</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Logo */}
          <View style={styles.logoTile}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appName}>عنان لينك</Text>
          <Text style={styles.tagline}>بوابتك لكل الفرص التقنية في المملكة</Text>
          <Text style={styles.version}>الإصدار {APP_VERSION}</Text>
        </LinearGradient>

        {/* About card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>قصة التطبيق</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>عنان لينك</Text> فكرة وُلدت من تجربتنا الشخصية
            كطلاب في تخصص علوم الحاسب. لاحظنا كيف يضيع الكثير من زملائنا — خصوصاً
            الطلاب الجدد (المستوى الأول والثاني) — في رحلة البحث عن فرص تقنية حقيقية،
            بين هاكاثونات متناثرة، تدريبات تعاونية مخفية في منصات مختلفة، ومشاريع
            مفتوحة المصدر يصعب الوصول إليها.
          </Text>
          <Text style={styles.bodyText}>
            بنينا التطبيق ليكون <Text style={styles.bold}>المنصة الموحّدة</Text> التي كنّا نتمنّى
            وجودها عندما بدأنا — تجمع الفرص في مكان واحد، تربطها بمسارك المهني، وتحوّل
            رحلة التعلم إلى تجربة محفّزة وممتعة عبر نظام نقاط الخبرة (XP) والإنجازات.
          </Text>
        </View>

        {/* Features card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ماذا يقدّم التطبيق؟</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as any} size={20} color={Colors.primary.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Team card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>الفريق</Text>
          <Text style={styles.bodyText}>
            تطبيق <Text style={styles.bold}>عنان لينك</Text> من تطوير طالبَين في تخصص
            علوم الحاسب — جامعة الإمام عبدالرحمن بن فيصل (IAU). بدأ المشروع كفكرة
            دراسية وتحوّل إلى أداة نأمل أن تخدم آلاف الطلاب السعوديين في رحلتهم التقنية.
          </Text>
        </View>

        {/* Mission card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>هدفنا</Text>
          <Text style={styles.bodyText}>
            نؤمن أنّ كل طالب سعودي يستحق الوصول إلى الفرص التي تساعده على بناء
            مستقبله التقني. هدفنا أن يصبح <Text style={styles.bold}>عنان لينك</Text>
            {' '}الرفيق الأول لكل طالب علوم حاسب — من اليوم الأول في الجامعة، حتى
            تخرّجه ودخوله سوق العمل.
          </Text>
          <View style={styles.missionRow}>
            <Text style={styles.missionStat}>+127</Text>
            <Text style={styles.missionLabel}>فرصة حقيقية</Text>
          </View>
          <View style={styles.missionRow}>
            <Text style={styles.missionStat}>9</Text>
            <Text style={styles.missionLabel}>مسارات تقنية</Text>
          </View>
          <View style={styles.missionRow}>
            <Text style={styles.missionStat}>+45</Text>
            <Text style={styles.missionLabel}>مشروع مفتوح المصدر مُختار بعناية</Text>
          </View>
        </View>

        {/* Contact card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>تواصل معنا</Text>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:hello@ananlink.app').catch(() => {})}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.text.muted} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactValue}>hello@ananlink.app</Text>
              <Text style={styles.contactLabel}>البريد الإلكتروني</Text>
            </View>
            <View style={styles.featureIcon}>
              <Ionicons name="mail-outline" size={20} color={Colors.primary.purple} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          صُنع بـ 💜 في المملكة العربية السعودية
        </Text>
        <Text style={styles.footerSmall}>© 2026 AnanLink</Text>
      </ScrollView>
    </View>
  );
};

const FEATURES = [
  { icon: 'compass-outline', title: 'استكشاف الفرص', desc: 'هاكاثونات، تدريبات، فرص تطوع، ومشاريع مفتوحة المصدر — كلها في مكان واحد.' },
  { icon: 'school-outline', title: 'مسارات تعلم مخصّصة', desc: 'اختر مسارك المهني، وسنريك المهارات التي تحتاجها.' },
  { icon: 'trophy-outline', title: 'نظام XP وإنجازات', desc: 'كل خطوة تتقدّمها = نقاط خبرة. تنافس مع زملائك وارتقِ بمستواك.' },
  { icon: 'qr-code-outline', title: 'مسح QR للتسجيل', desc: 'سجّل حضورك في الفعاليات بمسح رمز سريع.' },
  { icon: 'map-outline', title: 'خريطة تفاعلية', desc: 'اكتشف الفرص القريبة من موقعك جغرافياً.' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },

  hero: {
    paddingHorizontal: 20, paddingBottom: 32,
    alignItems: 'center',
  },
  heroTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', marginBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.white,
  },
  logoTile: {
    width: 120, height: 120, borderRadius: 28,
    backgroundColor: Colors.text.white,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16,
    elevation: 8,
  },
  logo: { width: 88, height: 88 },
  appName: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize['2xl'],
    color: Colors.text.white,
  },
  tagline: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4, textAlign: 'center',
  },
  version: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },

  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16, padding: 18,
    marginHorizontal: 16, marginTop: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary, textAlign: 'right',
    marginBottom: 10,
  },
  bodyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    textAlign: 'right',
    lineHeight: Typography.fontSize.sm * 1.85,
    marginBottom: 10,
  },
  bold: { fontFamily: Typography.fontFamily.bold, color: Colors.primary.purple },

  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8,
  },
  featureIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.opportunity.hackathonLight,
    alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, textAlign: 'right',
  },
  featureDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, textAlign: 'right',
    marginTop: 2, lineHeight: Typography.fontSize.xs * 1.6,
  },

  missionRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 8,
    marginTop: 6,
  },
  missionStat: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.primary.purple, minWidth: 50, textAlign: 'right',
  },
  missionLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },

  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8,
  },
  contactValue: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, textAlign: 'right',
  },
  contactLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, textAlign: 'right',
  },

  footer: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center', marginTop: 22,
  },
  footerSmall: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.muted,
    textAlign: 'center', marginTop: 4,
  },
});

export default AboutScreen;
