import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/services';

const AuthContext = createContext(null);

const initialState = {
  user: (() => {
    try {
      const u = localStorage.getItem('cognicare_user');
      return u && u !== 'undefined' ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })(),
  token: localStorage.getItem('cognicare_token') || null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS': {
      const { accessToken, refreshToken, ...user } = action.payload.data;
      localStorage.setItem('cognicare_token', accessToken);
      localStorage.setItem('cognicare_refresh_token', refreshToken);
      localStorage.setItem('cognicare_user', JSON.stringify(user));
      return {
        ...state,
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    }
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('cognicare_token');
      localStorage.removeItem('cognicare_refresh_token');
      localStorage.removeItem('cognicare_user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_USER':
      localStorage.setItem('cognicare_user', JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('cognicare_token');
      if (token && token !== 'undefined') {
        try {
          const { data } = await authService.getMe();
          dispatch({ type: 'AUTH_LOADED', payload: data.data });
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await authService.login({ email, password });
    dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    return data;
  };

  const register = async (formData) => {
    const { data } = await authService.register(formData);
    dispatch({ type: 'REGISTER_SUCCESS', payload: data });
    return data;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
