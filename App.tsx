import React from 'react';
import { Provider } from 'react-redux';
import { PaperProvider, Portal } from 'react-native-paper';
import { store } from './src/redux/store';
import { RootNavigator } from './src/navigation';
import { lightTheme } from './src/themes/colors';
import Toast, { BaseToast } from 'react-native-toast-message';
import NoInternetBar from '@/components/NoInternetBar';
const toastConfig = {
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'red' }}
      text1NumberOfLines={0}  // unlimited lines
      text2NumberOfLines={0}  // unlimited lines
      text1Style={{
        fontSize: 14,
        fontWeight: '500',
        flexWrap: 'wrap',
      }}
      text2Style={{
        fontSize: 13,
        flexWrap: 'wrap',
      }}
    />

  ),
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PaperProvider theme={lightTheme}>
        <Portal.Host>
          <NoInternetBar />
          <RootNavigator />
          <Toast position="top" topOffset={70} config={toastConfig} visibilityTime={3000} />
        </Portal.Host>
      </PaperProvider>
    </Provider>
  );
};

export default App;
