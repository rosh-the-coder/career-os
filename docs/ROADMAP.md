# Route map

| Route | Purpose |
|---|---|
| `/` | Redirect → `/dashboard` |
| `/login` | Supabase Auth |
| `/dashboard` | Pipeline counts, priority jobs |
| `/jobs` | Searchable scored job list |
| `/jobs/new` | Paste URL or description |
| `/jobs/[id]` | Score, eligibility, evidence, resume actions |
| `/profiles` | Career profiles overview |
| `/profiles/[id]` | Profile + evidence map |
| `/resume-studio` | Generated resumes, validation |
| `/applications` | Application tracker |
| `/settings` | Eligibility, salary, toggles, API |

## API / server actions

| Action | Purpose |
|---|---|
| `importJob` | Create job from paste/URL |
| `scoreJob` | Run filters + scoring |
| `generateResume` | Build + validate + export |
| `updateJobStatus` | Status transitions |
| `recordApplication` | Tracker entry |

## CLI

```bash
npm run cli:import -- --file job.txt --url https://...
npm run cli:score -- --job-id <id>
```
