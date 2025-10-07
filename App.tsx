import React from 'react';
import { Provider } from 'react-redux';
import { PaperProvider, Portal } from 'react-native-paper';
import { store } from './src/redux/store';
import { RootNavigator } from './src/navigation';
import { lightTheme } from './src/themes/colors';
import Toast from 'react-native-toast-message';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PaperProvider theme={lightTheme}>
        <Portal.Host>
          <RootNavigator />
          <Toast position="top" topOffset={50} visibilityTime={3000} />
        </Portal.Host>
      </PaperProvider>
    </Provider>
  );
};

export default App;
