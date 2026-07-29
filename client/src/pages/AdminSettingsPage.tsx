import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { api } from "../lib/api";
import { formatDate } from "../lib/format";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [subscriberSearch, setSubscriberSearch] = useState("");

  const subscribers = useQuery({
    queryKey: ["admin", "newsletter", "subscribers"],
    queryFn: api.newsletter.listSubscribers,
  });
  const filteredSubscribers = useMemo(() => {
    const normalizedSearch = subscriberSearch.trim().toLowerCase();
    const subscriberList = subscribers.data?.subscribers ?? [];

    if (!normalizedSearch) {
      return subscriberList;
    }

    return subscriberList.filter((subscriber) =>
      subscriber.email.toLowerCase().includes(normalizedSearch),
    );
  }, [subscriberSearch, subscribers.data?.subscribers]);

  const changePasswordMutation = useMutation({
    mutationFn: api.auth.changePassword,
    onSuccess: () => {
      setPasswordMessage("Password changed successfully.");
      setPasswordError("");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (error: unknown) => {
      setPasswordMessage("");
      setPasswordError(
        error instanceof Error ? error.message : "Failed to change password.",
      );
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: api.auth.changeEmail,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/admin/login", {
        replace: true,
        state: { message: "Email updated. Please log in again." },
      });
    },
    onError: (error: unknown) => {
      setEmailError(
        error instanceof Error ? error.message : "Failed to change email.",
      );
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: api.newsletter.deactivateSubscriber,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "newsletter", "subscribers"],
      });
    },
  });

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    if (!isStrongPassword(newPassword)) {
      setPasswordError(
        "Use 10+ characters with uppercase, lowercase, number, and symbol.",
      );
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError("");
    changeEmailMutation.mutate({
      currentPassword: currentPasswordForEmail,
      newEmail,
    });
  }

  return (
    <AdminShell>
      <div className="max-w-5xl">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey">
          Admin
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold uppercase tracking-[-0.04em]">
          Settings
        </h1>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1fr]">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em]">
              Change Password
            </h2>
            <form onSubmit={submitPassword} className="mt-6 grid gap-5">
              <PasswordField
                id="currentPassword"
                label="Current password"
                visible={showPasswordFields}
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              <PasswordField
                id="newPassword"
                label="New password"
                visible={showPasswordFields}
                value={newPassword}
                onChange={setNewPassword}
              />
              <TogglePasswordButton
                visible={showPasswordFields}
                onClick={() => setShowPasswordFields((value) => !value)}
              />
              {passwordError ? (
                <p className="text-sm text-ink" role="alert">
                  {passwordError}
                </p>
              ) : null}
              {passwordMessage ? (
                <p className="text-sm text-grey" role="status">
                  {passwordMessage}
                </p>
              ) : null}
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending
                  ? "Saving"
                  : "Change password"}
              </Button>
            </form>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em]">
              Change Email
            </h2>
            <form onSubmit={submitEmail} className="mt-6 grid gap-5">
              <PasswordField
                id="currentPasswordEmail"
                label="Current password"
                visible={showEmailPassword}
                value={currentPasswordForEmail}
                onChange={setCurrentPasswordForEmail}
              />
              <FormField
                id="newEmail"
                label="New email"
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                required
              />
              <TogglePasswordButton
                visible={showEmailPassword}
                onClick={() => setShowEmailPassword((value) => !value)}
              />
              {emailError ? (
                <p className="text-sm text-ink" role="alert">
                  {emailError}
                </p>
              ) : null}
              <Button type="submit" disabled={changeEmailMutation.isPending}>
                {changeEmailMutation.isPending ? "Saving" : "Change email"}
              </Button>
            </form>
          </section>
        </div>

        <section className="mt-16">
          <div className="flex flex-col gap-5 border-b border-grey-light pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em]">
                Newsletter Subscribers
              </h2>
              <p className="mt-2 text-sm text-grey">
                {subscribers.data?.subscribers.length ?? 0} captured emails
              </p>
            </div>
            <div className="w-full sm:max-w-xs">
              <FormField
                id="subscriberSearch"
                label="Search Subscribers"
                type="search"
                value={subscriberSearch}
                onChange={(event) => setSubscriberSearch(event.target.value)}
                placeholder="Filter by email"
              />
            </div>
          </div>

          <div className="divide-y divide-grey-light">
            {subscribers.isLoading ? <SubscriberState text="Loading" /> : null}
            {subscribers.isError ? (
              <SubscriberState text="Subscribers could not load" />
            ) : null}
            {subscribers.data?.subscribers.length === 0 ? (
              <SubscriberState text="No subscribers yet" />
            ) : null}
            {subscribers.data?.subscribers.length ? (
              filteredSubscribers.length === 0 ? (
                <SubscriberState text="No subscribers match that search" />
              ) : null
            ) : null}
            {filteredSubscribers.map((subscriber) => (
              <article
                key={subscriber.id}
                className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <p className="font-semibold">{subscriber.email}</p>
                  <p className="mt-1 text-sm text-grey">
                    {formatDate(subscriber.subscribed_at)} ·{" "}
                    {subscriber.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deactivateMutation.mutate(subscriber.id)}
                  disabled={
                    !subscriber.is_active || deactivateMutation.isPending
                  }
                  className="min-h-11 border border-red-700 px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-red-700 transition-colors hover:bg-red-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:cursor-not-allowed disabled:border-grey disabled:text-grey"
                >
                  Deactivate
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function PasswordField({
  id,
  label,
  visible,
  value,
  onChange,
}: {
  id: string;
  label: string;
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
    />
  );
}

function TogglePasswordButton({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="justify-self-start text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-grey transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {visible ? "Hide passwords" : "Show passwords"}
    </button>
  );
}

function SubscriberState({ text }: { text: string }) {
  return <p className="py-8 text-sm text-grey">{text}</p>;
}

function isStrongPassword(password: string) {
  return (
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
