// src/navigation/index.tsx
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { AuthNavigator } from './AuthNavigator';
// import { AppNavigator } from './AppNavigator';
// import { useAuth } from '../hooks/useAuth';
// import { Loader } from '../components/Loader';

// export const RootNavigator: React.FC = () => {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     return <Loader overlay text="Loading..." />;
//   }

//   return (
//     <NavigationContainer>
//       {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
//     </NavigationContainer>
//   );
// };
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/Loader';
import { OtpVerificationScreen } from '../screens/OtpVerificationScreen';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, mfaPending, mfaEmail } = useAuth();
  console.log(mfaPending);
  console.log(mfaEmail);

  if (isLoading) {
    return <Loader overlay text="Loading..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppNavigator />
      ) : mfaPending && mfaEmail ? (
        <OtpVerificationScreen route={{ params: { email: mfaEmail } }} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
