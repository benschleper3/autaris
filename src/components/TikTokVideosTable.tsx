import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TikTokVideo = {
  video_id: string;
  title: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
  create_time: string | null;
  cover_image_url: string | null;
};

export default function TikTokVideosTable() {
  const [rows, setRows] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("tiktok_videos")
        .select("video_id,title,view_count,like_count,comment_count,share_count,create_time,cover_image_url")
        .eq("user_id", uid)
        .order("create_time", { ascending: false })
        .limit(50);

      if (!error && data) {
        setRows(data as any);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="rounded-2xl border p-4">Loading TikTok videos…</div>;
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border p-4">
        No videos yet. Click "Sync TikTok Videos" to fetch your content.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Video</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Shares</TableHead>
            <TableHead>Posted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.video_id}>
              <TableCell className="flex items-center gap-2">
                {r.cover_image_url && (
                  <img
                    src={r.cover_image_url}
                    alt=""
                    className="h-10 w-8 object-cover rounded"
                  />
                )}
                <a
                  href={`https://www.tiktok.com/@/video/${r.video_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-primary"
                >
                  {r.title || r.video_id}
                </a>
              </TableCell>
              <TableCell>{r.view_count?.toLocaleString() ?? "–"}</TableCell>
              <TableCell>{r.like_count?.toLocaleString() ?? "–"}</TableCell>
              <TableCell>{r.comment_count?.toLocaleString() ?? "–"}</TableCell>
              <TableCell>{r.share_count?.toLocaleString() ?? "–"}</TableCell>
              <TableCell>
                {r.create_time
                  ? new Date(r.create_time).toLocaleDateString()
                  : "–"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
