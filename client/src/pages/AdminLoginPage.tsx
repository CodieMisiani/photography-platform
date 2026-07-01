import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { api } from "../lib/api";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginMutation = useMutation({
    mutationFn: api.auth.login,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await loginMutation.mutateAsync({ email, password });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname ?? "/admin/invoices", { replace: true });
    } catch {
      setError("Access was not approved. Check the email and password.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16 text-ink">
      <section className="w-full max-w-md border border-grey-light bg-paper p-8">
        <p className="mb-4 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-grey">
          Studio Admin
        </p>
        <h1 className="mb-10 text-4xl font-display font-semibold uppercase tracking-[-0.04em]">
          Sign in
        </h1>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <FormField
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? (
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ink">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in" : "Enter dashboard"}
          </Button>
        </form>
      </section>
    </main>
  );
}
