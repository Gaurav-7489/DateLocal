"use client";

import React, { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleGhostMode, unblockUser } from "../discover/actions";
import { routes } from "@/config/routes";
import { isUniversityEmail } from "@/config/university";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  Eye,
  EyeOff,
  UserX,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Crown,
  Mail,
  Lock,
} from "lucide-react";

interface BlockedProfile {
  id: string;
  display_name: string;
  department: string;
}

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
}

interface SettingsClientProps {
  initialGhostMode: boolean;
  blockedUsers: BlockedProfile[];
  subscription: Subscription;
  currentEmail: string;
  hasPassword: boolean;
  authProviders: string[];
}

interface PasswordInputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  disabled?: boolean;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  hint?: React.ReactNode;
  error?: string | null;
}

function PasswordInputField({
  id,
  label,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  disabled,
  autoComplete,
  placeholder = "••••••••••••••••",
  hint,
  error,
}: PasswordInputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`w-full rounded-2xl border bg-background/50 px-4 py-3.5 pr-12 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:bg-background focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            error
              ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-border focus:border-emerald-500 focus:ring-emerald-500/20"
          }`}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          title={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:pointer-events-none"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function SettingsClient({
  initialGhostMode,
  blockedUsers: initialBlocked,
  subscription,
  currentEmail: initialCurrentEmail,
  hasPassword,
  authProviders,
}: SettingsClientProps) {
  const router = useRouter();

  const [ghostMode, setGhostMode] = useState(initialGhostMode);
  const [ghostLoading, setGhostLoading] = useState(false);
  const [blockedList, setBlockedList] = useState(initialBlocked);
  const [unblockLoadingId, setUnblockLoadingId] = useState<string | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const emailInputId = useId();
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();

  // Keep the real, currently active auth email separate from a pending email change.
  const [currentEmailState] = useState(initialCurrentEmail);
  const [email, setEmail] = useState(initialCurrentEmail);
  const [emailPending, setEmailPending] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const isGoogleAccount = authProviders.includes("google") && !hasPassword;
  const hasTypedNewPassword = newPassword.length > 0;
  const isNewPasswordLengthValid = newPassword.length >= 8;
  const hasTypedConfirm = confirmPassword.length > 0;
  const doPasswordsMatch = newPassword === confirmPassword;

  const isPremium =
    subscription.plan !== "free" &&
    subscription.status === "active" &&
    !!subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd).getTime() > Date.now();

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (emailLoading) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatusMessage({ type: "error", text: "Enter the new email address." });
      return;
    }

    if (!isUniversityEmail(normalizedEmail)) {
      setStatusMessage({
        type: "error",
        text: "Use a valid Bahra University email address. Your DateBu account must stay tied to the university domain.",
      });
      return;
    }

    if (normalizedEmail === currentEmailState.trim().toLowerCase()) {
      setStatusMessage({ type: "error", text: "That is already your current email address." });
      return;
    }

    setEmailLoading(true);
    setStatusMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: normalizedEmail });

      if (error) {
        setStatusMessage({
          type: "error",
          text: `We couldn't change your email: ${error.message}`,
        });
        return;
      }

      // Supabase keeps the current email active until the configured confirmation flow completes.
      // Do not overwrite currentEmailState with the pending address.
      setEmailPending(true);
      setStatusMessage({
        type: "success",
        text: "Confirmation links were sent. Your current email stays active until the email-change verification is completed.",
      });
    } catch {
      setStatusMessage({
        type: "error",
        text: "An unexpected network error occurred while updating your email.",
      });
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordLoading) return;

    if (!newPassword) {
      setStatusMessage({ type: "error", text: "New password is required." });
      return;
    }
    if (!isNewPasswordLengthValid) {
      setStatusMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (!confirmPassword) {
      setStatusMessage({ type: "error", text: "Please confirm your new password." });
      return;
    }
    if (!doPasswordsMatch) {
      setStatusMessage({ type: "error", text: "Passwords don't match." });
      return;
    }
    if (hasPassword && !currentPassword) {
      setStatusMessage({ type: "error", text: "Current password is required." });
      return;
    }
    if (hasPassword && newPassword === currentPassword) {
      setStatusMessage({ type: "error", text: "New password must not equal your current password." });
      return;
    }

    setPasswordLoading(true);
    setStatusMessage(null);

    try {
      const supabase = createClient();

      if (hasPassword) {
        // The project currently uses supabase-js 2.49.x, which predates the
        // currentPassword updateUser option. Re-authenticating first gives us
        // the same current-password check without upgrading the whole lockfile.
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: currentEmailState,
          password: currentPassword,
        });

        if (signInError) {
          setStatusMessage({ type: "error", text: "Current password is incorrect." });
          return;
        }
      }

      // Google-only accounts can add a DateBu password directly. Supabase supports
      // attaching password authentication to an existing OAuth account.
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setStatusMessage({
          type: "error",
          text: `We couldn't ${hasPassword ? "change" : "set"} your password: ${updateError.message}`,
        });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setStatusMessage({
        type: "success",
        text: hasPassword
          ? "Password changed successfully."
          : "Password added successfully. You can now use your university email and password to sign in too.",
      });
      router.refresh();
    } catch {
      setStatusMessage({
        type: "error",
        text: "An unexpected error occurred while updating your password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleToggleGhost() {
    if (!isPremium) {
      router.push(routes.extrovert);
      return;
    }

    const nextState = !ghostMode;
    setGhostLoading(true);
    setStatusMessage(null);

    const result = await toggleGhostMode(nextState);
    setGhostLoading(false);

    if (result.error) {
      setStatusMessage({ type: "error", text: result.error });
      return;
    }

    setGhostMode(nextState);
    setStatusMessage({
      type: "success",
      text: nextState
        ? "Ghost Mode enabled. Your profile is now hidden from discovery."
        : "Ghost Mode disabled. Your profile is visible to matching students.",
    });
    router.refresh();
  }

  async function handleUnblock(userId: string, name: string) {
    setUnblockLoadingId(userId);
    setStatusMessage(null);

    const result = await unblockUser(userId);
    setUnblockLoadingId(null);

    if (result.error) {
      setStatusMessage({ type: "error", text: result.error });
      return;
    }

    setBlockedList((prev) => prev.filter((user) => user.id !== userId));
    setStatusMessage({ type: "success", text: `${name} has been unblocked.` });
    router.refresh();
  }

  const isEmailButtonDisabled =
    emailLoading ||
    !email.trim() ||
    email.trim().toLowerCase() === currentEmailState.trim().toLowerCase();

  const isPasswordButtonDisabled =
    passwordLoading ||
    !newPassword ||
    !confirmPassword ||
    !isNewPasswordLengthValid ||
    !doPasswordsMatch ||
    (hasPassword && !currentPassword);

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-2xl p-3.5 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <div>
          <h2 className="text-base font-bold text-foreground">Account Details</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Keep your DateBu login credentials secure.
          </p>
        </div>

        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor={emailInputId}
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              University email
            </label>
            <div className="relative flex items-center">
              <input
                id={emailInputId}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailPending(false);
                }}
                disabled={emailLoading}
                autoComplete="email"
                placeholder="student@bahrauniversity.edu.in"
                className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3.5 pr-11 text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus:border-emerald-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <Mail className="pointer-events-none absolute right-4 h-4 w-4 text-muted-foreground" />
            </div>
            {emailPending && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Verification is pending. Your current email remains active until the change is confirmed.
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isEmailButtonDisabled}
            className="w-full rounded-2xl py-3.5 text-sm font-semibold"
          >
            {emailLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating email...
              </>
            ) : (
              "Change email"
            )}
          </Button>
        </form>

        <div className="border-t border-border" />

        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {hasPassword ? "Password" : "Create a password"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isGoogleAccount
              ? "Your account currently uses Google. Add a DateBu password so you can also sign in with your university email."
              : "Change your DateBu password securely."}
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {hasPassword && (
            <PasswordInputField
              id={currentPasswordId}
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              showPassword={showCurrentPassword}
              onToggleVisibility={() => setShowCurrentPassword((prev) => !prev)}
              disabled={passwordLoading}
              autoComplete="current-password"
            />
          )}

          <PasswordInputField
            id={newPasswordId}
            label={hasPassword ? "New password" : "Password"}
            value={newPassword}
            onChange={setNewPassword}
            showPassword={showNewPassword}
            onToggleVisibility={() => setShowNewPassword((prev) => !prev)}
            disabled={passwordLoading}
            autoComplete="new-password"
            hint={
              hasTypedNewPassword ? (
                <span
                  className={`flex items-center gap-1 ${
                    isNewPasswordLengthValid
                      ? "font-medium text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {isNewPasswordLengthValid ? (
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                  )}
                  At least 8 characters
                </span>
              ) : (
                "Use at least 8 characters."
              )
            }
          />

          <PasswordInputField
            id={confirmPasswordId}
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            showPassword={showConfirmPassword}
            onToggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
            disabled={passwordLoading}
            autoComplete="new-password"
            error={hasTypedConfirm && !doPasswordsMatch ? "Passwords don't match." : null}
          />

          <Button
            type="submit"
            disabled={isPasswordButtonDisabled}
            className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500 disabled:shadow-none"
          >
            {passwordLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {hasPassword ? "Verifying & changing..." : "Creating password..."}
              </>
            ) : hasPassword ? (
              "Change password"
            ) : (
              "Create password"
            )}
          </Button>
        </form>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              {ghostMode ? (
                <EyeOff className="h-5 w-5 text-amber-600" />
              ) : (
                <Eye className="h-5 w-5 text-emerald-600" />
              )}
              Ghost Mode
            </h2>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              Hide your profile from student discovery while keeping existing matches and chats active.
            </p>
          </div>

          <Button
            type="button"
            variant={ghostMode ? "primary" : "secondary"}
            size="sm"
            disabled={ghostLoading || !isPremium}
            onClick={handleToggleGhost}
            className={ghostMode ? "bg-amber-600 text-white hover:bg-amber-700" : ""}
          >
            {ghostLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : !isPremium ? (
              "Unlock"
            ) : ghostMode ? (
              "Turn Off"
            ) : (
              "Turn On"
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-muted/50 p-3 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            Current Status:{" "}
            <strong>
              {!isPremium ? "Premium required" : ghostMode ? "Invisible in Discovery" : "Visible to Students"}
            </strong>
          </span>
        </div>

        {!isPremium && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            Ghost Mode is a premium feature. Upgrade from the payment page to unlock it.
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <UserX className="h-5 w-5 text-rose-600" />
            Blocked Users
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Manage students you have blocked.</p>
        </div>

        {blockedList.length === 0 ? (
          <p className="py-2 text-xs italic text-muted-foreground">You haven&apos;t blocked any users.</p>
        ) : (
          <div className="divide-y divide-border">
            {blockedList.map((blocked) => (
              <div key={blocked.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-bold text-foreground">{blocked.display_name}</p>
                  <p className="text-[10px] text-muted-foreground">{blocked.department}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={unblockLoadingId === blocked.id}
                  onClick={() => handleUnblock(blocked.id, blocked.display_name)}
                  className="text-xs"
                >
                  {unblockLoadingId === blocked.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Unblock"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/50">
            <Crown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <Link href={routes.extrovert} className="text-base font-bold text-foreground hover:text-emerald-700">
              DateBu Extrovert
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Plan: <span className="font-semibold capitalize">{subscription.plan}</span> ·{" "}
              <span className="capitalize">{subscription.status}</span>
            </p>
          </div>
        </div>

        {isPremium && subscription.currentPeriodEnd && (
          <p className="mt-4 text-[11px] text-muted-foreground">
            Current period ends {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
