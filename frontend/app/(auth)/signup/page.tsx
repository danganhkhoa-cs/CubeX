"use client"

import Link from "next/link"

import { useSignUp } from "@/hooks/auth/useSignUp"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"

export default function SignUpPage() {
  const {
    loading,
    errors,
    submitted,
    formData,
    handleInputChange,
    handleSubmit,
    handleGoToSignIn,
  } = useSignUp()

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
              Join the community of cube enthusiasts.
            </p>
            <p className="text-muted-foreground">
              Trade rare cubes, track your collection, and connect with
              collectors worldwide.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="border border-border bg-card px-4 py-2">
              Global marketplace
            </div>
            <div className="border border-border bg-card px-4 py-2">
              Secure trading
            </div>
          </div>
        </div>
        <Card className="border-border/70 bg-card/90 shadow-xl backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle>Create your account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Join CubeX to trade, track, and discover rare Rubik's cubes.
            </p>
          </CardHeader>
          {submitted ? (
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Verify your email</AlertTitle>
                <AlertDescription>
                  We sent a verification link to your email. Please confirm your
                  account before signing in.
                </AlertDescription>
              </Alert>
              <Button className="w-full" onClick={handleGoToSignIn}>
                Back to sign in
              </Button>
            </CardContent>
          ) : (
            <>
              <form onSubmit={handleSubmit} noValidate>
                <CardContent className="space-y-4">
                  <Field data-invalid={!!errors.full_name}>
                    <FieldLabel htmlFor="full_name">Full name</FieldLabel>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="CubeX Explorer"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      disabled={loading}
                      aria-invalid={!!errors.full_name}
                    />
                    {errors.full_name && (
                      <FieldError>{errors.full_name}</FieldError>
                    )}
                  </Field>
                  <Field data-invalid={!!errors.username}>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      id="username"
                      name="username"
                      placeholder="cubex_user"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={loading}
                      aria-invalid={!!errors.username}
                    />
                    {errors.username && (
                      <FieldError>{errors.username}</FieldError>
                    )}
                  </Field>
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
                    <FieldLabel htmlFor="password">Password</FieldLabel>
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
                    {errors.password && (
                      <FieldError>{errors.password}</FieldError>
                    )}
                  </Field>
                  <Button className="w-full" disabled={loading} type="submit">
                    {loading ? <Spinner /> : "Create account"}
                  </Button>
                </CardContent>
              </form>
              <CardFooter className="text-sm text-muted-foreground">
                Already have an account?&nbsp;
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
