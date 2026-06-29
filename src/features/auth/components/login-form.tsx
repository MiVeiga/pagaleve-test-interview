"use client";

import { useState } from "react";

import { Button, Input } from "@/design-system";

import { useLogin } from "../hooks/use-login";

const TEST_CREDENTIALS = {
  email: "john@mail.com",
  password: "changeme",
} as const;

export function LoginForm() {
  const [email, setEmail] = useState<string>(TEST_CREDENTIALS.email);
  const [password, setPassword] = useState<string>(TEST_CREDENTIALS.password);
  const loginMutation = useLogin();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      data-testid="login-form"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Senha
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {loginMutation.isError ? (
        <p className="text-sm text-red-600" role="alert">
          Falha ao autenticar. Verifique suas credenciais e tente novamente.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full"
        data-testid="login-submit"
      >
        {loginMutation.isPending ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-xs text-zinc-500">
        Credenciais de teste: {TEST_CREDENTIALS.email} /{" "}
        {TEST_CREDENTIALS.password}
      </p>
    </form>
  );
}
