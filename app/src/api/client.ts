import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async config => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
