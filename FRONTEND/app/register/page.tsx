"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordValid = password.length >= 8;
  const matches = confirm.length > 0 && confirm === password;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!passwordValid || !matches) return;
    setLoading(true);
    // Mocked registration — real signup will call auth-service (Spring Boot) here.
    setTimeout(() => router.push("/dashboard"), 600);
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar variant="public" />
      <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start checking suspicious content in under a minute.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm text-ink-dim">
                  Name
                </label>
                <Input id="name" placeholder="Your full name" required />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm text-ink-dim">
                  Email
                </label>
                <Input id="email" type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm text-ink-dim">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {touched && !passwordValid && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-risk-high">
                    <X className="h-3 w-3" /> Must be at least 8 characters
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-sm text-ink-dim">
                  Confirm password
                </label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                {confirm.length > 0 && (
                  <p
                    className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                      matches ? "text-risk-safe" : "text-risk-high"
                    }`}
                  >
                    {matches ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {matches ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
