import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { LoginForm, LoginRedirect } from "@/features/auth";

function LoginFormFallback() {
  return <div className="h-64 animate-pulse rounded-md bg-zinc-100" />;
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar na loja</CardTitle>
          <CardDescription>
            Use suas credenciais para acessar o catálogo protegido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoginFormFallback />}>
            <LoginRedirect />
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
