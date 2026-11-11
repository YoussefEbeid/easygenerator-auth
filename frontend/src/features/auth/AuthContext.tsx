import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  authApi,
  type SignInInput,
  type SignUpInput,
  type User,
} from "../../api/auth";
import { AuthContext, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Restore the session from the cookie on first load
  useEffect(() => {
    authApi
      .me()
      .then((current) => {
        setUser(current);
        setStatus("authenticated");
      })
      .catch(() => setStatus("anonymous"));
  }, []);

  const startSession = useCallback((current: User) => {
    setUser(current);
    setStatus("authenticated");
  }, []);

  const signIn = useCallback(
    async (input: SignInInput) => startSession(await authApi.signIn(input)),
    [startSession],
  );

  const signUp = useCallback(
    async (input: SignUpInput) => startSession(await authApi.signUp(input)),
    [startSession],
  );

  const signOut = useCallback(async () => {
    await authApi.signOut().catch(() => undefined);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ user, status, signIn, signUp, signOut }),
    [user, status, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
