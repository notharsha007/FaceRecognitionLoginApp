---
name: Face Registration - Phase 3: Register Page Integration
description: Wire up register page form state, face embedding state, and POST to /api/register on submit
type: project
originSessionId: 99efe156-1be0-4143-b491-aae0e9c23d72
---
## Phase 3 — Register Page Integration

**Status:** NOT STARTED

### Goal
Connect the FaceBox, input fields, and Register button into a working registration flow that saves data to the `faceauth` DB.

### File: `frontend/src/app/register/page.tsx`

**State to add:**
```ts
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
```

**FaceBox wiring:**
```tsx
<FaceBox
  onCapture={(embedding) => setFaceEmbedding(embedding)}
  captured={faceEmbedding !== null}
/>
```

**Register button logic:**
- Disabled if `faceEmbedding` is null (face not scanned yet)
- On click: POST to `http://localhost:8000/api/register` with `{ name, email, phone, face_embedding: faceEmbedding }`
- On success: show success message (e.g. "Registered successfully!")
- On error: show error message from backend

**TextField wiring:**
- Each field gets `value` and `onChange` props connected to state

**Why:** Keeps all registration state in the page component; FaceBox is a controlled component receiving callbacks. This is the standard React pattern and avoids prop drilling.

**How to apply:** Complete Phase 1 (backend) and Phase 2 (FaceBox) before this. Test the full flow end-to-end after completing this phase.
