import { apiGet, apiPost } from './api';

const SESSION_TOKEN_KEY = 'sessionToken';
const authListeners = new Set();

function emitAuthChange(event, session) {
  authListeners.forEach((listener) => listener(event, session));
}

function getStoredToken() {
  return localStorage.getItem(SESSION_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY) || null;
}

function clearAuthStorage() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('isGuest');
  sessionStorage.removeItem('isAuthenticated');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('sessionToken');
}

function persistAuth(session) {
  const profile = session?.profile;
  if (!session?.token || !profile) {
    clearAuthStorage();
    return;
  }

  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userRole', profile.role);
  localStorage.setItem('userEmail', profile.email);
  localStorage.setItem('sessionToken', session.token);
  localStorage.removeItem('isGuest');
}

function toUser(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    user_metadata: {
      full_name: profile.fullName,
      role: profile.role,
    },
  };
}

function toSessionPayload(session) {
  if (!session) return null;
  return {
    access_token: session.token,
    expires_at: session.expiresAt,
    user: toUser(session.profile),
    profile: session.profile,
  };
}

async function fetchProfileById(userId) {
  const profile = await apiGet(`/auth/profiles/${userId}`);
  return { data: profile, error: null };
}

function createProfilesQuery() {
  return {
    select() {
      return this;
    },
    eq(field, value) {
      this.field = field;
      this.value = value;
      return this;
    },
    async single() {
      try {
        if (this.field !== 'id') {
          throw new Error(`Only profile lookup by id is supported, received "${this.field}"`);
        }
        return await fetchProfileById(this.value);
      } catch (error) {
        return { data: null, error };
      }
    },
  };
}

export const supabase = {
  auth: {
    onAuthStateChange(callback) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
    async signOut() {
      return signOut();
    },
  },
  from(table) {
    if (table === 'profiles') {
      return createProfilesQuery();
    }
    throw new Error(`Unsupported table access in frontend compatibility layer: ${table}`);
  },
};

export const syncProfile = async (user, profileData = {}) => {
  return { error: null, data: { user, profileData } };
};

export const signIn = async (email, password) => {
  try {
    const session = await apiPost('/auth/signin', { email, password });
    persistAuth(session);
    emitAuthChange('SIGNED_IN', toSessionPayload(session));
    return { data: { user: toUser(session.profile), session: toSessionPayload(session) }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signUp = async (email, password, metadata = {}) => {
  try {
    const session = await apiPost('/auth/signup', {
      email,
      password,
      fullName: metadata.full_name || metadata.fullName || '',
      role: metadata.role || 'citizen',
    });
    persistAuth(session);
    emitAuthChange('SIGNED_UP', toSessionPayload(session));
    return { data: { user: toUser(session.profile), session: toSessionPayload(session) }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const token = getStoredToken();
    if (token) {
      await apiPost('/auth/signout', undefined, { 'X-Session-Token': token });
    }
    clearAuthStorage();
    emitAuthChange('SIGNED_OUT', null);
    return { error: null };
  } catch (error) {
    clearAuthStorage();
    emitAuthChange('SIGNED_OUT', null);
    return { error };
  }
};

export const getSession = async () => {
  const token = getStoredToken();
  if (!token) {
    return { session: null, error: null };
  }

  try {
    const response = await apiGet('/auth/session', { 'X-Session-Token': token });
    if (!response?.authenticated || !response.session) {
      clearAuthStorage();
      return { session: null, error: null };
    }
    persistAuth(response.session);
    return { session: toSessionPayload(response.session), error: null };
  } catch (error) {
    clearAuthStorage();
    return { session: null, error };
  }
};

export const getUserProfile = async (userId) => {
  try {
    return await fetchProfileById(userId);
  } catch (error) {
    return { data: null, error };
  }
};
