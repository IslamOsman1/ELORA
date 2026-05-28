import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';
import { clearCustomerToken, getCustomerToken, setCustomerToken } from '../utils/auth';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((response) => setUser(response.data.user))
      .catch(() => {
        clearCustomerToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function persistAuth(payload) {
    setCustomerToken(payload.token);
    setUser(payload.user);
  }

  async function refreshProfile() {
    const response = await api.get('/auth/me');
    setUser(response.data.user);
    return response.data.user;
  }

  async function register(form) {
    const response = await api.post('/auth/customer/register', form);
    persistAuth(response.data);
    return response.data;
  }

  async function login(form) {
    const response = await api.post('/auth/customer/login', form);
    persistAuth(response.data);
    return response.data;
  }

  async function loginWithGoogle(credential) {
    const response = await api.post('/auth/customer/google', { credential });
    if (response.data.token) {
      persistAuth(response.data);
    }
    return response.data;
  }

  async function completeGooglePasswordSetup(setupToken, password) {
    const response = await api.post('/auth/customer/set-password', { setupToken, password });
    persistAuth(response.data);
    return response.data;
  }

  function logout() {
    clearCustomerToken();
    setUser(null);
  }

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        register,
        login,
        loginWithGoogle,
        completeGooglePasswordSetup,
        refreshProfile,
        logout
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return context;
}
