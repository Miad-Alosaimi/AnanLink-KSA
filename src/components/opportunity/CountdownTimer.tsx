import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants';
import { Strings } from '../../constants/strings';

interface CountdownTimerProps {
  deadline: string | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!deadline) return;

    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return null;

  if (!timeLeft) {
    return (
      <View style={styles.container}>
        <Text style={styles.endedText}>{Strings.opportunities.countdown.ended}</Text>
      </View>
    );
  }

  const boxes = [
    { value: timeLeft.days, label: Strings.opportunities.countdown.days },
    { value: timeLeft.hours, label: Strings.opportunities.countdown.hours },
    { value: timeLeft.minutes, label: Strings.opportunities.countdown.minutes },
  ];

  return (
    <View style={styles.container}>
      {boxes.map((box, idx) => (
        <React.Fragment key={idx}>
          <View style={styles.box}>
            <Text style={styles.value}>{String(box.value).padStart(2, '0')}</Text>
            <Text style={styles.label}>{box.label}</Text>
          </View>
          {idx < boxes.length - 1 && <Text style={styles.colon}>:</Text>}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  box: {
    backgroundColor: Colors.background.app,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 64,
  },
  value: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['2xl'],
    color: Colors.primary.purple,
  },
  label: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  colon: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.primary.purple,
    marginBottom: 12,
  },
  endedText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.status.error,
  },
});

export default CountdownTimer;
