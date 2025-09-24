"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

export default function TestSupabase() {
  const [message, setMessage] = useState("Testing Supabase...")
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    const { data, error } = await supabase.from("healthchecks").select("*").order("id", { ascending: false }).limit(5)
    if (error) setMessage("❌ Supabase connection failed: " + error.message)
    else {
      setMessage("✅ Supabase connected! Rows fetched: " + data.length)
      setRows(data ?? [])
    }
  }

  useEffect(() => { load() }, [])

  async function addRow() {
    setLoading(true)
    try {
      const { error } = await supabase.from("healthchecks").insert({ note: "Manual ping from the UI" })
      if (error) throw error
      await load()
    } catch (e: any) {
      setMessage("❌ Insert failed: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 rounded-xl border space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={addRow}
          disabled={loading}
          className="px-3 py-2 rounded-lg border hover:bg-black/5 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add healthcheck"}
        </button>
        <span className="text-sm">{message}</span>
      </div>
      <pre className="text-xs bg-black/5 p-2 rounded">{JSON.stringify(rows, null, 2)}</pre>
    </div>
  )
}