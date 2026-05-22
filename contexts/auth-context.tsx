"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  getPublicProfile: (userId: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    });
    const data = await response.json();
    setUser(data.user || null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await response.json();

        if (mounted) {
          setUser(data.user || null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  const getPublicProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profiles/${userId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error("Error fetching public profile:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        isLoading,
        refreshProfile,
        getPublicProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
