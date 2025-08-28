"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/config"

type View = "sign-in" | "sign-up"

function buildMeta(fullName?: string, phone?: string) {
  const name = (fullName ?? "").trim()
  const phoneNumber = (phone ?? "").trim()
  return {
    full_name: name.length ? name : null,
    phone: phoneNumber.length ? phoneNumber : null,
    plan: "Starter",
    timezone:
      typeof window !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
        : "UTC",
  }
}

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
      // 1) Sign up with metadata
      const meta = buildMeta(fullName, phone)
      console.log("SIGN UP → metadata", meta)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: meta,
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      })
      if (signUpError) throw signUpError

      // 2) If a session exists (email confirmations off) or when user returns from confirm,
      //    force-sync metadata again to trigger update trigger reliably.
      if (signUpData?.user) {
        await supabase.auth.updateUser({ data: meta })
      }

      setMessage("✅ Account created. If email confirmation is enabled, check your inbox, then sign in.")
      setView("sign-in")
    } catch (err: any) {
      console.error("SIGN UP ERROR", err)
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
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError

      // Force a metadata sync right after first sign in to cover older accounts
      const meta = buildMeta(fullName, phone)
      console.log("SIGN IN → metadata sync", meta)
      await supabase.auth.updateUser({ data: meta })

      // Optional: verify profile is populated now
      const { data: userInfo } = await supabase.auth.getUser()
      if (userInfo?.user?.id) {
        const { data: profileRow, error: profileErr } = await supabase
          .from("profiles")
          .select("id,email,full_name,plan,timezone")
          .eq("id", userInfo.user.id)
          .maybeSingle()
        console.log("PROFILE AFTER AUTH", { profileRow, profileErr })
      }

      if (signInData.user) setMessage("✅ Signed in")
    } catch (err: any) {
      console.error("SIGN IN ERROR", err)
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
            <label className="text-sm">Phone number (optional)</label>
            <input
              type="tel"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

        {view === "sign-up" && (fullName.trim() || phone.trim() || email.trim()) && (
          <div className="text-xs p-2 rounded bg-black/5 mb-2">
            <div className="font-semibold">Submitting metadata</div>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(buildMeta(fullName, phone), null, 2)}
            </pre>
          </div>
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