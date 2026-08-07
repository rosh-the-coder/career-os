# CareerOS Case Study (standalone)

```bash
# from repo root
npm run case-study:dev

# or
cd case-study/app && npm install && npm run dev
```

Open the Vite URL (default http://localhost:5173).

Replace placeholders by dropping WebP files into `case-study/public/assets/screens/` using exact filenames from `CAPTURE_CHECKLIST.md`. No code change required once `ASSET_MANIFEST` statuses are set to `ready` (resolver also falls back until then — update status when captured).

**Note:** Currently `resolveAsset` treats non-`ready` screenshots as placeholders. After capturing, either set each asset `status` to `ready` in `ASSET_MANIFEST.json`, or we can add a file-exists probe later.
