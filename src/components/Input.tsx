// src/components/Input.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING } from '../themes/spacing';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputStyle = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    disabled && styles.inputDisabled,
    multiline && styles.inputMultiline,
    style,
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor={COLORS.TEXT_DISABLED}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.MD,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  
  inputContainer: {
    position: 'relative',
  },
  
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: SPACING.BORDER_RADIUS.MD,
    padding: SPACING.COMPONENT.INPUT_PADDING,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.WHITE,
    minHeight: 48,
  },
  
  inputFocused: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: COLORS.ERROR,
    borderWidth: 2,
  },
  
  inputDisabled: {
    backgroundColor: COLORS.GRAY_LIGHT,
    color: COLORS.TEXT_DISABLED,
  },
  
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  eyeIcon: {
    position: 'absolute',
    right: SPACING.MD,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  
  eyeText: {
    fontSize: 20,
  },
  
  errorText: {
    fontSize: 14,
    color: COLORS.ERROR,
    marginTop: SPACING.XS,
  },
});