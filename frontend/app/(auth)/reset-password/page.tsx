"use client"

import Link from "next/link"

import { useResetPassword } from "@/hooks/auth/useResetPassword"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export default function ResetPasswordPage() {
  const {
    password,
    confirmPassword,
    loading,
    ready,
    submitted,
    errors,
    serverError,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  } = useResetPassword()

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-28 -right-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-muted/40 blur-3xl" />
      <div className="relative z-10 mx-auto grid h-screen w-full max-w-5xl grid-cols-2 items-center gap-10 px-10 py-16">
        <div className="flex flex-col items-start justify-center space-y-6">
          <Link href="/" className="text-6xl font-extrabold tracking-tight">
            <span className="text-foreground">Cube</span>
            <span className="text-primary">X</span>
          </Link>
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-foreground">
              Set a clean new password.
            </p>
            <p className="text-muted-foreground">
              The reset link creates a short-lived Supabase recovery session.
              Choose a new password before that session expires.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="border border-border bg-card px-4 py-2">
              Recovery session
            </div>
            <div className="border border-border bg-card px-4 py-2">
              Fresh password
            </div>
          </div>
        </div>
        <Card className="border-border/70 bg-card/90 shadow-xl backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle>Choose new password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Use the recovery link from your email to unlock this form.
            </p>
          </CardHeader>
          {submitted ? (
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Password updated</AlertTitle>
                <AlertDescription>
                  Your password has been changed. You can now sign in with the
                  new password.
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link href="/signin">Back to sign in</Link>
              </Button>
            </CardContent>
          ) : (
            <>
              <form onSubmit={handleSubmit} noValidate>
                <CardContent className="space-y-4">
                  {!ready && (
                    <Alert>
                      <AlertTitle>Waiting for recovery session</AlertTitle>
                      <AlertDescription>
                        Open this page from the password reset email. If the
                        link expired, request a new reset link.
                      </AlertDescription>
                    </Alert>
                  )}
                  {serverError && (
                    <Alert variant="destructive">
                      <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                  )}
                  <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor="password">New password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={handlePasswordChange}
                      disabled={loading || !ready}
                      aria-invalid={!!errors.password}
                    />
                    {errors.password && (
                      <FieldError>{errors.password}</FieldError>
                    )}
                  </Field>
                  <Field data-invalid={!!errors.confirmPassword}>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="********"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      disabled={loading || !ready}
                      aria-invalid={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && (
                      <FieldError>{errors.confirmPassword}</FieldError>
                    )}
                  </Field>
                  <Button
                    className="w-full"
                    disabled={loading || !ready}
                    type="submit"
                  >
                    {loading ? <Spinner /> : "Update password"}
                  </Button>
                </CardContent>
              </form>
              <CardFooter className="text-sm text-muted-foreground">
                Need another link?&nbsp;
                <Link
                  href="/forgot-password"
                  className="text-foreground hover:underline"
                >
                  Reset again
                </Link>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}
