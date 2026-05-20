import React, { useRef, useState } from 'react';
import {
  Animated,
  TextInput,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface EcoInputProps extends TextInputProps {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  error?: string;
  isPassword?: boolean;
}

export function EcoInput({ label, icon, error, isPassword = false, value, onChangeText, ...rest }: EcoInputProps) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(isPassword);

  const borderAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const isFloating = focused || !!value;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    Animated.timing(labelAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    if (!value) {
      Animated.timing(labelAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    }
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.green],
  });

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [17, 6] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 10] });
  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.muted, colors.green],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, { borderColor }]}>
        <Feather name={icon} size={18} color={focused ? colors.green : colors.muted} style={styles.icon} />

        <View style={styles.inner}>
          <Animated.Text style={[styles.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}>
            {label}
          </Animated.Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secure}
            placeholderTextColor="transparent"
            selectionColor={colors.green}
            {...rest}
          />
        </View>

        {isPassword && (
          <Pressable onPress={() => setSecure(s => !s)} hitSlop={8}>
            <Feather name={secure ? 'eye' : 'eye-off'} size={18} color={colors.muted} />
          </Pressable>
        )}
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 16,
    height: 62,
  },
  icon: {
    marginRight: 10,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    fontFamily: fonts.bodyMedium,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    left: 0,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    paddingTop: 16,
    paddingBottom: 4,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.error,
    marginTop: 5,
    marginLeft: 14,
    letterSpacing: 0.5,
  },
});
