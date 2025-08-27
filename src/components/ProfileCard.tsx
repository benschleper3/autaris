"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/config"

export default function ProfileCard() {
  const [state, setState] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) return setErr(userErr.message)
      if (!user) return setErr("Not signed in.")

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, plan, timezone, created_at")
        .eq("id", user.id)
        .single()

      if (error) return setErr(error.message)
      setState({ email: user.email, ...data })
    })()
  }, [])

  return (
    <div className="p-4 rounded-xl border space-y-2">
      <h3 className="font-semibold">My Profile</h3>
      {err ? <p className="text-sm text-red-600">❌ {err}</p> :
        <pre className="text-xs bg-black/5 p-2 rounded">{JSON.stringify(state, null, 2)}</pre>}
    </div>
  )
}