import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LeadStage } from '@/lib/types/scraping';

const VALID_STAGES: LeadStage[] = [
  'new', 'contacted_setter', 'contacted_closer',
  'hard_no', 'maybe_later', 'sold',
];

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { ids, stage } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
  }

  if (!VALID_STAGES.includes(stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }

  const { error } = await supabase
    .from('leads')
    .update({ stage })
    .in('id', ids);

  if (error) {
    return NextResponse.json({ error: 'Failed to update leads' }, { status: 500 });
  }

  return NextResponse.json({ updated: ids.length });
}
