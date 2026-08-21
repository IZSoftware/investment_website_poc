import axios from "axios";

// Base URL is read from env — set this in your .env files (README §1):
//   local: REACT_APP_API_BASE_URL=http://localhost:8080
//   prod:  REACT_APP_API_BASE_URL=https://investors-portal-backend-885787520862.europe-west1.run.app
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// No cookies — bearer tokens only (README §1/§5). Keys kept together so
// AuthContext and the interceptor below always agree on where tokens live.
const TOKEN_KEYS = {
  ACCESS: "auth:accessToken",
  REFRESH: "auth:refreshToken",
};

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    sessionStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  }
  if (refreshToken) {
    sessionStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
  }
};

export const clearTokens = () => {
  sessionStorage.removeItem(TOKEN_KEYS.ACCESS);
  sessionStorage.removeItem(TOKEN_KEYS.REFRESH);
};

export const getAccessToken = () => sessionStorage.getItem(TOKEN_KEYS.ACCESS);
export const getRefreshToken = () => sessionStorage.getItem(TOKEN_KEYS.REFRESH);

// Attach the bearer token to every request (README §5: Authorization: Bearer <accessToken>)
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    }
    
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// On 401: attempt exactly one refresh (README §3/§5.3), then retry the original
// request. Concurrent 401s while a refresh is already in flight get queued and
// replayed once the new token lands, instead of firing N parallel refresh calls.
let isRefreshing = false;
let queuedRequests = [];

const flushQueue = (newAccessToken, error) => {
  queuedRequests.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newAccessToken);
  });
  queuedRequests = [];
};

api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = originalRequest?.url?.includes("/api/auth/");

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status,
        data: error.response?.data,
        message: error.message
      });
    }

    if (status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      // Only redirect if not already on login page
      if (!window.location.href.includes('/login')) {
        window.location.href = "/investor-portal/login";
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queuedRequests.push({ resolve, reject });
      }).then((newAccessToken) => {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;
    try {
      // Raw axios (not `api`) so this call itself never gets caught by this interceptor.
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/refresh`,
        { refreshToken }
      );
      
      // Handle different response structures
      const accessToken = data.data?.accessToken || data.accessToken;
      const newRefreshToken = data.data?.refreshToken || data.refreshToken;

      if (!accessToken) {
        throw new Error('No access token received from refresh');
      }

      // Refresh tokens rotate on every call — always persist the NEW one (README §5.3).
      setTokens(accessToken, newRefreshToken);
      isRefreshing = false;
      flushQueue(accessToken, null);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      flushQueue(null, refreshError);
      clearTokens();
      
      // Only redirect if not already on login page
      if (!window.location.href.includes('/login')) {
        window.location.href = "/investor-portal/login";
      }
      return Promise.reject(refreshError);
    }
  }
);

export default api;