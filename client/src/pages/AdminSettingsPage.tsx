import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { useNavigate } from "react-router-dom";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      api.auth.changePassword(payload),
    onSuccess: () => {
      alert("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to change password";
      alert(msg);
    },
  });

  // Change email state
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const changeEmailMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newEmail: string }) =>
      api.auth.changeEmail(payload),
    onSuccess: () => {
      // invalidate auth and redirect to login
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/admin/login", {
        replace: true,
        state: { message: "Email updated. Please log in again." },
      });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to change email";
      alert(msg);
    },
  });

  function validateNewPassword(pw: string) {
    return (
      pw.length >= 10 &&
      /[a-z]/.test(pw) &&
      /[A-Z]/.test(pw) &&
      /\d/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw)
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">Account Settings</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!validateNewPassword(newPassword)) {
              alert("New password does not meet complexity requirements.");
              return;
            }
            changePasswordMutation.mutate({ currentPassword, newPassword });
          }}
        >
          <div className="grid gap-4">
            <FormField
              id="currentPassword"
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <FormField
                id="newPassword"
                label="New password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((s) => !s)}
                className="text-sm text-grey"
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending
                  ? "Saving..."
                  : "Change password"}
              </Button>
            </div>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Change Email</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            changeEmailMutation.mutate({
              currentPassword: currentPasswordForEmail,
              newEmail,
            });
          }}
        >
          <div className="grid gap-4">
            <FormField
              id="currentPasswordEmail"
              label="Current password"
              type="password"
              value={currentPasswordForEmail}
              onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
            />
            <FormField
              id="newEmail"
              label="New email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <div className="flex gap-3">
              <Button type="submit" disabled={changeEmailMutation.isPending}>
                {changeEmailMutation.isPending ? "Saving..." : "Change email"}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
