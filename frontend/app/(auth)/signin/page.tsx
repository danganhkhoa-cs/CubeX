import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle>Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to continue your CubeX journey.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@cubex.io" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="********" />
          </div>
          <Button className="w-full">Sign in</Button>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          New here?&nbsp;
          <Link href="/signup" className="text-foreground hover:underline">
            Create an account
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
