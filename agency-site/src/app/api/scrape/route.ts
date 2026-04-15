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

  // Create the job in Supabase
  const { data: job, error: insertError } = await supabase
    .from('scrape_jobs')
    .insert({
      center_lat: lat,
      center_lng: lng,
      radius_miles: radiusMiles,
      query_filter: query ?? '',
      created_by: user.id,
    })
    .select('id')
    .single();

  if (insertError || !job) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }

  // Trigger the Fly.io worker
  const workerUrl = process.env.WORKER_URL;
  const workerToken = process.env.WORKER_AUTH_TOKEN;

  if (workerUrl && workerToken) {
    try {
      await fetch(`${workerUrl}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id, auth_token: workerToken }),
      });
    } catch {
      // Worker might be sleeping — it will wake up.
      // Job is in Supabase either way; worst case, retry manually.
    }
  }

  return NextResponse.json({ jobId: job.id });
}
