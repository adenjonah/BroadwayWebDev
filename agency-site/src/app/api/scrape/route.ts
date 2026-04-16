import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { lat, lng, radiusMiles, query } = body;

  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof radiusMiles !== 'number') {
    return NextResponse.json({ error: 'lat, lng, and radiusMiles are required numbers' }, { status: 400 });
  }

  if (radiusMiles <= 0 || radiusMiles > 50) {
    return NextResponse.json({ error: 'radiusMiles must be between 0 and 50' }, { status: 400 });
  }

  // Create the job in Supabase — return the full row so the client can
  // optimistically render it before Realtime fires.
  const { data: job, error: insertError } = await supabase
    .from('scrape_jobs')
    .insert({
      center_lat: lat,
      center_lng: lng,
      radius_miles: radiusMiles,
      query_filter: query ?? '',
      created_by: user.id,
    })
    .select('*')
    .single();

  if (insertError || !job) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }

  // Trigger the Fly.io worker (30s timeout to allow cold start)
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
        body: JSON.stringify({ job_id: job.id, auth_token: workerToken }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        workerStatus = 'accepted';
      } else {
        const text = await res.text();
        workerStatus = `error_${res.status}: ${text}`;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'unknown error';
      workerStatus = `fetch_failed: ${message}`;
    }
  } else {
    workerStatus = 'no_worker_config';
  }

  return NextResponse.json({ jobId: job.id, job, workerStatus });
}
