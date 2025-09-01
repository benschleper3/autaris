export default function DebugRunSql() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Run Supabase SQL</h1>
      <ol className="list-decimal ml-6 space-y-2">
        <li>Open Supabase → SQL Editor → New query</li>
        <li>Open <code>src/sql/supabase_migration.sql</code> in your editor</li>
        <li>Copy all → paste into Supabase → click <b>Run</b></li>
      </ol>
      <p className="text-sm text-muted-foreground">After running, refresh your dashboard.</p>
    </main>
  );
}