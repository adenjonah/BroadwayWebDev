import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const stage = params.get('stage');
  const minScore = params.get('minScore');
  const jobId = params.get('jobId');
  const search = params.get('search');
  const sortBy = params.get('sortBy') ?? 'discovered_at';
  const sortDir = params.get('sortDir') === 'asc' ? true : false;
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') ?? '25', 10)));

  let query = supabase.from('leads').select('*', { count: 'exact' });

  if (stage) {
    query = query.eq('stage', stage);
  }

  if (minScore) {
    query = query.gte('lead_score', parseInt(minScore, 10));
  }

  if (jobId) {
    query = query.eq('scrape_job_id', jobId);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortDir })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }

  return NextResponse.json({
    data,
    meta: { total: count ?? 0, page, limit },
  });
}
