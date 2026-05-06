import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Strings, SKILL_TRACKS } from '../../constants';
import { ProfileStackParamList } from '../../types';
import { GradientHeader } from '../../components/common';
import { SkillTrackCard } from '../../components/profile';
import { useAllSkillProgress } from '../../hooks/useSkillProgress';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const SkillPathListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { counts, unlockStates, refresh } = useAllSkillProgress();

  useFocusEffect(
    React.useCallback(() => { refresh(); }, [refresh])
  );

  return (
    <View style={styles.container}>
      <GradientHeader
        title={Strings.skillPath.title}
        showBack
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={SKILL_TRACKS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <SkillTrackCard
            track={item}
            completed={counts[item.id] ?? 0}
            unlocked={unlockStates[item.id] ?? false}
            onPress={() => navigation.navigate('SkillPathDetail', { trackId: item.id })}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  listContent: { padding: 16 },
});

export default SkillPathListScreen;
