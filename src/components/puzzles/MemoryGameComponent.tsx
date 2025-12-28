import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../Text';
import { Button } from '../Button';
import { DifficultyLevel } from '../../types/alarm';
import { generateMemoryCards, MemoryCard } from '../../utils/puzzleGenerators';
import { colors, spacing } from '../../theme';
import { flexRow } from '../../theme/styles';
import { lightImpact, notificationSuccess } from '../../utils/haptics';

interface MemoryGameComponentProps {
  difficulty: DifficultyLevel;
  onComplete: () => void;
  onCancel?: () => void;
}

interface CardProps {
  item: MemoryCard;
  index: number;
  isFlipped: boolean;
  cardSize: number;
  onPress: (index: number) => void;
  t: any;
}

const Card = React.memo(({ item, index, isFlipped, cardSize, onPress, t }: CardProps) => (
  <TouchableOpacity
    style={[
      styles.card,
      { 
        width: cardSize, 
        height: cardSize,
        backgroundColor: isFlipped ? colors.surface : colors.primary 
      }
    ]}
    onPress={() => onPress(index)}
    activeOpacity={0.8}
    accessibilityLabel={t('accessibility.memoryCard', { index: index + 1, status: isFlipped ? item.value : 'hidden' })}
  >
    {isFlipped ? (
      <Text style={styles.cardEmoji}>{item.value}</Text>
    ) : (
      <Text tx="puzzles.memory.flip" style={styles.cardBackText} />
    )}
  </TouchableOpacity>
));

export const MemoryGameComponent: React.FC<MemoryGameComponentProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setCards(generateMemoryCards(difficulty));
  }, [difficulty]);

  useEffect(() => {
    if (cards.length > 0 && matchedPairs === cards.length / 2) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [matchedPairs, cards.length, onComplete]);

  const handleCardPress = useCallback((index: number) => {
    if (isProcessing || cards[index].matched || flippedIndices.includes(index)) {
      return;
    }

    lightImpact();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setMoves(m => m + 1);
      
      const [firstIndex, secondIndex] = newFlipped;
      
      if (cards[firstIndex].value === cards[secondIndex].value) {
        // Match found
        setTimeout(() => {
          notificationSuccess();
          const newCards = [...cards];
          newCards[firstIndex].matched = true;
          newCards[secondIndex].matched = true;
          setCards(newCards);
          setFlippedIndices([]);
          setMatchedPairs(m => m + 1);
          setIsProcessing(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  }, [cards, flippedIndices, isProcessing]);

  const numColumns = difficulty === DifficultyLevel.EASY ? 2 : 3;
  const cardSize = (Dimensions.get('window').width - (spacing.md * 2) - (spacing.sm * (numColumns - 1))) / numColumns;

  const renderCard = useCallback(({ item, index }: { item: MemoryCard; index: number }) => {
    const isFlipped = flippedIndices.includes(index) || item.matched;
    
    return (
      <Card
        item={item}
        index={index}
        isFlipped={isFlipped}
        cardSize={cardSize}
        onPress={handleCardPress}
        t={t}
      />
    );
  }, [flippedIndices, cardSize, handleCardPress, t]);

  return (
    <View style={styles.container}>
      <Text tx="puzzles.memory.title" variant="h2" style={styles.title} />
      <Text tx="puzzles.memory.instruction" style={styles.instruction} />
      
      <View style={[styles.statsContainer, flexRow()]}>
        <Text tx="puzzles.memory.moves" txOptions={{ count: moves }} style={styles.statsText} />
      </View>

      {matchedPairs === cards.length / 2 && cards.length > 0 && (
        <Text tx="puzzles.memory.success" style={styles.successText} />
      )}

      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`grid-${numColumns}`} // Force re-render when columns change
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
      
      {onCancel && (
        <Button
          tx="common.cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.cancelButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  instruction: {
    marginBottom: spacing.md,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  statsContainer: {
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  successText: {
    textAlign: 'center',
    color: colors.success,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  grid: {
    paddingBottom: spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardBackText: {
    color: colors.surface,
    fontSize: 12,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: spacing.md,
  },
});
