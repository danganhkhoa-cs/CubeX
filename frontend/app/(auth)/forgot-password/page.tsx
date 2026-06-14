"use client"

import Link from "next/link"

import { useForgotPassword } from "@/hooks/auth/useForgotPassword"
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

export default function ForgotPasswordPage() {
  const {
    email,
    loading,
    submitted,
    errors,
    serverError,
    handleInputChange,
    handleSubmit,
  } = useForgotPassword()

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
              Get back into your marketplace cockpit.
            </p>
            <p className="text-muted-foreground">
              We will send a secure recovery link so you can set a fresh
              password and return to managing your trades.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="border border-border bg-card px-4 py-2">
              Recovery link
            </div>
            <div className="border border-border bg-card px-4 py-2">
              Secure reset
            </div>
          </div>
        </div>
        <Card className="border-border/70 bg-card/90 shadow-xl backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle>Reset your password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the email connected to your CubeX account.
            </p>
          </CardHeader>
          {submitted ? (
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Check your email</AlertTitle>
                <AlertDescription>
                  If that email belongs to a CubeX account, Supabase has sent a
                  password reset link. Open it to choose your new password.
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
                  {serverError && (
                    <Alert variant="destructive">
                      <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                  )}
                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@cubex.io"
                      value={email}
                      onChange={handleInputChange}
                      disabled={loading}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <FieldError>{errors.email}</FieldError>}
                  </Field>
                  <Button className="w-full" disabled={loading} type="submit">
                    {loading ? <Spinner /> : "Send reset link"}
                  </Button>
                </CardContent>
              </form>
              <CardFooter className="text-sm text-muted-foreground">
                Remember your password?&nbsp;
                <Link
                  href="/signin"
                  className="text-foreground hover:underline"
                >
                  Sign in
                </Link>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}
