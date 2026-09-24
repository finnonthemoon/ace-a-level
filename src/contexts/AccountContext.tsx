import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { isSupabaseConfigured, requireSupabase, supabase } from "@/lib/supabase";
import { validateNewPassword } from "@/services/auth-validation";

interface EmailAuthResult {
  requiresEmailConfirmation: boolean;
}

interface AccountContextValue {
  session: Session | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isSupabaseConfigured: boolean;
  authError: string | null;
  isPasswordRecovery: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<EmailAuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resendEmailConfirmation: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);
const authRedirectUri = Linking.createURL("auth/callback");
const passwordResetRedirectUri = Linking.createURL("auth/callback", {
  queryParams: { recovery: "1" },
});

function authMessage(error: unknown) {
  return error instanceof Error ? error.message : "Authentication failed.";
}

function paramsFromUrl(url: string) {
  const [base, fragment = ""] = url.split("#", 2);
  const parsed = new URL(base);
  const params = new URLSearchParams(parsed.search);
  new URLSearchParams(fragment).forEach((value, key) => params.set(key, value));
  return params;
}

export function AccountProvider({ children }: PropsWithChildren) {
  const linkingUrl = Linking.useLinkingURL();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      return () => {
        active = false;
      };
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(error.message);
      setSession(data.session);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") setIsPasswordRecovery(true);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!linkingUrl || !supabase || !linkingUrl.includes("auth/callback")) return;
    let active = true;

    async function acceptAuthCallback() {
      try {
        const params = paramsFromUrl(linkingUrl!);
        if (params.get("error_description")) {
          throw new Error(params.get("error_description")!);
        }
        if (params.get("recovery") === "1" || params.get("type") === "recovery") {
          setIsPasswordRecovery(true);
        }
        const code = params.get("code");
        if (code) {
          const { error } = await supabase!.auth.exchangeCodeForSession(code);
          if (error) throw error;
          return;
        }
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase!.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        }
      } catch (error) {
        if (active) setAuthError(authMessage(error));
      }
    }

    void acceptAuthCallback();
    return () => {
      active = false;
    };
  }, [linkingUrl]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const passwordError = validateNewPassword(password);
    if (passwordError) throw new Error(passwordError);
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: authRedirectUri },
    });
    if (error) throw error;
    return { requiresEmailConfirmation: !data.session };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await requireSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  }, []);

  const resendEmailConfirmation = useCallback(async (email: string) => {
    const { error } = await requireSupabase().auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: authRedirectUri },
    });
    if (error) throw error;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: passwordResetRedirectUri,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const passwordError = validateNewPassword(password);
    if (passwordError) throw new Error(passwordError);
    const { error } = await requireSupabase().auth.updateUser({ password });
    if (error) throw error;
    setIsPasswordRecovery(false);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
    setIsPasswordRecovery(false);
  }, []);

  const value = useMemo<AccountContextValue>(
    () => ({
      session,
      isLoading,
      isSignedIn: Boolean(session),
      isSupabaseConfigured,
      authError,
      isPasswordRecovery,
      signUpWithEmail,
      signInWithEmail,
      resendEmailConfirmation,
      sendPasswordReset,
      updatePassword,
      signOut,
    }),
    [
      authError,
      isLoading,
      isPasswordRecovery,
      resendEmailConfirmation,
      sendPasswordReset,
      session,
      signInWithEmail,
      signOut,
      signUpWithEmail,
      updatePassword,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error("useAccount must be used inside AccountProvider.");
  return value;
}
