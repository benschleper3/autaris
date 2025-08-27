"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/config"

export default function TestSupabase() {
  const [message, setMessage] = useState("Testing Supabase...")

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from('"benschleper3\'s Project"').select("*").limit(1)
      if (error) {
        setMessage("❌ Supabase connection failed: " + error.message)
      } else {
        setMessage("✅ Supabase connected! Rows fetched: " + data.length)
      }
    }
    testConnection()
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <p>{message}</p>
    </div>
  )
}