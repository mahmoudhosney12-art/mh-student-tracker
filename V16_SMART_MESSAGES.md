# MH Student Tracker V16 — Smart Message Center

## Added
- Smart WhatsApp message selector from the prospect record.
- Message templates differentiated by stage (new, no reply, interested, details requested, booking/attendance).
- Separate Arabic templates for students and parents.
- Subject/grade-specific templates:
  - First-year baccalaureate: Philosophy & Logic.
  - Second-year baccalaureate: Psychology.
- Template text remains editable before opening WhatsApp.
- Logs audience, selected stage, grade, result, and follow-up date.
- Uses parent's phone only when one is explicitly recorded; otherwise parent audience is disabled.
- Preserves manual-send workflow: opening WhatsApp is not treated as confirmed delivery.
- Respect the existing stop-contact stage.

## Deployment
Upload the contents of this ZIP to the root of the existing GitHub Pages repository, replacing the old files. Keep a backup of the current repository contents before replacing them.
