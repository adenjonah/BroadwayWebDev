import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Resume a stalled job: flips status back to pending WITHOUT clearing
// tiles_done / found_places / candidates_verified, and re-triggers the
// Fly worker. The worker's execute_job detects the existing progress
// and picks up from where the last run died.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: job } = await supabase
    .from('scrape_jobs')
    .select('status')
    .eq('id', id)
    .single();

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Only reset the status marker. Progress columns (tiles_done,
  // found_places, candidates_verified, qualified_count) stay as they are
  // so the worker can skip ahead.
  const { error: updateError } = await supabase
    .from('scrape_jobs')
    .update({
      status: 'pending',
      error_message: null,
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to reset job status' }, { status: 500 });
  }

  const workerUrl = process.env.WORKER_URL;
  const workerToken = process.env.WORKER_AUTH_TOKEN;
  let workerStatus = 'not_triggered';

  if (workerUrl && workerToken) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${workerUrl}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: id, auth_token: workerToken }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      workerStatus = res.ok ? 'accepted' : `error_${res.status}`;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'unknown error';
      workerStatus = `fetch_failed: ${message}`;
    }
  } else {
    workerStatus = 'no_worker_config';
  }

  return NextResponse.json({ jobId: id, workerStatus });
}
