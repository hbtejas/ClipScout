import { NextRequest, NextResponse } from 'next/server';
import { getVideo, updateVideoStatus } from '@/lib/data/videos';
import { coreClient } from '@/lib/core-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;

    // 1. Fetch the video row by Supabase ID (RLS will ensure the requesting user owns it)
    const video = await getVideo(videoId);

    if (!video) {
      return NextResponse.json({ error: 'Video not found or access denied' }, { status: 404 });
    }

    if (!video.core_video_id) {
      return NextResponse.json({ status: video.status, message: 'Core video ID not assigned' });
    }

    // 2. Poll core engine for the current processing status
    const coreStatus = await coreClient.getVideoStatus(video.core_video_id);

    // 3. Update the Supabase record with latest progress and stage
    const updatedVideo = await updateVideoStatus(videoId, {
      status: coreStatus.status,
      analysis_stage: coreStatus.analysis_stage,
      duration_seconds: coreStatus.duration_seconds || video.duration_seconds || undefined,
      error_message: coreStatus.error_message || undefined,
    });

    return NextResponse.json({
      video: updatedVideo,
      core: coreStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
  }
}

