"use client";

import { Heart, MessageCircle, Play, Share2 } from "lucide-react";
import { useState } from "react";

const posts = [
  { id: "1", user: "ansh", title: "Birthday song for Meera", occasion: "Birthday", genre: "Pop", gradient: "from-amber-300 to-rose-400", likes: 248, comments: 31, time: "2h" },
  { id: "2", user: "priya", title: "25th Anniversary — Maa Papa", occasion: "Anniversary", genre: "Classical", gradient: "from-rose-400 to-violet-500", likes: 562, comments: 84, time: "5h" },
  { id: "3", user: "raj", title: "Apology song — she forgave me", occasion: "Apology", genre: "Lo-fi", gradient: "from-sky-400 to-indigo-500", likes: 1420, comments: 213, time: "1d" },
  { id: "4", user: "neha", title: "Farewell for my best friend", occasion: "Farewell", genre: "Acoustic", gradient: "from-emerald-400 to-teal-500", likes: 891, comments: 127, time: "2d" },
  { id: "5", user: "karan", title: "Proposal song — she said YES!", occasion: "Love", genre: "Bollywood", gradient: "from-pink-400 to-red-500", likes: 3200, comments: 456, time: "3d" },
];

function formatNum(n: number) { return n >= 1000 ? (n / 1000).toFixed(1) + "k" : n.toString(); }

export default function CommunityPage() {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [activePost, setActivePost] = useState(posts[0]);

  const toggleLike = (id: string) => {
    setLiked((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#111]">Community</h1>
          <p className="text-sm text-[#999] mt-0.5">Discover what others are creating</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* LEFT — Feed */}
        <div className="lg:col-span-3 space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setActivePost(post)}
              className={`bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                activePost.id === post.id ? "border-[#111] shadow-sm" : "border-[#EAEAEA] hover:border-[#CCC]"
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Mini poster */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${post.gradient} flex items-center justify-center shrink-0 relative`}>
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-[#111]">@{post.user}</span>
                    <span className="text-[10px] text-[#CCC]">{post.time}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#111] truncate">{post.title}</p>
                  <p className="text-[11px] text-[#999]">{post.occasion} · {post.genre}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }} className="flex items-center gap-1 cursor-pointer">
                    <Heart className={`w-4 h-4 ${liked.has(post.id) ? "text-red-500 fill-red-500" : "text-[#CCC]"}`} />
                    <span className="text-[11px] text-[#999]">{formatNum(post.likes + (liked.has(post.id) ? 1 : 0))}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-[#CCC]" />
                    <span className="text-[11px] text-[#999]">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT — Sticky preview */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-4">
            <div className="bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden">
              <div className={`aspect-square bg-gradient-to-br ${activePost.gradient} relative flex items-center justify-center`}>
                <div className="absolute inset-0 banner-overlay opacity-30" />
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-white/30 transition-colors">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                  <p className="text-white font-bold text-lg">{activePost.title}</p>
                  <p className="text-white/60 text-sm mt-1">@{activePost.user}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#666]">
                  <span>{activePost.occasion}</span>
                  <span className="w-1 h-1 rounded-full bg-[#DDD]" />
                  <span>{activePost.genre}</span>
                </div>
                <div className="h-1 rounded-full bg-[#F0F0F0]">
                  <div className="w-0 h-full rounded-full bg-[#111]" />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] text-xs font-semibold text-[#666] hover:border-[#CCC] transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                    <Heart className="w-3 h-3" /> Like
                  </button>
                  <button
                    className="flex-1 py-2 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] text-xs font-semibold text-[#666] hover:border-[#CCC] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    onClick={async () => {
                      if (navigator.share) await navigator.share({ title: activePost.title, url: window.location.origin }).catch(() => {});
                      else await navigator.clipboard.writeText(window.location.origin);
                    }}
                  >
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
