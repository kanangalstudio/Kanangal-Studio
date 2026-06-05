import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { studioAPI } from './api';
import api from './api';
import { useAuth } from './AuthContext';

const GlobalContext = createContext(null);

export function GlobalProvider({ children }) {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(0);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      setPendingRequests(prev => prev + 1);
      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        setPendingRequests(prev => Math.max(0, prev - 1));
        return response;
      },
      (error) => {
        setPendingRequests(prev => Math.max(0, prev - 1));
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const loadFamilies = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await studioAPI.getFamilies();
      setFamilies(response.data.families || []);
    } catch (e) {
      console.error("Failed to load families", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFamilies();
  }, [loadFamilies]);

  const refreshFamilies = () => loadFamilies();

  return (
    <GlobalContext.Provider value={{ families, loading, refreshFamilies, setPendingRequests }}>
      {pendingRequests > 0 && !authLoading && (
        <div className="loader-overlay">
          <div className="loader-spinner"></div>
          <div className="loader-logo">KANANGAL</div>
          <div className="top-progress" style={{ width: '40%' }}></div>
        </div>
      )}
      {children}
    </GlobalContext.Provider>
  );
}

export const useGlobal = () => useContext(GlobalContext);
