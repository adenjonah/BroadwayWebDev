import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Cancel / abandon a job
export async function DELETE(
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

  if (job.status === 'completed' || job.status === 'failed') {
    return NextResponse.json({ error: 'Job already finished' }, { status: 400 });
  }

  await supabase
    .from('scrape_jobs')
    .update({
      status: 'failed',
      error_message: 'Cancelled by user',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id);

  return NextResponse.json({ success: true });
}

// Re-run a job (creates a new job with the same params and triggers the worker)
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

  const { data: original } = await supabase
    .from('scrape_jobs')
    .select('center_lat, center_lng, radius_miles, query_filter')
    .eq('id', id)
    .single();

  if (!original) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Create a new job with the same parameters
  const { data: newJob, error: insertError } = await supabase
    .from('scrape_jobs')
    .insert({
      center_lat: original.center_lat,
      center_lng: original.center_lng,
      radius_miles: original.radius_miles,
      query_filter: original.query_filter,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (insertError || !newJob) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }

  // Trigger the worker
  const workerUrl = process.env.WORKER_URL;
  const workerToken = process.env.WORKER_AUTH_TOKEN;

  if (workerUrl && workerToken) {
    try {
      await fetch(`${workerUrl}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: newJob.id, auth_token: workerToken }),
      });
    } catch {
      // Worker will wake up
    }
  }

  return NextResponse.json({ jobId: newJob.id });
}
