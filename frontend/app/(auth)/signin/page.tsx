"use client"

import Link from "next/link"

import { useSignIn } from "@/hooks/auth/useSignIn"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

export default function SignInPage() {
  const {
    loading,
    errors,
    serverError,
    formData,
    handleInputChange,
    handleSubmit,
  } = useSignIn()

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
              Control your catalog, orders, and wallet in one place.
            </p>
            <p className="text-muted-foreground">
              CubeX keeps your operations tight with fast product flows and
              clear order visibility.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="border border-border bg-card px-4 py-2">
              Inventory synced
            </div>
            <div className="border border-border bg-card px-4 py-2">
              Instant payouts
            </div>
          </div>
        </div>
        <Card className="border-border/70 bg-card/90 shadow-xl backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle>Welcome back</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your CubeX journey.
            </p>
          </CardHeader>
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
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center justify-between gap-4">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>
              <Button className="w-full" disabled={loading} type="submit">
                {loading ? <Spinner /> : "Sign in"}
              </Button>
            </CardContent>
          </form>
          <CardFooter className="text-sm text-muted-foreground">
            New here?&nbsp;
            <Link href="/signup" className="text-foreground hover:underline">
              Create an account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
