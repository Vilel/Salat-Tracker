# expo-location-review

You are reviewing the location flow for this app (expo-location + reverse geocoding).

Focus checklist:
- Permission flow (granted/denied/blocked)
- Accuracy choice vs battery/performance
- Error handling and fallbacks (default location)
- Reverse geocode failure handling and timeouts
- State transitions (loading/error/success)
- Avoid unnecessary re-renders / repeated location calls

Rules:
- Use existing structure (app/, components/, hooks/, lib/).
- Do not modify app.json/eas.json/config files unless explicitly asked.
- Keep code/comments/identifiers in English.

Deliver:
1) Root-cause analysis of issues found
2) Proposed improvements (2–6 bullets)
3) Final code changes (copy-paste ready)
4) Manual test plan (permissions, airplane mode, low GPS accuracy)
