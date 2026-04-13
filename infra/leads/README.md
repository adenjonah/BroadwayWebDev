# Lead Tracking

## Format

Simple CSV (`leads.csv`) tracking businesses through the sales pipeline.

## Columns

| Column | Description |
|---|---|
| slug | URL-safe identifier (matches `sites/<slug>/`) |
| business_name | Full business name |
| phone | Contact phone number |
| address | Full address |
| has_website | yes/no — from Google Maps listing |
| contacted | yes/no — have we called them |
| status | Pipeline stage (see below) |
| notes | Free-text notes |
| date_added | YYYY-MM-DD |
| date_contacted | YYYY-MM-DD or empty |

## Status Values

- `lead` — found on Google Maps, not yet contacted
- `contacted` — called, no meeting booked yet
- `meeting_booked` — sales meeting scheduled
- `prototype_built` — demo site built for meeting
- `sold` — client bought, site is live
- `declined` — client said no
- `no_answer` — couldn't reach them
