import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken } from '../utils/apiClient';

const STORAGE_KEY = 'has_auth_session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ token: null, role: null, user: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setAuthToken(parsed.token);
          setSession(parsed);
        }
      } catch (err) {
        // Corrupt or unreadable session storage shouldn't strand the app on
        // the loading screen forever -- fall back to a signed-out state.
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = async (next) => {
    setAuthToken(next.token);
    setSession(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const staffLogin = async ({ role, email, password }) => {
    const { token, user } = await api.post('/auth/login', { role, email, password });
    await persist({ token, role, user });
    return user;
  };

  const patientLogin = async ({ phone, mrNo }) => {
    const { token, user } = await api.post('/auth/patient-login', { phone, mrNo });
    await persist({ token, role: 'patient', user });
    return user;
  };

  // Registration deliberately does not auto sign the patient in -- the
  // caller shows the newly issued MR No first, then signs in explicitly,
  // so the patient has a moment to note it down before entering the app.
  const registerPatient = async (data) => {
    const { patient } = await api.post('/patients/register', data);
    return patient;
  };

  const refreshUser = async () => {
    if (session.role === 'patient') {
      const { patient } = await api.get('/patients/me');
      await persist({ ...session, user: patient });
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setSession({ token: null, role: null, user: null });
  };

  const value = useMemo(
    () => ({
      ...session,
      isLoading,
      isAuthenticated: !!session.token,
      staffLogin,
      patientLogin,
      registerPatient,
      refreshUser,
      logout,
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
