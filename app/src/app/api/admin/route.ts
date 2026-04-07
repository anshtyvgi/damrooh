import { NextRequest, NextResponse } from "next/server";
import { getAdminStore } from "@/lib/adminStore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const module = searchParams.get("module");
  const store = getAdminStore();

  switch (module) {
    case "dashboard": {
      const totalUsers = store.users.length;
      const activeUsers = store.users.filter((u) => u.status === "active").length;
      const totalSongs = store.songs.length;
      const totalRevenue = store.transactions.filter((t) => t.type === "purchase" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
      const totalCoinsSpent = store.transactions.filter((t) => t.type === "spend").reduce((s, t) => s + Math.abs(t.coins), 0);
      const failedJobs = store.jobs.filter((j) => j.status === "failed").length;
      const queuedJobs = store.jobs.filter((j) => j.status === "queued" || j.status === "running").length;
      const pendingReports = store.reports.filter((r) => r.status === "pending").length;
      const conversionRate = totalUsers > 0 ? Math.round((store.users.filter((u) => u.totalSpent > 0).length / totalUsers) * 100) : 0;
      const avgCoinsPerUser = totalUsers > 0 ? Math.round(store.users.reduce((s, u) => s + u.totalSpent, 0) / totalUsers) : 0;

      return NextResponse.json({
        totalUsers, activeUsers, totalSongs, totalRevenue, totalCoinsSpent,
        failedJobs, queuedJobs, pendingReports, conversionRate, avgCoinsPerUser,
        recentTransactions: store.transactions.slice(0, 5),
        recentJobs: store.jobs.slice(0, 5),
      });
    }
    case "users":
      return NextResponse.json(store.users);
    case "user": {
      const id = searchParams.get("id");
      const user = store.users.find((u) => u.id === id);
      if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const userSongs = store.songs.filter((s) => s.userId === id);
      const userTxns = store.transactions.filter((t) => t.userId === id);
      const userJobs = store.jobs.filter((j) => j.userId === id);
      return NextResponse.json({ user, songs: userSongs, transactions: userTxns, jobs: userJobs });
    }
    case "songs":
      return NextResponse.json(store.songs);
    case "jobs":
      return NextResponse.json(store.jobs);
    case "transactions":
      return NextResponse.json(store.transactions);
    case "pricing":
      return NextResponse.json(store.pricing);
    case "reports":
      return NextResponse.json(store.reports);
    default:
      return NextResponse.json({ error: "Unknown module" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;
  const store = getAdminStore();

  switch (action) {
    case "add_coins": {
      const user = store.users.find((u) => u.id === body.userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      user.coinsBalance += body.amount;
      store.transactions.unshift({
        id: `t${Date.now()}`, userId: user.id, userName: user.name,
        coins: body.amount, amount: 0, type: "bonus", source: "admin",
        status: "completed", createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, newBalance: user.coinsBalance });
    }
    case "remove_coins": {
      const user = store.users.find((u) => u.id === body.userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      user.coinsBalance = Math.max(0, user.coinsBalance - body.amount);
      return NextResponse.json({ success: true, newBalance: user.coinsBalance });
    }
    case "ban_user": {
      const user = store.users.find((u) => u.id === body.userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      user.status = "banned";
      return NextResponse.json({ success: true });
    }
    case "unban_user": {
      const user = store.users.find((u) => u.id === body.userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      user.status = "active";
      return NextResponse.json({ success: true });
    }
    case "shadow_ban": {
      const user = store.users.find((u) => u.id === body.userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      user.status = "shadow_banned";
      return NextResponse.json({ success: true });
    }
    case "feature_song": {
      const song = store.songs.find((s) => s.id === body.songId);
      if (!song) return NextResponse.json({ error: "Song not found" }, { status: 404 });
      song.status = "featured";
      return NextResponse.json({ success: true });
    }
    case "remove_song": {
      const song = store.songs.find((s) => s.id === body.songId);
      if (!song) return NextResponse.json({ error: "Song not found" }, { status: 404 });
      song.status = "deleted";
      return NextResponse.json({ success: true });
    }
    case "retry_job": {
      const job = store.jobs.find((j) => j.id === body.jobId);
      if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
      job.status = "queued";
      job.errorMessage = null;
      return NextResponse.json({ success: true });
    }
    case "refund_job": {
      const job = store.jobs.find((j) => j.id === body.jobId);
      if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
      const user = store.users.find((u) => u.id === job.userId);
      if (user) {
        user.coinsBalance += job.cost;
        store.transactions.unshift({
          id: `t${Date.now()}`, userId: user.id, userName: user.name,
          coins: job.cost, amount: 0, type: "refund", source: "generate",
          status: "completed", createdAt: new Date().toISOString(),
        });
      }
      return NextResponse.json({ success: true });
    }
    case "update_pricing": {
      Object.assign(store.pricing, body.pricing);
      return NextResponse.json({ success: true, pricing: store.pricing });
    }
    case "resolve_report": {
      const report = store.reports.find((r) => r.id === body.reportId);
      if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
      report.status = body.resolution === "dismiss" ? "dismissed" : "reviewed";
      if (body.resolution === "remove") {
        const song = store.songs.find((s) => s.id === report.songId);
        if (song) song.status = "deleted";
      }
      return NextResponse.json({ success: true });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
