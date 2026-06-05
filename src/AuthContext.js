import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from './Firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { studioAPI } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          // Backend verification
          const response = await studioAPI.login();
          setStudio(response.data.studio);
          setUser(user);
        } catch (e) {
          console.error("Auth verification failed:", e);
          const status = e.response?.status;
          let msg = e.response?.data?.error || "Not authorized - Contact Kanangal to get access";
          
          if (!e.response) {
            msg = "Backend server is down or unreachable. Please check if your API is running.";
          }
          
          setError(msg);
          await signOut(auth);
          setUser(null);
          setStudio(null);
        }
      } else {
        setUser(null);
        setStudio(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Login failed", e);
      let msg = e.message;
      if (msg.includes('PERMISSIONS_DENIED') || msg.includes('People API')) {
        msg = "People API not enabled for project 882267028011. Please contact the administrator.";
      }
      setError(msg);
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, studio, loading, error, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
