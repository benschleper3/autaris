"use client"

import { useState } from "react"
import { supabase } from "@/lib/config"

type View = "sign-in" | "sign-up"

export default function AuthForm() {
  const [view, setView] = useState<View>("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)


  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
            phone: phone || null,
            plan: 'Starter',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      })
      if (error) throw error
      setMessage("✅ Account created. If email confirmation is enabled, check your inbox, then sign in.")
      setView("sign-in")
    } catch (err: any) {
      setMessage("❌ " + (err?.message || "Sign-up failed"))
    } finally {
      setLoading(false)
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    console.log("SIGN IN", { email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) setMessage("✅ Signed in")
    } catch (err: any) {
      // Show exact error message
      setMessage("❌ " + (err?.message || "Sign-in failed"))
    } finally {
      setLoading(false)
    }
  }

  async function sendReset() {
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      })
      if (error) throw error
      setMessage("📧 Password reset email sent. Check your inbox.")
    } catch (err: any) {
      setMessage("❌ " + (err?.message || "Could not send reset email"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 rounded-2xl border max-w-md w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{view === "sign-in" ? "Sign in" : "Create account"}</h2>
        <button
          onClick={() => setView(view === "sign-in" ? "sign-up" : "sign-in")}
          className="text-sm underline"
        >
          {view === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>

      {view === "sign-up" && (
        <>
          <div className="space-y-1">
            <label className="text-sm">Full name (optional)</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Ben Schleper"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Phone number</label>
            <input
              type="tel"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <form onSubmit={view === "sign-in" ? handleSignIn : handleSignUp} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {view === "sign-in" && (
          <button
            type="button"
            onClick={sendReset}
            className="text-sm underline"
          >
            Forgot password?
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border px-3 py-2 hover:bg-black/5 disabled:opacity-50"
        >
          {loading ? "Working…" : view === "sign-in" ? "Sign in" : "Sign up"}
        </button>
      </form>

      {message && <p className="text-sm">{message}</p>}
    </div>
  )
}