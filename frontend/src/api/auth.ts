import { request } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SignUpInput {
  email: string;
  name: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export const authApi = {
  signUp: (data: SignUpInput) =>
    request<User>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  signIn: (data: SignInInput) =>
    request<User>('/auth/signin', { method: 'POST', body: JSON.stringify(data) }),

  signOut: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  me: () => request<User>('/auth/me'),
};
