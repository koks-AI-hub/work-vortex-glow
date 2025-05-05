
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthState, User, UserRole } from "@/types/auth";
import { useNavigate } from "react-router-dom";

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (userData: any, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const navigate = useNavigate();

  // Simulate checking for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // In a real app, this would verify the session with Supabase
        const savedUser = localStorage.getItem("workVortexUser");
        if (savedUser) {
          setAuthState({
            user: JSON.parse(savedUser),
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
          error: "Failed to restore session",
        });
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setAuthState({ ...authState, isLoading: true, error: null });
    try {
      // Mock login - would be Supabase auth in real app
      const mockUser = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        phone: "+1234567890",
        role,
        ...(role === "company" ? { sector: "Technology" } : { skills: [], experiences: [] }),
      };

      localStorage.setItem("workVortexUser", JSON.stringify(mockUser));
      
      setAuthState({
        user: mockUser,
        isLoading: false,
        error: null,
      });

      navigate(role === "employee" ? "/employee/dashboard" : "/company/dashboard");
    } catch (error) {
      setAuthState({
        ...authState,
        isLoading: false,
        error: "Login failed. Please check your credentials.",
      });
    }
  };

  const register = async (userData: any, role: UserRole) => {
    setAuthState({ ...authState, isLoading: true, error: null });
    try {
      // Mock registration - would be Supabase auth in real app
      const mockUser = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        ...userData,
        role,
        ...(role === "company" ? {} : { skills: [], experiences: [] }),
      };
      
      localStorage.setItem("workVortexUser", JSON.stringify(mockUser));
      
      setAuthState({
        user: mockUser,
        isLoading: false,
        error: null,
      });
      
      navigate(role === "employee" ? "/employee/dashboard" : "/company/dashboard");
    } catch (error) {
      setAuthState({
        ...authState,
        isLoading: false,
        error: "Registration failed. Please try again.",
      });
    }
  };

  const logout = async () => {
    try {
      // Mock logout - would be Supabase auth in real app
      localStorage.removeItem("workVortexUser");
      
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
      
      navigate("/");
    } catch (error) {
      setAuthState({
        ...authState,
        error: "Logout failed",
      });
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!authState.user) return;
      
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem("workVortexUser", JSON.stringify(updatedUser));
      
      setAuthState({
        ...authState,
        user: updatedUser,
      });
    } catch (error) {
      setAuthState({
        ...authState,
        error: "Failed to update profile",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
