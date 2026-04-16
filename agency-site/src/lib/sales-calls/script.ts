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
  opening: {
    id: 'opening',
    speaker: 'setter',
    line: "Hi, is this the owner of {business_name}? This is {setter_name} with Broadway Web Dev — do you have a quick 30 seconds?",
    note: "Warm and confident. Pause after the 30-second ask — it earns you the next sentence.",
    responses: [
      { label: "Yes, this is them / speaking", next: 'pitch_intro', tone: 'positive' },
      { label: "Who? / What's this about?", next: 'reframe_who', tone: 'neutral' },
      { label: "They're not here / can I take a message?", next: 'gatekeeper_callback', tone: 'neutral' },
      { label: "What are you selling?", next: 'pitch_intro', tone: 'neutral' },
      { label: "Not interested / no thanks", next: 'obj_not_interested', tone: 'objection' },
      { label: "Wrong number", next: 'out_wrong_number', tone: 'negative' },
    ],
  },

  reframe_who: {
    id: 'reframe_who',
    speaker: 'setter',
    line: "Totally fair — my name is {setter_name} with Broadway Web Dev. We build simple websites for local businesses around here. I just need 30 seconds to see if it's even worth a conversation.",
    note: "Don't apologize. Stay friendly. Re-anchor on the 30-second ask.",
    responses: [
      { label: "OK, go ahead", next: 'pitch_intro', tone: 'positive' },
      { label: "Still not interested", next: 'obj_not_interested', tone: 'objection' },
      { label: "What's this about? (still asking)", next: 'pitch_intro', tone: 'neutral' },
    ],
  },

  pitch_intro: {
    id: 'pitch_intro',
    speaker: 'setter',
    line: "Awesome — real quick: I was looking at {business_name} online and noticed you either don't have a website yet or it could use a refresh. We build clean, affordable sites for local businesses and a lot of our clients see more calls and walk-ins within a few weeks. Does that sound like something worth a 15-minute chat with our designer?",
    note: "Lead with the observation (no site / outdated site). Land on the low-commitment ask: a 15-min call with the designer/closer.",
    responses: [
      { label: "Sure, tell me more", next: 'pitch_details', tone: 'positive' },
      { label: "We already have a website", next: 'obj_have_site', tone: 'objection' },
      { label: "How much does it cost?", next: 'obj_price', tone: 'objection' },
      { label: "I'm busy right now", next: 'obj_busy', tone: 'objection' },
      { label: "Send me info / email me", next: 'obj_send_info', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  pitch_details: {
    id: 'pitch_details',
    speaker: 'setter',
    line: "Great. It's really just a 15-minute call with one of our designers — they'll look at your current setup, show you a couple of examples of what we've built for businesses like yours, and give you a straight quote. Zero obligation. Want me to grab a time for you?",
    note: "Keep emphasizing: 15 min, zero obligation, straight quote. Assume the close.",
    responses: [
      { label: "Yeah, let's book it", next: 'book_time', tone: 'positive' },
      { label: "Send me info first", next: 'obj_send_info', tone: 'objection' },
      { label: "How much is it going to cost?", next: 'obj_price', tone: 'objection' },
      { label: "Not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  obj_have_site: {
    id: 'obj_have_site',
    speaker: 'setter',
    line: "Nice — mind if I ask what platform it's on? A lot of folks we talk to have a site but find it's hard to update, not showing up on Google, or doesn't look great on phones. The 15-minute call is a good sanity check either way.",
    note: "Don't argue. Ask about pain points. If they have real complaints, funnel into pitch_details.",
    responses: [
      { label: "Honestly, it is kind of old / hard to update", next: 'pitch_details', tone: 'positive' },
      { label: "It's fine on mobile / Google but could be better", next: 'pitch_details', tone: 'neutral' },
      { label: "We're happy with it — no complaints", next: 'obj_not_interested', tone: 'objection' },
      { label: "How much would a new one cost?", next: 'obj_price', tone: 'objection' },
    ],
  },

  obj_price: {
    id: 'obj_price',
    speaker: 'setter',
    line: "Totally fair question. Our packages typically start around a few hundred bucks for a simple site — but honestly the 15-minute call is there so the designer can give you an exact number based on what you actually need. No pressure either way. Still worth a quick chat?",
    note: "Never quote a firm price — that's the closer's job. Deflect to the free call.",
    responses: [
      { label: "OK yeah, let's book it", next: 'book_time', tone: 'positive' },
      { label: "That's too much for us", next: 'obj_not_interested', tone: 'objection' },
      { label: "Just email me details", next: 'obj_send_info', tone: 'objection' },
    ],
  },

  obj_busy: {
    id: 'obj_busy',
    speaker: 'setter',
    line: "Totally get it — I won't keep you. When's a better time to reach you for a quick 15-minute call? Morning, afternoon, or end of day?",
    note: "Don't pitch further. Just pin down a callback window.",
    responses: [
      { label: "Morning works", next: 'book_callback', tone: 'positive' },
      { label: "Afternoon works", next: 'book_callback', tone: 'positive' },
      { label: "End of day / after hours", next: 'book_callback', tone: 'positive' },
      { label: "Just don't call back", next: 'obj_not_interested', tone: 'negative' },
    ],
  },

  obj_send_info: {
    id: 'obj_send_info',
    speaker: 'setter',
    line: "Happy to. What's the best email? And real quick — the 15-minute call usually saves a bunch of back-and-forth because our designer can answer everything live. I can put you on the calendar as a hold and cancel it if the email's enough. Sound good?",
    note: "Capture the email. Try once to convert 'send info' into the booked call. If they still want email only, mark as callback.",
    responses: [
      { label: "OK fine, book the call", next: 'book_time', tone: 'positive' },
      { label: "Just send the email, we'll see", next: 'book_callback', tone: 'neutral' },
      { label: "Actually no — not interested", next: 'obj_not_interested', tone: 'objection' },
    ],
  },

  obj_not_interested: {
    id: 'obj_not_interested',
    speaker: 'setter',
    line: "Totally respect that. Just out of curiosity — is it that you've already got someone handling your website stuff, or more that websites aren't a priority right now? Because if it's the second one, the 15-minute call is literally free info.",
    note: "One soft re-frame, no more. Listen to the answer — if they give any opening, go back to pitch_details. If they shut it down, exit clean.",
    responses: [
      { label: "OK fine, book the 15-min call", next: 'book_time', tone: 'positive' },
      { label: "Already have someone", next: 'out_not_interested', tone: 'negative' },
      { label: "Not a priority, hard no", next: 'out_not_interested', tone: 'negative' },
      { label: "Maybe later — try me in a few months", next: 'book_callback', tone: 'neutral' },
    ],
  },

  gatekeeper_callback: {
    id: 'gatekeeper_callback',
    speaker: 'setter',
    line: "No worries. When's the best time to catch them — and who should I ask for when I call back?",
    note: "Get a name and a time window. Don't pitch to the gatekeeper.",
    responses: [
      { label: "Got name + time window", next: 'out_callback', tone: 'positive' },
      { label: "Can take a message only", next: 'out_callback', tone: 'neutral' },
      { label: "Don't call back", next: 'out_not_interested', tone: 'negative' },
    ],
  },

  book_time: {
    id: 'book_time',
    speaker: 'setter',
    line: "Awesome. Our designer has openings tomorrow at 10 AM or 2 PM — which works better? If neither fits, I'll find one that does.",
    note: "Offer two specific times. Never ask 'when are you free?' — it stalls the booking.",
    responses: [
      { label: "Morning slot works", next: 'book_confirm_email', tone: 'positive' },
      { label: "Afternoon slot works", next: 'book_confirm_email', tone: 'positive' },
      { label: "Neither — suggest another time", next: 'book_confirm_email', tone: 'neutral' },
      { label: "Actually, on second thought no", next: 'obj_not_interested', tone: 'negative' },
    ],
  },

  book_confirm_email: {
    id: 'book_confirm_email',
    speaker: 'setter',
    line: "Perfect. What's the best email to send the calendar invite to? I'll also text you a reminder 15 minutes before.",
    note: "Confirm email letter by letter. Read it back. Confirm the phone number too.",
    responses: [
      { label: "Got email + confirmed time", next: 'out_booked', tone: 'positive' },
      { label: "They changed their mind last second", next: 'obj_not_interested', tone: 'negative' },
    ],
  },

  book_callback: {
    id: 'book_callback',
    speaker: 'setter',
    line: "No problem — what day and time window works best? I'll put you in our follow-up list and call you right at the start of that window.",
    note: "Lock a specific day + 2-hour window. Vague ('sometime next week') = this never happens.",
    responses: [
      { label: "Got a specific day + time window", next: 'out_callback', tone: 'positive' },
      { label: "They got vague / 'just try me sometime'", next: 'out_callback', tone: 'neutral' },
    ],
  },

  out_booked: {
    id: 'out_booked',
    speaker: 'outcome',
    line: "Booked",
    note: "Log the appointment in the CRM: business name, contact name, phone, email, appointment time. Send the calendar invite now while it's fresh.",
    terminal: 'booked',
    responses: [
      { label: "Start new call", next: START_NODE_ID, tone: 'neutral' },
    ],
  },

  out_callback: {
    id: 'out_callback',
    speaker: 'outcome',
    line: "Callback scheduled",
    note: "Log the callback: business, contact name, phone, callback window, any context ('seemed interested, just busy'). Set a reminder.",
    terminal: 'callback',
    responses: [
      { label: "Start new call", next: START_NODE_ID, tone: 'neutral' },
    ],
  },

  out_not_interested: {
    id: 'out_not_interested',
    speaker: 'outcome',
    line: "Not interested",
    note: "Mark the lead as not interested. Note the reason if they gave one (already have someone, bad timing, etc.) — it helps us retarget later.",
    terminal: 'not_interested',
    responses: [
      { label: "Start new call", next: START_NODE_ID, tone: 'neutral' },
    ],
  },

  out_wrong_number: {
    id: 'out_wrong_number',
    speaker: 'outcome',
    line: "Wrong number",
    note: "Flag the lead so we don't redial. Move on.",
    terminal: 'wrong_number',
    responses: [
      { label: "Start new call", next: START_NODE_ID, tone: 'neutral' },
    ],
  },
};
