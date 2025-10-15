import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING } from '../themes/spacing';
import { Button } from '../components/Button';
import Toast from 'react-native-toast-message';
import { useAppDispatch } from '../redux/hooks';
import { verifyOtp } from '../redux/slices/authSlice';

export const OtpVerificationScreen = ({ route }: any) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputs = useRef<TextInput[]>([]);
  const dispatch = useAppDispatch();

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1].focus();
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete OTP',
        text2: 'Please enter the full 6-digit code.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await dispatch(verifyOtp({ email, otp: code })).unwrap();

      Toast.show({
        type: 'success',
        text1: 'OTP Verified ✅',
        text2: 'You are now logged in.',
      });

      // ✅ RootNavigator will detect isAuthenticated=true and auto-switch to AppNavigator
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: err.message || 'Please check the code and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    // TODO: Implement resend API if backend supports
    Toast.show({
      type: 'info',
      text1: 'OTP Resent',
      text2: 'We’ve sent a new code to your email.',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>OTP Verification 🔐</Text>
        <Text style={styles.subtitle}>
          A verification code has been sent to {'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((value, i) => (
            <TextInput
              key={i}
              ref={(ref) => {
                if (ref) inputs.current[i] = ref;
              }}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={value}
              onChangeText={(t) => handleChange(t, i)}
              autoFocus={i === 0}
            />
          ))}
        </View>

        <Button
          title="Verify OTP"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitBtn}
        />

        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  content: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 8 },
  subtitle: { textAlign: 'center', fontSize: 14, color: '#555', marginBottom: 24 },
  email: { color: '#000', fontWeight: '600' },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 32 },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
  },
  submitBtn: { width: '90%' },
  resendText: { color: COLORS.PRIMARY, marginTop: SPACING.SM },
});
