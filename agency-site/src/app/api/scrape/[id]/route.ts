import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Get job details including found_places
export async function GET(
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
    .select('*')
    .eq('id', id)
    .single();

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ data: job });
}

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

  // Delete the job entirely — removes from view
  await supabase
    .from('scrape_jobs')
    .delete()
    .eq('id', id);

  return NextResponse.json({ success: true });
}

// Re-run a job — resets it in place and re-triggers the worker
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

  // Reset the job to pending state
  const { error: updateError } = await supabase
    .from('scrape_jobs')
    .update({
      status: 'pending',
      tiles_total: 0,
      tiles_done: 0,
      total_found: 0,
      qualified_count: 0,
      candidates_total: 0,
      candidates_verified: 0,
      error_message: null,
      started_at: null,
      completed_at: null,
      found_places: [],
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to reset job' }, { status: 500 });
  }

  // Trigger the worker
  const workerUrl = process.env.WORKER_URL;
  const workerToken = process.env.WORKER_AUTH_TOKEN;

  if (workerUrl && workerToken) {
    try {
      await fetch(`${workerUrl}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: id, auth_token: workerToken }),
      });
    } catch {
      // Worker will wake up
    }
  }

  return NextResponse.json({ jobId: id });
}
