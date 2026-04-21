import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Typography } from '../../constants';
import { ProfileStackParamList } from '../../types';
import { getSkillProgress, saveSkillProgress } from '../../database/queries/skillProgressQueries';
import { useAuth } from '../../context/AuthContext';

type Route = RouteProp<ProfileStackParamList, 'SkillPathDetail'>;

const UNIT_DATA: Record<string, { title: string; desc: string; hours: number }[]> = {
  ai: [
    { title: 'مقدمة في الذكاء الاصطناعي', desc: 'نظرة عامة على مفاهيم AI ومجالات تطبيقاتها', hours: 3 },
    { title: 'أساسيات Python للبيانات', desc: 'Numpy, Pandas, Matplotlib', hours: 5 },
    { title: 'تعلم الآلة الأساسي', desc: 'Supervised & Unsupervised Learning', hours: 8 },
    { title: 'شبكات عصبية عميقة', desc: 'TensorFlow & PyTorch', hours: 10 },
    { title: 'معالجة اللغة الطبيعية', desc: 'NLP مع HuggingFace Transformers', hours: 8 },
    { title: 'رؤية حاسوبية', desc: 'OpenCV & CNN للصور', hours: 7 },
    { title: 'مشروع تطبيقي', desc: 'بناء نموذج AI متكامل', hours: 12 },
    { title: 'النشر والإنتاج', desc: 'Model Serving & API Deployment', hours: 6 },
  ],
  mobile: [
    { title: 'مقدمة React Native', desc: 'إعداد البيئة ومفاهيم JSX', hours: 4 },
    { title: 'المكونات الأساسية', desc: 'View, Text, Image, TouchableOpacity', hours: 4 },
    { title: 'التنقل بين الشاشات', desc: 'React Navigation Stack & Tab', hours: 5 },
    { title: 'إدارة الحالة', desc: 'useState, useContext, Redux Toolkit', hours: 6 },
    { title: 'التخزين المحلي', desc: 'AsyncStorage & SQLite', hours: 4 },
    { title: 'الاتصال بالخوادم', desc: 'REST APIs مع Axios & React Query', hours: 5 },
    { title: 'Animations', desc: 'Animated API & Reanimated', hours: 6 },
    { title: 'الاختبار والنشر', desc: 'Jest & Expo EAS Build', hours: 5 },
    { title: 'أداء التطبيق', desc: 'Profiling & Optimization', hours: 4 },
    { title: 'مشروع متكامل', desc: 'تطبيق كامل من الصفر', hours: 15 },
  ],
};

const DEFAULT_UNITS = [
  { title: 'الوحدة الأولى', desc: 'المفاهيم الأساسية', hours: 4 },
  { title: 'الوحدة الثانية', desc: 'التطبيقات العملية', hours: 6 },
  { title: 'الوحدة الثالثة', desc: 'المشاريع التطبيقية', hours: 8 },
];

const SkillPathDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();

  const { trackId } = route.params;
  const units = UNIT_DATA[trackId] ?? DEFAULT_UNITS;
  const [completedUnits, setCompletedUnits] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted progress on mount
  useEffect(() => {
    if (!userId) { setIsLoaded(true); return; }
    getSkillProgress(userId, trackId).then(saved => {
      setCompletedUnits(saved);
      setIsLoaded(true);
    });
  }, [userId, trackId]);

  const toggleUnit = useCallback(async (idx: number) => {
    const updated = completedUnits.includes(idx)
      ? completedUnits.filter(i => i !== idx)
      : [...completedUnits, idx];
    setCompletedUnits(updated);
    if (userId) {
      await saveSkillProgress(userId, trackId, updated);
    }
  }, [completedUnits, userId, trackId]);

  if (!isLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.end]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المسار التعليمي</Text>
        <Text style={styles.headerSub}>{completedUnits.length}/{units.length} وحدة مكتملة</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(completedUnits.length / units.length) * 100}%` }]} />
        </View>
      </LinearGradient>

      <FlatList
        data={units}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isDone = completedUnits.includes(index);
          return (
            <View style={[styles.unitCard, isDone && styles.unitCardDone]}>
              <TouchableOpacity onPress={() => toggleUnit(index)} style={styles.checkBtn}>
                <Ionicons
                  name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={isDone ? Colors.status.success : Colors.ui.border}
                />
              </TouchableOpacity>
              <View style={styles.unitInfo}>
                <Text style={[styles.unitTitle, isDone && styles.unitTitleDone]}>{item.title}</Text>
                <Text style={styles.unitDesc}>{item.desc}</Text>
                <View style={styles.hoursRow}>
                  <Ionicons name="time-outline" size={12} color={Colors.text.secondary} />
                  <Text style={styles.hoursText}>{item.hours} ساعة</Text>
                </View>
              </View>
              <View style={[styles.unitNum, { backgroundColor: isDone ? Colors.status.success + '22' : Colors.ui.inputBg }]}>
                <Text style={[styles.unitNumText, { color: isDone ? Colors.status.success : Colors.text.secondary }]}>{index + 1}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  header: { paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center', gap: 6 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  headerTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: Colors.text.white },
  headerSub: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.8)' },
  progressTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%', backgroundColor: Colors.text.white, borderRadius: 3 },
  listContent: { padding: 16, gap: 12 },
  unitCard: {
    backgroundColor: Colors.background.card, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  unitCardDone: { backgroundColor: Colors.status.success + '0A' },
  checkBtn: {},
  unitInfo: { flex: 1 },
  unitTitle: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right' },
  unitTitleDone: { textDecorationLine: 'line-through', color: Colors.text.secondary },
  unitDesc: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.text.secondary, textAlign: 'right', marginTop: 2 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 4 },
  hoursText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary },
  unitNum: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  unitNumText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.base },
});

export default SkillPathDetailScreen;
