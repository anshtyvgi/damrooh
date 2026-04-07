import { NextRequest, NextResponse } from "next/server";

const ACE_API_KEY = process.env.ACE_API_KEY!;
const DEV_MODE = process.env.DEV_MODE === "true";
const ACE_STATUS_URL = "https://api.wavespeed.ai/api/v3/predictions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const generationId = searchParams.get("id");

  if (!generationId) {
    return NextResponse.json({ error: "Missing generation ID" }, { status: 400 });
  }

  try {
    const state = global.generationStore?.get(generationId);

    if (!state) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    // If already completed or failed, return cached
    if (state.status === "completed" || state.status === "failed") {
      return NextResponse.json({
        id: state.id,
        status: state.status,
        posterUrl: state.posterUrl,
        tracks: state.tracks.map((t) => ({
          id: t.id,
          status: t.status,
          audioUrl: t.audioUrl,
        })),
        lyrics: state.tracks.map((t) => t.lyrics).filter(Boolean).join("\n\n---\n\n"),
      });
    }

    // Dev mode: just return current state (timeouts in generate handle updates)
    if (DEV_MODE) {
      const allCompleted = state.tracks.every((t) => t.status === "completed");
      if (allCompleted) state.status = "completed";
      global.generationStore.set(generationId, state);

      return NextResponse.json({
        id: state.id,
        status: state.status,
        posterUrl: state.posterUrl,
        tracks: state.tracks.map((t) => ({
          id: t.id,
          status: t.status,
          audioUrl: t.audioUrl,
        })),
        lyrics: state.tracks.map((t) => t.lyrics).filter(Boolean).join("\n\n---\n\n"),
      });
    }

    // Poll ACE for each track still processing
    const updatedTracks = await Promise.all(
      state.tracks.map(async (track) => {
        if (track.status === "completed" || track.status === "failed" || !track.aceTaskId) {
          return track;
        }

        try {
          // Step 1: Check status
          const statusRes = await fetch(`${ACE_STATUS_URL}/${track.aceTaskId}`, {
            headers: { Authorization: `Bearer ${ACE_API_KEY}` },
          });

          if (!statusRes.ok) {
            console.error(`ACE status failed for ${track.aceTaskId}: ${statusRes.status}`);
            return track;
          }

          const statusData = await statusRes.json();
          console.log(`ACE [${track.id}] status: ${statusData.status}`);

          if (statusData.status === "completed") {
            // Step 2: Fetch result from /result endpoint
            const resultRes = await fetch(`${ACE_STATUS_URL}/${track.aceTaskId}/result`, {
              headers: { Authorization: `Bearer ${ACE_API_KEY}` },
            });

            if (!resultRes.ok) {
              const errText = await resultRes.text();
              console.error(`ACE result failed for ${track.aceTaskId}: ${resultRes.status}`, errText);
              // Still mark as completed even if result fetch fails
              return { ...track, status: "completed" as const };
            }

            const resultData = await resultRes.json();
            console.log(`ACE [${track.id}] result:`, JSON.stringify(resultData).slice(0, 500));

            // Per docs: webhook format has "outputs": ["<output_url>"]
            // The /result endpoint likely returns similar
            let audioUrl: string | null = null;

            if (resultData.outputs && Array.isArray(resultData.outputs) && resultData.outputs.length > 0) {
              audioUrl = resultData.outputs[0];
            } else if (resultData.output && typeof resultData.output === "string") {
              audioUrl = resultData.output;
            } else if (resultData.output?.url) {
              audioUrl = resultData.output.url;
            } else if (resultData.output?.audio_url) {
              audioUrl = resultData.output.audio_url;
            } else if (resultData.url) {
              audioUrl = resultData.url;
            } else if (resultData.audio_url) {
              audioUrl = resultData.audio_url;
            }

            console.log(`Track ${track.id} completed. Audio: ${audioUrl}`);

            return {
              ...track,
              status: "completed" as const,
              audioUrl,
            };
          } else if (statusData.status === "failed") {
            console.error(`Track ${track.id} failed:`, statusData.error || "unknown");
            return { ...track, status: "failed" as const };
          }

          // pending / processing
          return { ...track, status: "processing" as const };
        } catch (err) {
          console.error(`Error polling ACE for ${track.aceTaskId}:`, err);
          return track;
        }
      })
    );

    state.tracks = updatedTracks;

    const allCompleted = updatedTracks.every((t) => t.status === "completed");
    const anyFailed = updatedTracks.some((t) => t.status === "failed");
    const allDone = updatedTracks.every((t) => t.status === "completed" || t.status === "failed");

    if (allCompleted) {
      state.status = "completed";
    } else if (allDone && anyFailed) {
      state.status = "failed";
    }

    global.generationStore.set(generationId, state);

    return NextResponse.json({
      id: state.id,
      status: state.status,
      posterUrl: state.posterUrl,
      tracks: state.tracks.map((t) => ({
        id: t.id,
        status: t.status,
        audioUrl: t.audioUrl,
      })),
      lyrics: state.tracks.map((t) => t.lyrics).filter(Boolean).join("\n\n---\n\n"),
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
