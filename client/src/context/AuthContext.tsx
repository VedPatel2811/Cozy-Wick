import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import { refreshAccessToken } from "../services/auth";

type User = { id: string, email?: string, name?: string };
type AuthContextType = { user: User | null, accessToken: string | null, setAccessToken: (t: string|null)=>void, logout: ()=>void };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // axios interceptor attach access token
  useEffect(() => {
    const req = api.interceptors.request.use(async (config) => {
      if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    });

    const resInterceptor = api.interceptors.response.use(
      r => r,
      async err => {
        if (err.response?.status === 401) {
          // try refresh once
          try {
            const newAccess = await refreshAccessToken();
            setAccessToken(newAccess);
            err.config.headers["Authorization"] = `Bearer ${newAccess}`;
            return api.request(err.config);
          } catch (refreshErr) {
            setAccessToken(null);
            setUser(null);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(req);
      api.interceptors.response.eject(resInterceptor);
    }
  }, [accessToken]);

  // helper for setting token + user
  const setTokenAndUser = (token: string | null) => {
    setAccessToken(token);
    if (token) {
      const decoded: any = jwtDecode(token);
      setUser({ id: decoded.sub, email: decoded.email, name: decoded.name });
    } else {
      setUser(null);
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setTokenAndUser(null);
  };

  return <AuthContext.Provider value={{ user, accessToken, setAccessToken: setTokenAndUser, logout }}>{children}</AuthContext.Provider>
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
