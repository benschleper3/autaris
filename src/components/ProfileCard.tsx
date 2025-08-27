"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/config"

export default function ProfileCard() {
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  async function loadProfile() {
    setLoading(true)
    setMessage(null)
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) {
        setMessage("Not signed in.")
        return
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, plan, timezone, created_at")
        .eq("id", user.id)
        .single()
      if (error) throw error
      setProfile(data)
      setFullName(data.full_name || "")
    } catch (err: any) {
      setMessage("❌ " + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveProfile() {
    if (!profile) return
    setMessage(null)
    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", profile.id)
      if (error) throw error
      setMessage("✅ Profile updated!")
    } catch (err: any) {
      setMessage("❌ " + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProfile() }, [])

  return (
    <div className="p-4 rounded-xl border space-y-3 max-w-md">
      <h3 className="font-semibold">My Profile</h3>
      {message && <p className="text-sm">{message}</p>}
      {profile ? (
        <>
          <p><strong>Plan:</strong> {profile.plan}</p>
          <p><strong>Timezone:</strong> {profile.timezone}</p>
          <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
          <div className="space-y-1">
            <label className="text-sm">Full Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={loading}
            className="w-full rounded-lg border px-3 py-2 hover:bg-black/5 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </>
      ) : (
        <p>{loading ? "Loading..." : "No profile found"}</p>
      )}
    </div>
  )
}