Shipping provider configuration

This file documents how to configure the shipping tracking endpoint.

Environment variables (examples):

- THAI_POST_TRACK_URL
  - URL template including `{tracking}` placeholder. Example: `https://api.thailandpost.example/track/{tracking}`
- THAI_API_KEY
  - If present, will be sent as `Authorization: Bearer <key>` header to Thailand Post API.
- THAI_POST_TRACK_HEADERS
  - Optional JSON string of additional headers to include (merged with `THAI_API_KEY` header).
- THAI_POST_TRACK_METHOD
  - Optional HTTP method (GET/POST). Default: GET
- THAI_POST_TRACK_BODY
  - Optional body template used for POST/PUT. Use `{tracking}` placeholder.

- FALLBACK_ON_PROVIDER_ERROR
  - When set to `false`, the controller will return HTTP 502 when the external provider call fails.
  - Default (unset or any value other than `false`) will return a mocked `events` response so the frontend doesn't receive a hard 502.

To run locally with Thailand Post mocked results, leave `THAI_POST_TRACK_URL` unset. The controller will return a mocked `events` array.

Example PowerShell setup:

```powershell
$env:THAI_POST_TRACK_URL = 'https://api.thailandpost.example/track/{tracking}'
$env:THAI_API_KEY = 'your_thai_post_api_key_here'
```

API endpoint:
- POST /api/shipping/track
  - Request JSON: { carrier: string, tracking: string }
  - Success JSON: { provider, tracking, events }
  - Errors: 400 (bad request), 502 (provider failed if FALLBACK_ON_PROVIDER_ERROR=false), 500 (internal error)
