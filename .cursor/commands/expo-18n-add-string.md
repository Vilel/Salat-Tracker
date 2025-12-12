# expo-i18n-add-string

You are adding or updating user-facing copy in this app's i18n system.

Task:
- Add translation keys to `constants/i18n.ts` and update all locales (es/en/fr/nl).
- Update UI code to use `t.<path>` instead of hardcoded strings.

Rules:
- Keep translation object shape consistent across locales.
- Do not remove existing keys without explicit request.
- Keep UI copy concise and accessible.
- Keep code/comments/identifiers in English.

Output format:
1) Keys to add/change (list them)
2) Files to change
3) Final code for all modified sections
4) Quick sanity checklist (all locales compile, no missing keys)
