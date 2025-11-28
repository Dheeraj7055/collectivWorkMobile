// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Loader } from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validateRequired } from '../utils/validation';
import { globalStyles } from '../styles';
import { COLORS } from '../constants/colors';
import { SPACING } from '../themes/spacing';
import Toast from 'react-native-toast-message';
import { LoginResponse } from '@/types/user';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const { login, isLoading, error } = useAuth();

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!validateRequired(email)) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!validateRequired(password)) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const res: LoginResponse = await login({ email, password });

      // ✅ If MFA is required
      if (res?.mfa_enabled) {
        Toast.show({
          type: 'info',
          text1: 'MFA Verification Required',
          text2: 'We’ve sent an OTP to your registered email.',
        });
        // Navigate to OTP screen
        setTimeout(() => {
          navigation.navigate('OtpVerification', { email });
        }, 100);
        return;
      }

      // ✅ Normal login success
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });

      // RootNavigator will detect `isAuthenticated=true` and switch to AppNavigator
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error || 'Please try again.',
      });
    }
  };

  if (isLoading) {
    return <Loader overlay text="Logging in..." />;
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.screenContainer, styles.container]}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={globalStyles.heading1}>Welcome Back</Text>
          <Text style={globalStyles.caption}>
            Sign in to your account to continue
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
  },
  logo: {
    width: 120,
    height: 100,
    marginBottom: SPACING.MD,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: SPACING.MD,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
});
