export type ResponseTone = 'positive' | 'neutral' | 'objection' | 'negative';
export type TerminalOutcome = 'booked' | 'callback' | 'not_interested' | 'wrong_number';

export interface CallResponse {
  label: string;
  next: string;
  tone?: ResponseTone;
}

export interface CallNode {
  id: string;
  speaker: 'setter' | 'outcome';
  line: string;
  note?: string;
  responses: CallResponse[];
  terminal?: TerminalOutcome;
}

export const START_NODE_ID = 'opening';

export const SCRIPT: Record<string, CallNode> = {
  // ─── QUALIFICATION ─────────────────────────────────────
  opening: {
    id: 'opening',
    speaker: 'setter',
    line: "Hi — real quick, is this the owner of {business_name}?",
    note: "Open with owner qualification, NOT your name. Confident, casual, no apology. If anyone but the owner picks up, go to gatekeeper branch — we ONLY pitch owners.",
    responses: [
      { label: "Yes, this is the owner", next: 'pattern_interrupt', tone: 'positive' },
      { label: "Yes, speaking (no clarification)", next: 'pattern_interrupt', tone: 'positive' },
      { label: "No — I'm the manager / receptionist / spouse", next: 'gatekeeper_assumptive', tone: 'neutral' },
      { label: "Who is this? / What's this about?", next: 'reframe_identity', tone: 'neutral' },
      { label: "Owner isn't here right now", next: 'gatekeeper_callback', tone: 'neutral' },
      { label: "There's no owner / wrong number", next: 'out_wrong_number', tone: 'negative' },
    ],
  },

  reframe_identity: {
    id: 'reframe_identity',
    speaker: 'setter',
    line: "Fair question — this is {setter_name} with Broadway Web Dev. I'll keep it to 30 seconds. Just need to confirm first — are you the owner of {business_name}?",
    note: "Don't pitch yet. Re-anchor on owner qualification. Confident tone earns the next question.",
    responses: [
      { label: "Yes I'm the owner", next: 'pattern_interrupt', tone: 'positive' },
      { label: "No I'm not the owner", next: 'gatekeeper_assumptive', tone: 'neutral' },
      { label: "Still want more detail before I say", next: 'gatekeeper_regarding', tone: 'neutral' },
      { label: "Not interested / hangs up energy", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  // ─── GATEKEEPER ────────────────────────────────────────
  gatekeeper_assumptive: {
    id: 'gatekeeper_assumptive',
    speaker: 'setter',
    line: "No worries — could you put me through to {owner_first_name}? Should just take 60 seconds of their time.",
    note: "Assumptive transfer. First-name-only + confident tone = gets through more often than explaining why. DO NOT pitch the gatekeeper — they'll kill the lead.",
    responses: [
      { label: "Sure, hold on / transferring", next: 'owner_transferred', tone: 'positive' },
      { label: "What's this regarding?", next: 'gatekeeper_regarding', tone: 'neutral' },
      { label: "They're not in right now", next: 'gatekeeper_callback', tone: 'neutral' },
      { label: "I handle all calls like this", next: 'gatekeeper_regarding', tone: 'objection' },
      { label: "Hard no / don't call back", next: 'out_not_interested', tone: 'negative' },
    ],
  },

  gatekeeper_regarding: {
    id: 'gatekeeper_regarding',
    speaker: 'setter',
    line: "Totally fair. I'm reaching out because we found something on {business_name}'s online setup that's probably costing them leads right now. I just need 60 seconds with {owner_first_name} to flag it — then they can decide what to do with it.",
    note: "Stay vague and intriguing — 'something costing them leads.' Don't give the full pitch to the gatekeeper. If pushed harder, pivot to a callback.",
    responses: [
      { label: "Let me check if they can talk", next: 'owner_transferred', tone: 'positive' },
      { label: "Leave a message / I'll pass it on", next: 'gatekeeper_callback', tone: 'neutral' },
      { label: "We're not interested, whatever it is", next: 'out_not_interested', tone: 'negative' },
    ],
  },

  gatekeeper_callback: {
    id: 'gatekeeper_callback',
    speaker: 'setter',
    line: "No problem. When's {owner_first_name} usually around — morning, afternoon, or end of day? And what's the best way to reach them directly?",
    note: "Lock a specific window + ideally a direct line or cell. Vague = never happens. Get their name too so you can ask for them by name next call.",
    responses: [
      { label: "Got a time window + name", next: 'out_callback', tone: 'positive' },
      { label: "They won't say — just 'call back later'", next: 'out_callback', tone: 'neutral' },
      { label: "Don't call back / take us off list", next: 'out_not_interested', tone: 'negative' },
    ],
  },

  owner_transferred: {
    id: 'owner_transferred',
    speaker: 'setter',
    line: "Hey {owner_first_name}, thanks for hopping on. This is {setter_name} with Broadway Web Dev. Quick one — do you want the good news or the bad news first?",
    note: "Fresh start now that the owner is on. Pattern interrupt immediately — no apology for taking their time. Smile through the phone.",
    responses: [
      { label: "Bad news first", next: 'bad_news', tone: 'positive' },
      { label: "Good news first", next: 'good_news', tone: 'positive' },
      { label: "Just tell me what this is", next: 'bad_news', tone: 'neutral' },
      { label: "I'm busy / bad time", next: 'obj_busy', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  // ─── PATTERN INTERRUPT ─────────────────────────────────
  pattern_interrupt: {
    id: 'pattern_interrupt',
    speaker: 'setter',
    line: "Awesome. OK, weird question — do you want the good news or the bad news first?",
    note: "THE pattern interrupt. \"Weird question\" primes them for something unusual without tipping it's a sales line. Say it playfully, not salesy. Pause after — make them pick. If they can't pick, default to bad news (curiosity gap). DON'T apologize or disclaim — it weakens the interrupt.",
    responses: [
      { label: "Bad news first", next: 'bad_news', tone: 'positive' },
      { label: "Good news first", next: 'good_news', tone: 'positive' },
      { label: "Just give me both / skip the games", next: 'bad_news', tone: 'neutral' },
      { label: "Is this a sales call? / What's this about?", next: 'reframe_playful', tone: 'neutral' },
      { label: "I'm busy right now", next: 'obj_busy', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  reframe_playful: {
    id: 'reframe_playful',
    speaker: 'setter',
    line: "Honestly? Kind of. But I found something about {business_name} online that you'd actually want to know — 30 seconds and you can hang up if it's not useful. Good news or bad news first?",
    note: "Transparent beats evasive. Admit it's a sales call, then pivot fast to the specific value. Giving them permission to hang up (\"you can hang up\") paradoxically lowers their defenses.",
    responses: [
      { label: "Bad news first", next: 'bad_news', tone: 'positive' },
      { label: "Good news first", next: 'good_news', tone: 'positive' },
      { label: "Not interested — hangs up", next: 'out_not_interested', tone: 'negative' },
    ],
  },

  // ─── BAD NEWS / GOOD NEWS ──────────────────────────────
  bad_news: {
    id: 'bad_news',
    speaker: 'setter',
    line: "Bad news: I looked at {business_name}'s online setup. Either no website, an outdated one, or your phone's going to voicemail after hours. In your industry that's real money walking to your competitor every week — easily a few thousand a month in leads you're never even seeing.",
    note: "Be specific: pull the actual detail from the lead card (no site / outdated / bad mobile / no reviews). Vague pain = no pain. Let it land — 2-second silence after.",
    responses: [
      { label: "OK… and the good news?", next: 'good_news', tone: 'positive' },
      { label: "We do fine, we have enough business", next: 'obj_enough_business', tone: 'objection' },
      { label: "We already have a website", next: 'obj_have_site', tone: 'objection' },
      { label: "How much to fix it?", next: 'obj_price', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  good_news: {
    id: 'good_news',
    speaker: 'setter',
    line: "Good news: we fix both sides of that. We build clean, affordable websites for local businesses AND we set up an AI receptionist that answers every call 24/7, qualifies the lead, and books the appointment for you — even at 11 PM on a Sunday. Owners we work with usually pay for the whole thing with the first month of after-hours bookings they used to miss. Worth 15 minutes with our designer to see what it'd look like for {business_name}?",
    note: "This is the full pitch. The AI receptionist angle is the hook — lead with 'never miss a call.' Ask for the 15-min meeting immediately after.",
    responses: [
      { label: "Yeah let's book it", next: 'book_time', tone: 'positive' },
      { label: "Tell me more first", next: 'pitch_details', tone: 'positive' },
      { label: "How much does all that cost?", next: 'obj_price', tone: 'objection' },
      { label: "Send me info / email first", next: 'obj_send_info', tone: 'objection' },
      { label: "We already have a website", next: 'obj_have_site', tone: 'objection' },
      { label: "We don't need AI stuff", next: 'obj_no_ai', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  pitch_details: {
    id: 'pitch_details',
    speaker: 'setter',
    line: "Totally — here's the short version. Our designer gets on a 15-minute call, looks at your current setup, and gives you a straight-up quote for either just the website, just the AI receptionist, or both. Zero obligation. Most owners get real numbers out of it even if they don't buy. Want me to grab you a slot?",
    note: "Emphasize 15 min + straight quote + zero obligation. Assume the close.",
    responses: [
      { label: "OK let's do it", next: 'book_time', tone: 'positive' },
      { label: "How much is it roughly?", next: 'obj_price', tone: 'objection' },
      { label: "Just send info first", next: 'obj_send_info', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  // ─── OBJECTIONS ────────────────────────────────────────
  obj_enough_business: {
    id: 'obj_enough_business',
    speaker: 'setter',
    line: "That's actually awesome to hear. Quick one though — if more leads DID come in next month, would you turn them away, or would you want them? Because the AI receptionist part is basically free money when it works — it's picking up calls you're literally not answering right now.",
    note: "NEPQ reframe — make them reveal whether they'd actually turn down more revenue. Almost nobody says 'yes, turn it away.' If they do, respect it and exit.",
    responses: [
      { label: "Sure, I'd take more leads", next: 'good_news', tone: 'positive' },
      { label: "Honestly we're maxed out", next: 'out_not_interested', tone: 'negative' },
      { label: "Maybe down the road", next: 'book_callback', tone: 'neutral' },
    ],
  },

  obj_have_site: {
    id: 'obj_have_site',
    speaker: 'setter',
    line: "Nice — out of curiosity, when's the last time it actually got you a brand new customer? Or are most of your leads still coming from word of mouth and repeats?",
    note: "Classic NEPQ. Don't argue with their site — make them say it's not pulling weight. If they brag, pivot clean to AI receptionist angle (different problem).",
    responses: [
      { label: "Honestly, hard to say / not many", next: 'pitch_ai_angle', tone: 'positive' },
      { label: "Mostly word of mouth, yeah", next: 'pitch_ai_angle', tone: 'positive' },
      { label: "We get plenty from the site", next: 'pitch_ai_only', tone: 'neutral' },
      { label: "We love our current site — no changes", next: 'pitch_ai_only', tone: 'objection' },
      { label: "Not interested in any of this", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  pitch_ai_angle: {
    id: 'pitch_ai_angle',
    speaker: 'setter',
    line: "That's what we hear a lot. So the play is: we rebuild the site so Google actually shows you when people search locally, AND the AI receptionist catches every call that would've gone to voicemail. Two leaks, one fix. 15 minutes with our designer, straight quote. Want me to hold a time?",
    note: "Tie both offers together. 'Two leaks, one fix' is memorable. Keep pushing toward the 15-min ask.",
    responses: [
      { label: "OK book it", next: 'book_time', tone: 'positive' },
      { label: "How much?", next: 'obj_price', tone: 'objection' },
      { label: "Send info first", next: 'obj_send_info', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  pitch_ai_only: {
    id: 'pitch_ai_only',
    speaker: 'setter',
    line: "Fair enough — forget the website then. One question: how many calls a week do you think you're missing? Because even if your site is crushing it, every call after hours that goes to voicemail is usually gone to your competitor. Our AI receptionist answers 24/7, books appointments, and costs way less than a part-time person. Worth a 15-min look?",
    note: "Pivot completely to AI. Don't re-pitch the website — they said no. AI receptionist is the standalone hook: missed calls = lost revenue, plus the cost comparison lands (AI ~$300/mo vs human receptionist $4K/mo).",
    responses: [
      { label: "OK that's interesting — book it", next: 'book_time', tone: 'positive' },
      { label: "How much is just the AI?", next: 'obj_price', tone: 'objection' },
      { label: "We don't miss calls", next: 'obj_not_interested', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  obj_no_ai: {
    id: 'obj_no_ai',
    speaker: 'setter',
    line: "Totally get it — AI is buzzword-heavy right now. This isn't chatbot stuff. It's literally: a phone number rings 24/7, answers in a normal voice, asks the basic qualifying questions you'd ask, and drops the booked appointment in your calendar. We can even skip that part and just do the website. 15-min call either way?",
    note: "Demystify. Don't say 'AI' too much — describe what it DOES. Offer the website-only path as a fallback.",
    responses: [
      { label: "OK if it's just a better phone line, book it", next: 'book_time', tone: 'positive' },
      { label: "Just do the website then", next: 'pitch_details', tone: 'positive' },
      { label: "Still not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  obj_price: {
    id: 'obj_price',
    speaker: 'setter',
    line: "Totally fair — most owners ask that first. Honestly, most of the owners we work with felt the same way before they saw the numbers. Websites start at a few hundred bucks, and the AI receptionist is usually less than what a part-time person would run you for a week. But the 15-min call is literally there to get you a real quote — not a ballpark. Worth it to get the actual number?",
    note: "3 F's: Feel, Felt, Found. NEVER quote a firm price — that's the closer's job. Deflect to the free call every time.",
    responses: [
      { label: "OK yeah, book the call", next: 'book_time', tone: 'positive' },
      { label: "I just want a ballpark", next: 'obj_price_ballpark', tone: 'objection' },
      { label: "Too expensive no matter what", next: 'obj_not_interested', tone: 'negative' },
      { label: "Just email me pricing", next: 'obj_send_info', tone: 'objection' },
    ],
  },

  obj_price_ballpark: {
    id: 'obj_price_ballpark',
    speaker: 'setter',
    line: "I hear you. Range is usually a few hundred to low thousands upfront for the site, and the AI piece runs a few hundred a month. But every owner's setup is different — my designer doesn't like me quoting numbers because he's the one who actually has to build it. 15 minutes, zero obligation, real number. Cool?",
    note: "Last-resort ballpark only — frame it wide and re-deflect to the 15-min call. Blame the designer for not quoting firm.",
    responses: [
      { label: "OK that's reasonable, book it", next: 'book_time', tone: 'positive' },
      { label: "Still too much", next: 'obj_not_interested', tone: 'negative' },
    ],
  },

  obj_busy: {
    id: 'obj_busy',
    speaker: 'setter',
    line: "Totally respect it — I won't keep you. Two options: either I grab you a 15-min slot tomorrow morning or afternoon for the real conversation, or I put you on our follow-up list for a better time. Which works?",
    note: "Don't pitch more. Just give two easy options. 'Follow-up list' is softer than 'callback.'",
    responses: [
      { label: "Book the 15 min now", next: 'book_time', tone: 'positive' },
      { label: "Follow-up / call me back later", next: 'book_callback', tone: 'neutral' },
      { label: "Neither, don't call back", next: 'out_not_interested', tone: 'negative' },
    ],
  },

  obj_send_info: {
    id: 'obj_send_info',
    speaker: 'setter',
    line: "Happy to — one quick question so I send something actually useful: are you more curious about the website side, the AI receptionist, or both?",
    note: "NEVER just send info — it's the email black hole. Qualify what they care about, THEN convert to a call.",
    responses: [
      { label: "Mostly the website", next: 'obj_send_info_convert', tone: 'neutral' },
      { label: "Mostly the AI receptionist", next: 'obj_send_info_convert', tone: 'neutral' },
      { label: "Both", next: 'obj_send_info_convert', tone: 'positive' },
      { label: "Just send the standard stuff", next: 'obj_send_info_convert', tone: 'neutral' },
    ],
  },

  obj_send_info_convert: {
    id: 'obj_send_info_convert',
    speaker: 'setter',
    line: "Got it — here's the thing: what takes my designer 5 minutes to walk you through live would take 4 emails to cover. Let me grab you a 15-min slot AND I'll send the email — if the email is enough, cancel the slot, no hard feelings. Deal?",
    note: "Classic bait-and-book. Offer both — the slot gets 'cancelled' way less than you'd think once it's on their calendar.",
    responses: [
      { label: "OK deal, book it", next: 'book_time', tone: 'positive' },
      { label: "Just email me, no slot", next: 'book_callback', tone: 'neutral' },
      { label: "Actually never mind", next: 'obj_not_interested', tone: 'negative' },
    ],
  },

  obj_not_interested: {
    id: 'obj_not_interested',
    speaker: 'setter',
    line: "Totally respect that. Before I let you go — honest question, no pitch: if you could flip a switch right now and have 3–5 more qualified leads show up at {business_name} next month, would you want that, or is your plate genuinely full?",
    note: "Soft takeaway + NEPQ discovery in one. Gives them one honest out without feeling sold-to. Almost nobody says 'plate is full.' If they do, respect it.",
    responses: [
      { label: "Sure, I'd take more leads", next: 'pitch_ai_angle', tone: 'positive' },
      { label: "Maybe in a few months", next: 'book_callback', tone: 'neutral' },
      { label: "Plate is genuinely full", next: 'out_not_interested', tone: 'negative' },
      { label: "Just take me off your list", next: 'out_not_interested', tone: 'negative' },
    ],
  },

  // ─── BOOKING ───────────────────────────────────────────
  book_time: {
    id: 'book_time',
    speaker: 'setter',
    line: "Love it. Our designer has tomorrow at 10 AM or 2 PM open — which one works better for {owner_first_name}? If neither, I'll find one that does.",
    note: "ALWAYS offer two specific times. Never ask 'when are you free' — it kills bookings. Use owner's first name to keep it personal.",
    responses: [
      { label: "Morning works (10 AM)", next: 'book_confirm_email', tone: 'positive' },
      { label: "Afternoon works (2 PM)", next: 'book_confirm_email', tone: 'positive' },
      { label: "Neither — need a different time", next: 'book_confirm_email', tone: 'neutral' },
      { label: "Actually, changed my mind", next: 'obj_not_interested', tone: 'negative' },
    ],
  },

  book_confirm_email: {
    id: 'book_confirm_email',
    speaker: 'setter',
    line: "Locked in. What's the best email for the calendar invite? I'll also shoot you a text 15 minutes before so you don't miss it.",
    note: "Read the email back letter-by-letter. Confirm the phone number too. This is where bookings get lost to typos.",
    responses: [
      { label: "Got email + time confirmed", next: 'out_booked', tone: 'positive' },
      { label: "Changed mind last second", next: 'obj_not_interested', tone: 'negative' },
    ],
  },

  book_callback: {
    id: 'book_callback',
    speaker: 'setter',
    line: "No problem — what specific day and 2-hour window works best? I'll call you right at the start of that window.",
    note: "Pin down a 2-hour window, not 'sometime next week.' Vague = never happens. Note any context ('seemed interested, just busy this week').",
    responses: [
      { label: "Got a specific day + window", next: 'out_callback', tone: 'positive' },
      { label: "They got vague / 'just try me sometime'", next: 'out_callback', tone: 'neutral' },
    ],
  },

  // ─── TERMINALS ─────────────────────────────────────────
  out_booked: {
    id: 'out_booked',
    speaker: 'outcome',
    line: "Appointment booked",
    note: "Log in CRM immediately: business, owner name, phone, email, appointment time, whether they're leaning website / AI / both. Send the calendar invite RIGHT NOW while it's fresh — every minute delay = drop in show rate.",
    terminal: 'booked',
    responses: [
      { label: "Start new call", next: START_NODE_ID, tone: 'neutral' },
    ],
  },

  out_callback: {
    id: 'out_callback',
    speaker: 'outcome',
    line: "Callback scheduled",
    note: "Log: business, owner name, phone, callback window, what stage they dropped at (never reached owner / pitched and stalled / price hesitation / etc). Set a reminder.",
    terminal: 'callback',
    responses: [
      { label: "Start new call", next: START_NODE_ID, tone: 'neutral' },
    ],
  },

  out_not_interested: {
    id: 'out_not_interested',
    speaker: 'outcome',
    line: "Not interested",
    note: "Mark lead dead. Note the REASON — 'already has someone,' 'bad timing,' 'hostile,' 'maxed out.' Reason tells us whether to retarget in 6 months or never call again.",
    terminal: 'not_interested',
    responses: [
      { label: "Start new call", next: START_NODE_ID, tone: 'neutral' },
    ],
  },

  out_wrong_number: {
    id: 'out_wrong_number',
    speaker: 'outcome',
    line: "Wrong number",
    note: "Flag the lead in the scraper so we don't redial. Move to the next name.",
    terminal: 'wrong_number',
    responses: [
      { label: "Start new call", next: START_NODE_ID, tone: 'neutral' },
    ],
  },
};
