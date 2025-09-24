"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

export default function ProfileCard() {
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  async function loadProfile() {
    setMessage(null)
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      setMessage(userErr?.message || "Not signed in.")
      return
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, plan, timezone, created_at")
      .eq("id", user.id)
      .single()
    if (error) setMessage("❌ " + error.message)
    else {
      setProfile(data)
      setFullName(data?.full_name || "")
    }
  }

  async function save() {
    if (!profile) return
    setMessage(null)
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id)
    setMessage(error ? "❌ " + error.message : "✅ Profile updated")
  }

  useEffect(() => { loadProfile() }, [])

  return (
    <div className="p-4 rounded-xl border space-y-3 max-w-md">
      <h3 className="font-semibold">My Profile</h3>
      {message && <p className="text-sm">{message}</p>}
      {profile ? (
        <>
          <p><b>Plan:</b> {profile.plan}</p>
          <p><b>Timezone:</b> {profile.timezone}</p>
          <p><b>Created:</b> {new Date(profile.created_at).toLocaleString()}</p>
          <label className="text-sm">Full name</label>
          <input className="w-full rounded-lg border px-3 py-2" value={fullName} onChange={e=>setFullName(e.target.value)} />
          <button onClick={save} className="w-full rounded-lg border px-3 py-2 hover:bg-black/5">Save</button>
        </>
      ) : <p>Loading…</p>}
    </div>
  )
}