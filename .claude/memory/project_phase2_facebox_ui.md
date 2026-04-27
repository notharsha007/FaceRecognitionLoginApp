---
name: Face Registration - Phase 2: FaceBox UI Update
description: Update FaceBox component to be clickable, open webcam, show scanning states and success message
type: project
originSessionId: 99efe156-1be0-4143-b491-aae0e9c23d72
---
## Phase 2 — FaceBox UI Update

**Status:** NOT STARTED

### Goal
Make the FaceBox component interactive — clickable, webcam-enabled, with states for idle/scanning/captured.

### File: `frontend/src/app/components/FaceBox.tsx`

**Props to add:**
```ts
interface FaceBoxProps {
  onCapture: (embedding: number[]) => void;
  captured: boolean;
}
```

**UI States:**
1. **Idle (default):** Shows 🫥 emoji + "Face preview will appear here" + "Click here to scan face" subtext. Cursor pointer, hover highlight on border.
2. **Scanning:** Webcam stream shown inside the box. A "Capture" button appears below the box. User positions face and clicks Capture.
3. **Processing:** Shows spinner + "Processing face..." text while waiting for backend response.
4. **Captured/Success:** Shows ✅ + "Face scanned successfully" message in green. Box is no longer clickable.

**Webcam logic (inside FaceBox or extracted to a hook):**
- On box click: call `navigator.mediaDevices.getUserMedia({ video: true })`
- Render `<video>` element with the stream inside the box
- On "Capture" button click: draw video frame to hidden `<canvas>`, get base64 via `canvas.toDataURL('image/jpeg')`
- POST base64 to `http://localhost:8000/api/capture-face`
- On success: call `onCapture(embedding)`, switch to Captured state, stop webcam stream
- On error: show error message, stay in Scanning state

**Why:** Manual capture button approach — simpler, more reliable than auto-detection loop. User controls when to capture.

**How to apply:** This phase is fully frontend-only. No backend changes needed. Complete Phase 1 first so the API endpoint exists for testing.
