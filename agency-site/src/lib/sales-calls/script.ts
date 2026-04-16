export type ResponseTone = 'positive' | 'neutral' | 'objection' | 'negative';
export type TerminalOutcome = 'booked' | 'callback' | 'not_interested' | 'wrong_number';
export type CallPath = 'no_website' | 'has_website';

export const PATH_LABEL: Record<CallPath, string> = {
  no_website: "No current site — we built them a brand new prototype",
  has_website: 'Has a current site — we built them a redesign prototype',
};

export const PATH_SHORT: Record<CallPath, string> = {
  no_website: 'New site',
  has_website: 'Redesign',
};

export type PathLine = string | Record<CallPath, string>;

export function resolveLine(line: PathLine, path: CallPath): string {
  return typeof line === 'string' ? line : line[path];
}

export interface CallResponse {
  label: string;
  next: string;
  tone?: ResponseTone;
}

export interface CallNode {
  id: string;
  speaker: 'setter' | 'outcome';
  line: PathLine;
  note?: PathLine;
  responses: CallResponse[];
  terminal?: TerminalOutcome;
}

export const START_NODE_ID = 'opening';

export const SCRIPT: Record<string, CallNode> = {
  // ─── QUALIFICATION ─────────────────────────────────────
  opening: {
    id: 'opening',
    speaker: 'setter',
    line: "Hi, is this the owner of {business_name}?",
    note: "Open with owner qualification, NOT your name. Confident, casual, no apology. Straight question — no \"real quick\" or \"sorry to bother you\" preamble. If anyone but the owner picks up, go to the gatekeeper branch — we ONLY pitch owners.",
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
    line: "Fair question — this is {setter_name} with Broadway Web Dev. Are you the owner of {business_name}?",
    note: "Don't pitch yet. Re-anchor on owner qualification. Confident tone earns the next question. No fillers like \"just need to confirm\" — they weaken the ask.",
    responses: [
      { label: "Yes I'm the owner", next: 'pattern_interrupt', tone: 'positive' },
      { label: "No I'm not the owner", next: 'gatekeeper_assumptive', tone: 'neutral' },
      { label: "Still want more detail before I say", next: 'gatekeeper_regarding', tone: 'neutral' },
      { label: "Not interested / hostile", next: 'obj_not_interested', tone: 'objection' },
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
    line: {
      no_website: "Totally fair. We built {business_name} a sample website — I just want {owner_first_name} to see it and decide whether they want it live. 60 seconds.",
      has_website: "Totally fair. We built a redesign prototype for {business_name}'s current site — I just want to flag it for {owner_first_name} so they can take a look. 60 seconds.",
    },
    note: "Mention the prototype — it's the strongest curiosity hook we have. The fact that we've already done work FOR them makes a transfer way more likely than a vague \"something we found\" pitch.",
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
    note: "Lock a specific window + ideally a direct line or cell. Vague = never happens. Get the gatekeeper's name too so you can ask for them by name next call.",
    responses: [
      { label: "Got a time window + name", next: 'out_callback', tone: 'positive' },
      { label: "They won't say — just 'call back later'", next: 'out_callback', tone: 'neutral' },
      { label: "Don't call back / take us off list", next: 'out_not_interested', tone: 'negative' },
    ],
  },

  owner_transferred: {
    id: 'owner_transferred',
    speaker: 'setter',
    line: "Hey {owner_first_name}, thanks for hopping on. This is {setter_name} with Broadway Web Dev. Do you want the good news or the bad news first?",
    note: "Fresh start now that the owner is on. Pattern interrupt immediately — no apology, no preamble, no \"weird question\" stutter. Straight into the question. Smile through the phone.",
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
    line: "Awesome. Do you want the good news or the bad news first?",
    note: "THE pattern interrupt. Say it confident and straight — NO preamble like \"weird question,\" \"real quick,\" or \"I promise this isn't a pitch.\" Those are stutters and weaken the interrupt. Pause after — make them pick. If they can't pick, default to bad news (curiosity gap).",
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
    line: "Yes — but I found something about {business_name} online you'd actually want to know. 30 seconds and you can hang up if it's not useful. Good news or bad news first?",
    note: "Own it — it IS a sales call. Don't hedge with \"kind of\" or \"not the pushy kind.\" Straight \"Yes,\" then pivot fast to the specific value. Giving them permission to hang up (\"you can hang up\") paradoxically lowers their defenses.",
    responses: [
      { label: "Bad news first", next: 'bad_news', tone: 'positive' },
      { label: "Good news first", next: 'good_news', tone: 'positive' },
      { label: "Not interested — hangs up energy", next: 'out_not_interested', tone: 'negative' },
    ],
  },

  // ─── BAD NEWS / GOOD NEWS (path-conditional) ───────────
  bad_news: {
    id: 'bad_news',
    speaker: 'setter',
    line: {
      no_website: "Bad news: {business_name} doesn't come up when people search for you online — you don't have a website at all. So every person in your area looking for what you do right now is clicking on your competitor instead. Every week that's real customers walking right past you, and you never even see it.",
      has_website: "Bad news: I looked at {business_name}'s current site. Between how it shows up on Google, how it looks on a phone, and how easy it is for someone to actually book or contact you — you're leaking leads every single week to competitors whose sites just look more trustworthy at a glance.",
    },
    note: {
      no_website: "Make it concrete — 'people searching for you, finding your competitor.' Let it land, pause 2 seconds. Don't oversell. They may not know they're invisible online.",
      has_website: "Be specific if you can (outdated design, slow load, doesn't work on phones, can't find contact info). Pull it from the lead card. Vague pain = no pain. Let it land — 2-second silence after.",
    },
    responses: [
      { label: "OK… and the good news?", next: 'good_news', tone: 'positive' },
      { label: "We do fine, we have enough business", next: 'obj_enough_business', tone: 'objection' },
      { label: "We already have a website (unexpected)", next: 'obj_have_site', tone: 'objection' },
      { label: "How much to fix it?", next: 'obj_price', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  good_news: {
    id: 'good_news',
    speaker: 'setter',
    line: {
      no_website: "Good news: we already built you one. A custom sample website for {business_name} — it's live, you can see it. Our designer wants to walk you through it on a 15-minute call so you can see exactly what it'd look like for your business. No pressure — but if you like it, we can have it live for you inside a week. Want me to grab you a time?",
      has_website: "Good news: we already built you a redesign. A custom prototype replacement for {business_name}'s site — it's live, you can see it. Our designer wants to walk you through it on a 15-minute call so you can see side-by-side what an upgrade would look like. No pressure — if you like it, we can have it live for you inside a week. Want me to grab you a time?",
    },
    note: "THE pitch. The power move is tangibility — we've already done the work. Ask for the 15-minute slot immediately. Don't oversell; the prototype does the selling. NEVER email the link before the call — the walkthrough is the sale.",
    responses: [
      { label: "Yeah let's book it", next: 'book_time', tone: 'positive' },
      { label: "Tell me more first", next: 'pitch_details', tone: 'positive' },
      { label: "How much does it cost?", next: 'obj_price', tone: 'objection' },
      { label: "Send me info / email first", next: 'obj_send_info', tone: 'objection' },
      { label: "We already have a website (unexpected)", next: 'obj_have_site', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  pitch_details: {
    id: 'pitch_details',
    speaker: 'setter',
    line: {
      no_website: "Short version: our designer pulls up the sample site we built for {business_name} live on the call, walks you through every section, and tells you exactly what it'd cost to take it live. 15 minutes. Zero obligation. You either love it or you don't. Want me to grab a slot?",
      has_website: "Short version: our designer pulls up the redesign we built for {business_name} live on the call, walks through it side-by-side with your current site, and tells you exactly what it'd cost to swap it in. 15 minutes. Zero obligation. You either love it or you don't. Want me to grab a slot?",
    },
    note: "Emphasize: prototype already exists + 15 min + zero obligation + \"love it or you don't\" gives them a psychological out. Assume the close.",
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
    line: "That's awesome to hear. Still — we already built the site, so you'd at least want to see what we made for {business_name}, right? 15 minutes to look at it, then you decide if you ever want it live. No pressure at all.",
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
    line: {
      no_website: "Oh — you've got a site up already? My bad, I couldn't find one when I looked — what's the URL? Because we built a sample assuming you didn't have one. I still want you to see what we made — it may be an upgrade on what you've got either way.",
      has_website: "Nice — out of curiosity, when's the last time it actually got you a brand new customer? Or are most of your leads still coming from word of mouth and repeats?",
    },
    note: {
      no_website: "Discovery branch — your lead data said no site but they claim they have one. Get the URL, verify quickly in your head. The pitch still works: \"we already built a sample — take a look at both side-by-side.\"",
      has_website: "Classic NEPQ. Don't argue with their site — make them say it's not pulling weight. Then pivot to pitch_details which reveals we've built a redesign.",
    },
    responses: [
      { label: "They gave URL — site is actually outdated / hard to find", next: 'pitch_details', tone: 'positive' },
      { label: "Honestly, hard to say / not many leads", next: 'pitch_details', tone: 'positive' },
      { label: "Mostly word of mouth, yeah", next: 'pitch_details', tone: 'positive' },
      { label: "We get plenty from the site / love it", next: 'obj_not_interested', tone: 'objection' },
      { label: "Not interested in any of this", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  obj_price: {
    id: 'obj_price',
    speaker: 'setter',
    line: "Totally fair — most owners ask that first. A lot of the owners we work with felt the same way before they saw what we built. Our sites usually start at a few hundred bucks one-time, and most owners pay it back in the first month or two once leads start coming in. But the 15-min call is where you see the actual prototype AND get the real number for your setup. Worth seeing what we made for you?",
    note: "3 F's: Feel, Felt, Found. NEVER quote a firm price — that's the closer's job. The prototype is the deflection: \"come see what we built for you\" beats \"let me quote you.\"",
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
    line: "I hear you. Range is usually a few hundred to low thousands one-time, depending on how many pages and features. But you'll see the actual prototype we built for {business_name} on the call, and my designer will give you the real number based on what's there. 15 minutes, zero obligation. Cool?",
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
    line: "Happy to — but quick question so I flag the right stuff when I send it: what's the main thing you'd want a website to do for {business_name}? More leads, look more professional, show up on Google, something else?",
    note: "NEVER just send the prototype URL cold — they'll glance at it, miss the value, and bail. Qualify what they care about, THEN convert to a booked walkthrough. The designer needs to walk them through it for the sale to land.",
    responses: [
      { label: "More leads / customers", next: 'obj_send_info_convert', tone: 'positive' },
      { label: "Show up on Google / get found", next: 'obj_send_info_convert', tone: 'positive' },
      { label: "Look more professional / legitimate", next: 'obj_send_info_convert', tone: 'positive' },
      { label: "Just send the standard stuff", next: 'obj_send_info_convert', tone: 'neutral' },
    ],
  },

  obj_send_info_convert: {
    id: 'obj_send_info_convert',
    speaker: 'setter',
    line: "Got it — here's the thing: the prototype hits way different when my designer walks you through it live than reading an email. Let me grab you a 15-min slot AND I'll send a quick preview — if the preview's enough, cancel the slot, no hard feelings. Deal?",
    note: "Send a preview screenshot, NOT the full prototype URL — we need them on the call to see it properly. The slot gets 'cancelled' way less than you'd think once it's on their calendar.",
    responses: [
      { label: "OK deal, book it", next: 'book_time', tone: 'positive' },
      { label: "Just email me, no slot", next: 'book_callback', tone: 'neutral' },
      { label: "Actually never mind", next: 'obj_not_interested', tone: 'negative' },
    ],
  },

  obj_not_interested: {
    id: 'obj_not_interested',
    speaker: 'setter',
    line: "Totally respect that. One thing before I let you go — we literally already built a sample website for {business_name}. It's done. Would you at least want to see what we made before I take it down? 15 minutes, no pressure, then you decide.",
    note: "Strongest soft takeaway we have — the work is DONE. Even a hard \"no\" often softens at \"you already built something for me?\" Almost nobody says no to seeing work that already exists. If they still say no, respect it.",
    responses: [
      { label: "Sure, I'll look at it", next: 'book_time', tone: 'positive' },
      { label: "Tell me more about it", next: 'good_news', tone: 'positive' },
      { label: "Maybe in a few months", next: 'book_callback', tone: 'neutral' },
      { label: "Hard no / plate is full", next: 'out_not_interested', tone: 'negative' },
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
    note: "Log in CRM immediately: business, owner name, phone, email, appointment time, AND the prototype URL (so the designer has it loaded and ready before the call). Send the calendar invite RIGHT NOW — every minute of delay drops the show rate.",
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
    note: "Mark the lead dead. Note the REASON — 'already has someone,' 'bad timing,' 'hostile,' 'maxed out.' The reason tells us whether to retarget in 6 months or never call again.",
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
