// JWT Authentication Service
// Pure client-side JWT auth with localStorage persistence, timeout handling, and demo support.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const TOKEN_KEY = 'uc_auth_token';
const USER_KEY = 'uc_auth_user';
const FETCH_TIMEOUT_MS = 3500;

const listeners = new Set();

function notifyAuthState(user) {
  listeners.forEach((callback) => {
    try {
      callback(user);
    } catch {
      // ignore callback error
    }
  });
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getIdToken() {
  return getToken();
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function loginWithEmail(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      const msg = data?.error?.message || 'Login failed. Please check your credentials.';
      throw new Error(msg);
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    notifyAuthState(data.user);
    return data.user;
  } catch (error) {
    // If backend is unreachable, timed out, or paused
    const isNetworkError =
      error.name === 'AbortError' ||
      error.message.includes('fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('aborted');

    if (isNetworkError) {
      // Seamless demo user login support
      if (normalizedEmail === 'test@urbancompany.com' && (password === 'password123' || password === 'password')) {
        const demoUser = {
          id: 'usr_mock_alex',
          name: 'Alex Johnson',
          email: 'test@urbancompany.com',
          phone: '+1 555-0199',
          role: 'CUSTOMER',
        };
        const demoToken = 'mock_jwt_demo_token_' + Date.now();
        localStorage.setItem(TOKEN_KEY, demoToken);
        localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
        notifyAuthState(demoUser);
        return demoUser;
      }
      throw new Error('Unable to reach backend server. If running Docker, please ensure Docker Desktop is unpaused and containers are running.');
    }
    throw error;
  }
}

export async function registerWithEmail(email, password, name = '', phone = '') {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail, password, name: name.trim(), phone: phone.trim() }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      const msg = data?.error?.message || 'Registration failed. Please try again.';
      throw new Error(msg);
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    notifyAuthState(data.user);
    return data.user;
  } catch (error) {
    const isNetworkError =
      error.name === 'AbortError' ||
      error.message.includes('fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('aborted');

    if (isNetworkError) {
      // Local fallback registration if offline
      const newUser = {
        id: 'usr_' + Date.now(),
        name: name.trim() || 'New Customer',
        email: normalizedEmail,
        phone: phone.trim() || null,
        role: 'CUSTOMER',
      };
      const token = 'mock_jwt_reg_' + Date.now();
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      notifyAuthState(newUser);
      return newUser;
    }
    throw error;
  }
}

export async function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthState(null);
}

export function subscribeToAuthState(callback) {
  listeners.add(callback);
  callback(getCurrentUser());
  return () => {
    listeners.delete(callback);
  };
}
