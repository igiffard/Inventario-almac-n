import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (code: string) => boolean;
  logout: () => void;
  accessCode: string;
  updateAccessCode: (oldCode: string, newCode: string) => boolean;
  resetAccessCode: () => void;
  isSecurityModalOpen: boolean;
  setIsSecurityModalOpen: (open: boolean) => void;
  defaultCode: string;
}

const DEFAULT_UNIVERSAL_CODE = 'FCM2026';
const STORAGE_KEY_AUTH = 'unilab_auth_token_v1';
const STORAGE_KEY_CODE = 'unilab_universal_access_code_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessCode, setAccessCode] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_CODE) || DEFAULT_UNIVERSAL_CODE;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if session token exists
    const token = localStorage.getItem(STORAGE_KEY_AUTH);
    return token === 'authenticated_valid';
  });

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Check URL query parameters on load for auto-login (e.g. ?code=FCM2026 or ?pin=FCM2026)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code') || params.get('pin') || params.get('access') || params.get('clave');
      if (urlCode && urlCode.trim().toUpperCase() === accessCode.trim().toUpperCase()) {
        localStorage.setItem(STORAGE_KEY_AUTH, 'authenticated_valid');
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Error parsing URL query params for auth:', e);
    }
  }, [accessCode]);

  const login = (inputCode: string): boolean => {
    if (inputCode.trim().toUpperCase() === accessCode.trim().toUpperCase()) {
      localStorage.setItem(STORAGE_KEY_AUTH, 'authenticated_valid');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setIsAuthenticated(false);
  };

  const updateAccessCode = (oldCode: string, newCode: string): boolean => {
    if (oldCode.trim().toUpperCase() === accessCode.trim().toUpperCase()) {
      const sanitized = newCode.trim();
      if (sanitized.length < 3) return false;
      setAccessCode(sanitized);
      localStorage.setItem(STORAGE_KEY_CODE, sanitized);
      return true;
    }
    return false;
  };

  const resetAccessCode = () => {
    setAccessCode(DEFAULT_UNIVERSAL_CODE);
    localStorage.setItem(STORAGE_KEY_CODE, DEFAULT_UNIVERSAL_CODE);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        accessCode,
        updateAccessCode,
        resetAccessCode,
        isSecurityModalOpen,
        setIsSecurityModalOpen,
        defaultCode: DEFAULT_UNIVERSAL_CODE
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
