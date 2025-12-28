import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alarm } from '../types/alarm';
import { RootStackParamList } from '../types/navigation';
import { AlarmService } from '../services/AlarmService';
import { AlarmItem } from '../components/AlarmItem';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { Text } from '../components/Text';
import { View } from '../components/View';
import { colors, spacing } from '../theme';
import { paddingHorizontal } from '../theme/styles';
import { Cactus } from '../components/illustrations/Cactus';
import { FadeInView } from '../components/animations/FadeInView';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AlarmList'>;

export const AlarmListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlarms = useCallback(async () => {
    try {
      const data = await AlarmService.getAllAlarms();
      setAlarms(data);
    } catch (error) {
      console.error('Failed to load alarms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [loadAlarms])
  );

  const handleToggle = async (id: string) => {
    try {
      const updatedAlarm = await AlarmService.toggleAlarm(id);
      setAlarms((prev) =>
        prev.map((a) => (a.id === id ? updatedAlarm : a))
      );
    } catch (error) {
      console.error('Failed to toggle alarm:', error);
    }
  };

  const handlePress = (id: string) => {
    navigation.navigate('AlarmEdit', { alarmId: id });
  };

  const handleAdd = () => {
    navigation.navigate('AlarmEdit', {});
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAlarms();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlarmItem
            alarm={item}
            onToggle={handleToggle}
            onPress={handlePress}
          />
        )}
        contentContainerStyle={styles.listContent}
        getItemLayout={(data, index) => (
          { length: 100, offset: 100 * index, index }
        )}
        maxToRenderPerBatch={10}
        windowSize={10}
        ListEmptyComponent={
          <FadeInView style={styles.emptyState} duration={500}>
            <Cactus size={150} color={colors.primary} />
            <Text variant="h2" tx="alarm.noAlarms" style={styles.emptyTitle} />
            <Text variant="body" tx="alarm.addFirst" color="textSecondary" />
          </FadeInView>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
      <FloatingActionButton onPress={handleAdd} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...paddingHorizontal(spacing.xl),
  },
  emptyTitle: {
    marginBottom: spacing.sm,
  },
});
