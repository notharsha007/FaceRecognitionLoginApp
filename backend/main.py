import base64
import io
import json

import numpy as np
from deepface import DeepFace
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.sql import func

DATABASE_URL = "postgresql://postgres:postgres123@localhost:5432/faceauth"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(50), nullable=False)
    face_embedding = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class CaptureRequest(BaseModel):
    image: str  # base64 encoded image


class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    face_embedding: list[float]


@app.get("/")
def root():
    return {"status": "ok"}


@app.post("/api/capture-face")
def capture_face(req: CaptureRequest):
    try:
        image_data = req.image.split(",")[-1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)

        result = DeepFace.represent(
            img_path=image_np,
            model_name="Facenet",
            enforce_detection=False,
            detector_backend="opencv",
        )
        embedding = result[0]["embedding"]
        return {"embedding": embedding}
    except ValueError as e:
        raise HTTPException(status_code=400, detail="No face detected. Please look directly at the camera.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/login")
def login(req: CaptureRequest, db: Session = Depends(get_db)):
    try:
        image_data = req.image.split(",")[-1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)

        result = DeepFace.represent(
            img_path=image_np,
            model_name="Facenet",
            enforce_detection=False,
            detector_backend="opencv",
        )
        login_embedding = np.array(result[0]["embedding"])
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not process face. Please try again.")

    users = db.query(User).all()
    if not users:
        raise HTTPException(status_code=404, detail="No registered users found.")

    best_similarity = -1.0
    best_user = None

    for user in users:
        stored = np.array(json.loads(user.face_embedding))
        similarity = float(
            np.dot(login_embedding, stored) /
            (np.linalg.norm(login_embedding) * np.linalg.norm(stored) + 1e-10)
        )
        if similarity > best_similarity:
            best_similarity = similarity
            best_user = user

    THRESHOLD = 0.77

    if best_similarity >= THRESHOLD and best_user is not None:
        return {"name": best_user.name, "similarity": best_similarity}
    else:
        raise HTTPException(status_code=401, detail="Face not recognized. Please try again or register.")


@app.post("/api/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        name=req.name,
        email=req.email,
        phone=req.phone,
        face_embedding=json.dumps(req.face_embedding),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Registered successfully", "user_id": user.id}
