import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check expiry
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          // Fetch full user details
          api.get('/auth/me')
            .then(res => {
               // --- THE FIX IS HERE ---
               const userData = res.data.data;
               
               // We ensure 'tenantId' is always at the top level.
               // If the backend gives us a nested 'tenant' object, we grab the ID from it.
               setUser({
                 ...userData,
                 tenantId: userData.tenant?.id || userData.tenantId
               });
               // -----------------------
            })
            .catch(() => logout())
            .finally(() => setLoading(false));
        }
      } catch (error) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password, subdomain) => {
    try {
      const res = await api.post('/auth/login', { email, password, tenantSubdomain: subdomain });
      const newToken = res.data.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      // Login API usually sends tenantId correctly, but this keeps it consistent
      setUser(res.data.data.user); 
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (data) => {
    try {
      await api.post('/auth/register-tenant', data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;