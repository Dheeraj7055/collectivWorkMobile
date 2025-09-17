CollectivWork Mobile App
========================

A React Native mobile app for HRMS/CRM portal, built with Redux Toolkit, Axios API integration, and persistent authentication using AsyncStorage.

--------------------------------
Features
--------------------------------
- Authentication Flow
  - Login with API
  - Token + RefreshToken stored in AsyncStorage
  - Auto restore session on app restart
  - Logout clears tokens

- API Integration
  - Axios client with interceptors
  - Token automatically added in headers
  - Error logging for requests & responses

- State Management
  - Redux Toolkit
  - Async thunks for API calls
  - Error handling with rejectWithValue

- Environment Support
  - .env file using react-native-dotenv
  - Separate Dev and Prod base URLs

--------------------------------
Project Structure
--------------------------------
src/
 ├── components/       (UI components)
 ├── screens/          (Screens: Login, Dashboard, etc.)
 ├── redux/            (Redux store & slices)
 │    └── slices/      (authSlice.ts: authentication logic)
 ├── services/         (API services: authService, api.ts)
 ├── utils/            (Helpers: cryptoHelpers.ts)
 ├── constants/        (App constants)
 └── types/            (TypeScript types)

--------------------------------
Setup & Installation
--------------------------------
1. Clone repo
   git clone https://github.com/your-org/collectivwork-mobile.git
   cd collectivwork-mobile

2. Install dependencies
   npm install
   OR
   yarn install

3. Setup environment variables
   Create a .env file at root:
   API_BASE_URL=https://dev.collectivwork.com/api

4. Run Metro Bundler
   npm start

5. Run on Android
   npm run android

6. Run on iOS (Mac only)
   npm run ios

--------------------------------
Authentication Flow Example
--------------------------------
Login and Store Token:
.addCase(loginUser.fulfilled, (state, action) => {
  state.isLoading = false;
  state.token = action.payload.token;
  state.refreshToken = action.payload.refreshToken || null;
  state.user = action.payload.user || null;
  state.isAuthenticated = true;

  AsyncStorage.setItem('token', action.payload.token);
  if (action.payload.refreshToken) {
    AsyncStorage.setItem('refreshToken', action.payload.refreshToken);
  }
});

Restore Session:
export const restoreSessionThunk = createAsyncThunk(
  'auth/restoreSession',
  async () => {
    const token = await AsyncStorage.getItem('token');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (token) {
      return { token, refreshToken };
    }
    return null;
  }
);

Logout and Clear Token:
.addCase(logoutUser.fulfilled, (state) => {
  state.user = null;
  state.token = null;
  state.refreshToken = null;
  state.isAuthenticated = false;

  AsyncStorage.removeItem('token');
  AsyncStorage.removeItem('refreshToken');
});

--------------------------------
Debugging API Calls
--------------------------------
All requests & responses are logged in Metro console:

[API REQUEST] POST https://dev.collectivwork.com/api/users/login
Payload: {"payload":"encoded-data"}

[API RESPONSE] 200 https://dev.collectivwork.com/api/users/login
Response: { token: "...", refreshToken: "..." }

--------------------------------
Tech Stack
--------------------------------
- React Native (0.73.x)
- Redux Toolkit
- Axios
- AsyncStorage
- TypeScript
- React Navigation

--------------------------------
Next Steps
--------------------------------
- Add refresh token interceptor for auto token renewal
- Add unit tests for slices & services
- Add CI/CD pipeline for builds
