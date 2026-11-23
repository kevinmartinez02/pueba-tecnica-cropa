"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  SESSION_QUERY_KEY,
  type SessionResponse,
  type UserSession,
} from "@/lib/auth/session";
import { tasksControllerLogin } from "@/lib/api/generated/sdk.gen";

type Credentials = {
  username: string;
  password: string;
};

async function getSession(): Promise<SessionResponse> {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load your session.");
  return response.json() as Promise<SessionResponse>;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      if (message === "Invalid username or password") {
        return "El usuario o la contraseña no son correctos.";
      }
      return message;
    }
  }

  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

function getApiErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null || !("message" in error)) {
    return undefined;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

export function LoginForm() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: getSession,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: Credentials) => {
      const result = await tasksControllerLogin({
        body: credentials,
        baseUrl: "/api",
      });

      if (result.error) {
        throw new Error(
          getApiErrorMessage(result.error) ?? "Invalid username or password",
        );
      }

      if (!result.data || typeof result.data !== "object") {
        throw new Error("The API returned an invalid user profile.");
      }

      return result.data as UserSession;
    },
    onSuccess: (user) => {
      queryClient.setQueryData<SessionResponse>(SESSION_QUERY_KEY, { user });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Could not sign out.");
    },
    onSuccess: () => {
      queryClient.setQueryData<SessionResponse>(SESSION_QUERY_KEY, {
        user: null,
      });
      loginMutation.reset();
      setPassword("");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate({ username: username.trim(), password });
  }

  if (sessionQuery.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f6]">
        <LoaderCircle className="size-5 animate-spin text-[#59665f]" />
      </main>
    );
  }

  const user = sessionQuery.data?.user;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f8f6] px-5 py-12 text-[#202723]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 -top-32 size-80 rounded-full bg-[#e9efe8] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -right-24 size-96 rounded-full bg-[#edf0eb] blur-3xl"
      />

      <section className="relative w-full max-w-[420px]">
        <div className="rounded-[24px] border border-[#e9ece8] bg-white p-7 shadow-[0_24px_70px_-42px_rgba(28,43,35,0.32)] sm:p-9">
          {user ? (
            <div className="py-2 text-center">
              <span className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl bg-[#edf5ef] text-[#3f7357]">
                <Check
                  aria-hidden="true"
                  className="size-6"
                  strokeWidth={2.5}
                />
              </span>
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#55705e]">
                <Sparkles aria-hidden="true" className="size-3" /> Sesión activa
              </p>
              <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.045em]">
                Hola, {user.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#727b75]">
                Ya iniciaste sesión. Tu espacio está listo.
              </p>
              <div className="mt-7 rounded-xl border border-[#edf0ed] bg-[#fafbfa] px-4 py-3 text-left">
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#89918b]">
                  Usuario
                </p>
                <p className="mt-1 text-sm font-medium text-[#303a34]">
                  {user.username}
                </p>
              </div>
              <Button
                className="mt-6 h-11 w-full rounded-xl border border-[#e4e9e4] bg-white text-[#36423b] hover:bg-[#f7f9f7]"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                type="button"
                variant="outline"
              >
                {logoutMutation.isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <LogOut />
                )}
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7b897f]">
                  Tu espacio de trabajo
                </p>
                <h1 className="text-[29px] font-semibold tracking-[-0.05em] text-[#202723]">
                  Ingresa tus credenciales.
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#778079]">
                  Inicia sesión para continuar con tus tareas.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    className="text-[13px] font-medium text-[#424b45]"
                    htmlFor="username"
                  >
                    Usuario
                  </label>
                  <input
                    autoComplete="username"
                    autoFocus
                    className="h-11 w-full rounded-xl border border-[#e2e7e2] bg-white px-3.5 text-sm text-[#202723] outline-none transition placeholder:text-[#a2aaa4] focus:border-[#83958a] focus:ring-4 focus:ring-[#6e8a78]/10"
                    id="username"
                    name="username"
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Tu nombre de usuario"
                    required
                    value={username}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-[13px] font-medium text-[#424b45]"
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="current-password"
                      className="h-11 w-full rounded-xl border border-[#e2e7e2] bg-white px-3.5 pr-11 text-sm text-[#202723] outline-none transition placeholder:text-[#a2aaa4] focus:border-[#83958a] focus:ring-4 focus:ring-[#6e8a78]/10"
                      id="password"
                      name="password"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Tu contraseña"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#919b94] transition hover:text-[#47574c]"
                      onClick={() => setShowPassword((visible) => !visible)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" className="size-[17px]" />
                      ) : (
                        <Eye aria-hidden="true" className="size-[17px]" />
                      )}
                    </button>
                  </div>
                </div>

                {loginMutation.isError && (
                  <div
                    aria-live="polite"
                    className="rounded-xl border border-[#f0d8d5] bg-[#fff8f6] px-3.5 py-3 text-sm text-[#9d5046]"
                    role="alert"
                  >
                    {getErrorMessage(loginMutation.error)}
                  </div>
                )}

                <Button
                  className="h-11 w-full rounded-xl bg-[#25342d] text-sm font-medium text-white shadow-sm hover:bg-[#33463b]"
                  disabled={loginMutation.isPending || !username || !password}
                  type="submit"
                >
                  {loginMutation.isPending ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      Iniciar sesión
                      <ArrowRight aria-hidden="true" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#eff1ee] pt-5 text-[11px] text-[#87918a]">
                <LockKeyhole aria-hidden="true" className="size-3.5" />
                Solo usuarios registrados pueden acceder
              </div>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-[11px] text-[#9aa19c]">
          Un espacio tranquilo para mantener el enfoque.
        </p>
      </section>
    </main>
  );
}
