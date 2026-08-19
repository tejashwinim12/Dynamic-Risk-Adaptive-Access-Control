import json
import joblib
import pandas as pd
from fastapi import Depends
from fastapi import Header
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import asyncio
from contextlib import asynccontextmanager
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import json

from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import User, LoginLog

from passlib.context import CryptContext
import os
from dotenv import load_dotenv


load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not configured")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

MFA_VERIFICATION_CODE = os.getenv(
    "MFA_VERIFICATION_CODE",
    "123456"
)

FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:3000"
)

# Load AI model
ai_model = joblib.load("risk_model.pkl")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/login"
)

def decode_access_token(token: str):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Dynamic Risk Adaptive Access Control")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo
users_db: Dict[str, dict] = {}
active_users: Dict[str, dict] = {}

# Users who recently passed additional verification
verified_users: Dict[str, datetime] = {}

class LoginRequest(BaseModel):
    user_id: str
    device_id: str
    city: str
    country: str
    ip_address: str


class UpdateContextRequest(BaseModel):
    device_id: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    ip_address: Optional[str] = None

class VerifyRequest(BaseModel):
    verification_code: str

class RegisterRequest(BaseModel):
    user_id: str
    password: str


class LoginAuthRequest(BaseModel):
    user_id: str
    password: str

def calculate_risk(user: dict):
    risk = 0
    reasons = []

    # New device increases risk
    if user["device_id"] not in user["known_devices"]:
        risk += 35
        reasons.append("Unknown Device (+35)")

    # New location increases risk
    current_location = f'{user["city"]},{user["country"]}'
    if current_location not in user["known_locations"]:
        risk += 30
        reasons.append("New Location (+30)")

    # Suspicious IP pattern
    if user["ip_address"].startswith("10.") or user["ip_address"].startswith("192.168."):
        risk += 10
        reasons.append("Suspicious IP (+10)")

    # Too many failed checks or unusual updates
    if user.get("suspicious_events", 0) >= 2:
        risk += 20
        reasons.append("Repeated Suspicious Activity (+20)")

    risk = min(risk, 100)

    if risk < 30:
        status = "ALLOW"
    elif risk < 70:
        status = "RESTRICT"
    else:
        status = "REVOKE"

    return risk, status, reasons

def predict_ai_risk(user):
    current_location = f'{user["city"]},{user["country"]}'

    data = pd.DataFrame([{
        "unknown_device": int(user["device_id"] not in user["known_devices"]),
        "new_location": int(current_location not in user["known_locations"]),
        "suspicious_ip": int(
            user["ip_address"].startswith("10.")
            or user["ip_address"].startswith("192.168.")
        ),
        "login_hour": datetime.now(timezone.utc).hour,
        "day_of_week": datetime.now(timezone.utc).weekday()
    }])

    prediction = int(ai_model.predict(data)[0])
    probabilities = ai_model.predict_proba(data)[0]
    confidence = float(max(probabilities) * 100)

    return prediction, confidence

def evaluate_access(user):
    # 1. Rule-based risk assessment
    risk, status, reasons = calculate_risk(user)

    # 2. AI assessment
    ai_prediction, confidence = predict_ai_risk(user)

    print("AI Prediction:", ai_prediction)
    print(f"AI Confidence: {confidence:.2f}%")

    # 3. Combine AI result with rule-based risk
    if ai_prediction == 1:
        risk += 20
        reasons.append(
            f"AI detected suspicious behaviour "
            f"({confidence:.1f}% confidence) (+20)"
        )

    # Prevent risk from exceeding 100
    risk = min(risk, 100)

    # 4. Final access decision
    if risk < 30:
        status = "ALLOW"
    elif risk < 70:
        status = "RESTRICT"
    else:
        status = "REVOKE"

    return risk, status, reasons, ai_prediction, confidence

def enforce_access(user_id: str):
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.user_id == user_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        access_status = str(user.access_status)


        if access_status == "REVOKE":
            raise HTTPException(
                status_code=403,
                detail="Access revoked due to high security risk"
            )

        if access_status == "RESTRICT":
            raise HTTPException(
                status_code=403,
                detail="Access restricted - additional verification required"
            )

        return access_status
        
    finally:
        db.close()

@app.get("/protected/{user_id}")
def protected_resource(user_id: str):
    access_status = enforce_access(user_id)

    return {
        "message": "Access granted to protected resource",
        "user_id": user_id,
        "access_status": access_status
    }

@app.post("/verify/{user_id}")
def verify_user(user_id: str, req: VerifyRequest):
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.user_id == user_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        access_status = str(user.access_status)

        if access_status != "RESTRICT":
            raise HTTPException(
                status_code=400,
                detail="Additional verification is not required"
            )

        # Demo MFA code
        if req.verification_code != MFA_VERIFICATION_CODE:
            raise HTTPException(
                status_code=401,
                detail="Invalid verification code"
            )

        user.access_status = "ALLOW"
        user.risk_score = 0
        user.reasons = json.dumps([
            "Additional verification completed successfully"
        ])

        db.commit()
        db.refresh(user)

        if user_id in active_users:
            active_users[user_id]["access_status"] = "ALLOW"
            active_users[user_id]["risk_score"] = 0
            active_users[user_id]["reasons"] = [
                "Additional verification completed successfully"
            ]

        verified_users[user_id] = datetime.now(timezone.utc)

        return {
            "message": "Additional verification successful",
            "user_id": user_id,
            "access_status": "ALLOW"
        }

    finally:
        db.close()

def save_login_log(db, user_id, event_type, payload, risk_score, access_status, reasons):

    now = datetime.now(timezone.utc)

    # AI Features
    unknown_device = "Unknown Device (+35)" in reasons
    new_location = "New Location (+30)" in reasons
    suspicious_ip = "Suspicious IP (+10)" in reasons

    log = LoginLog(
        user_id=user_id,
        event_type=event_type,

        device_id=payload["device_id"],
        city=payload["city"],
        country=payload["country"],
        ip_address=payload["ip_address"],

        risk_score=risk_score,
        access_status=access_status,
        reasons=json.dumps(reasons),

        login_hour=now.hour,
        day_of_week=now.weekday(),
        is_suspicious=(risk_score >= 70),

        unknown_device=unknown_device,
        new_location=new_location,
        suspicious_ip=suspicious_ip
    )

    db.add(log)
    db.flush()

    print("LOG SAVED:", log.id)

async def monitor_risk_loop():
    """
    Runs every 5 seconds and updates risk/access status for active users.
    """
    while True:
        for user_id, user in list(active_users.items()):

            # Skip risk evaluation for users recently verified
            if user_id in verified_users:
                verified_time = verified_users[user_id]

                if (
                    datetime.now(timezone.utc) - verified_time
                ).total_seconds() < 300:
                    continue

                # Verification expired
                del verified_users[user_id]

            risk, status, reasons, _, _ = evaluate_access(user)

            user["risk_score"] = risk
            user["access_status"] = status
            user["reasons"] = reasons
            user["last_checked"] = datetime.now(timezone.utc).isoformat()

            db = SessionLocal()

            try:
                db_user = (
                    db.query(User)
                    .filter(User.user_id == user_id)
                    .first()
                )

                if db_user:
                    db_user.risk_score = risk
                    db_user.access_status = status
                    db_user.reasons = json.dumps(reasons)
                    db_user.last_checked = user["last_checked"]

                    db.commit()

            finally:
                db.close()


        await asyncio.sleep(5)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(monitor_risk_loop())
    yield
    task.cancel()


app.router.lifespan_context = lifespan


@app.post("/login")
def login(req: LoginRequest):
    db = SessionLocal()
    try:
        current_location = f"{req.city},{req.country}"

        user = db.query(User).filter(User.user_id == req.user_id).first()

        if user is None:
            user = User(
                user_id=req.user_id,
                device_id=req.device_id,
                city=req.city,
                country=req.country,
                ip_address=req.ip_address,
                known_devices=json.dumps([req.device_id]),
                known_locations=json.dumps([current_location]),
                suspicious_events=0,
                risk_score=0,
                access_status="ALLOW",
                is_active=True,
                reasons="",
                last_checked=datetime.now(timezone.utc).isoformat()
            )
            db.add(user)
        else:
            known_devices = json.loads(user.known_devices or "[]")
            known_locations = json.loads(user.known_locations or "[]")

            if req.device_id not in known_devices:
                known_devices.append(req.device_id)

            if current_location not in known_locations:
                known_locations.append(current_location)

            user.device_id = req.device_id
            user.city = req.city
            user.country = req.country
            user.ip_address = req.ip_address
            user.known_devices = json.dumps(known_devices)
            user.known_locations = json.dumps(known_locations)
            user.is_active = True
            user.suspicious_events = 0
            user.last_checked = datetime.now(timezone.utc).isoformat()

        db.commit()
        db.refresh(user)

        active_users[req.user_id] = {
            "user_id": user.user_id,
            "device_id": user.device_id,
            "city": user.city,
            "country": user.country,
            "ip_address": user.ip_address,
            "known_devices": json.loads(user.known_devices or "[]"),
            "known_locations": json.loads(user.known_locations or "[]"),
            "suspicious_events": user.suspicious_events,
            "risk_score": user.risk_score,
            "access_status": user.access_status,
            "is_active": user.is_active,
            "last_checked": user.last_checked,
            "reasons": json.loads(user.reasons) if user.reasons else []
        }

        risk, status, reasons, ai_prediction, confidence = evaluate_access(
            active_users[req.user_id]
        )

        user.risk_score = risk
        user.ai_confidence = round(confidence)
        user.access_status = status
        user.reasons = json.dumps(reasons)
        user.last_checked = datetime.now(timezone.utc).isoformat()
        db.commit()

        save_login_log(
            db=db,
            user_id=req.user_id,
            event_type="LOGIN",
            payload={
                "device_id": user.device_id,
                "city": user.city,
                "country": user.country,
                "ip_address": user.ip_address
            },
            risk_score=risk,
            access_status=status,
            reasons=reasons
        )

        db.commit()

        active_users[req.user_id]["risk_score"] = risk
        active_users[req.user_id]["access_status"] = status
        active_users[req.user_id]["reasons"] = reasons

        return {
            "message": "Login successful",
            "user_id": req.user_id,
            "risk_score": risk,
            "access_status": status,
            "reasons": reasons,
            "ai_prediction": ai_prediction,
            "ai_confidence": round(confidence, 2),
            "last_checked": user.last_checked,
            "device_id": user.device_id,
            "city": user.city,
            "country": user.country,
            "ip_address": user.ip_address
        }

    finally:
        db.close()

@app.post("/auth/login")
def auth_login(req: LoginAuthRequest):
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.user_id == req.user_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password"
            )

        if not verify_password(
            req.password,
            user.password
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password"
            )

        token = create_access_token(
            {
                "sub": user.user_id,
                "role": user.role
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    finally:
        db.close()

@app.get("/status/{user_id}")
def get_status(user_id: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.user_id == user_id).first()

        if not user or not user.is_active:
            raise HTTPException(status_code=404, detail="User not active")

        return {
            "user_id": user.user_id,
            "device_id": user.device_id,
            "city": user.city,
            "country": user.country,
            "ip_address": user.ip_address,
            "known_devices": json.loads(user.known_devices or "[]"),
            "known_locations": json.loads(user.known_locations or "[]"),
            "suspicious_events": user.suspicious_events,
            "risk_score": user.risk_score,
            "ai_confidence": user.ai_confidence,
            "access_status": user.access_status,
            "is_active": user.is_active,
            "last_checked": user.last_checked,
            "reasons": json.loads(user.reasons) if user.reasons else []
        }

    finally:
        db.close()

@app.get("/logs/{user_id}")
def get_logs(user_id: str):
    db = SessionLocal()

    try:
        logs = (
            db.query(LoginLog)
            .filter(LoginLog.user_id == user_id)
            .order_by(LoginLog.created_at.desc()).limit(10)
            .all()
        )

        return [
            {
                "id": log.id,
                "event_type": log.event_type,
                "risk_score": log.risk_score,
                "access_status": log.access_status,
                "created_at": str(log.created_at)
            }
            for log in logs
        ]

    finally:
        db.close()

@app.put("/update-context/{user_id}")
def update_context(user_id: str, req: UpdateContextRequest):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.user_id == user_id).first()

        if not user or not user.is_active:
            raise HTTPException(status_code=404, detail="User not active")

        if req.device_id:
            user.device_id = req.device_id

        if req.city:
            user.city = req.city

        if req.country:
            user.country = req.country

        if req.ip_address:
            user.ip_address = req.ip_address

        known_devices = json.loads(user.known_devices or "[]")
        known_locations = json.loads(user.known_locations or "[]")

        user.suspicious_events = (user.suspicious_events or 0) + 1

        temp_user = {
            "device_id": user.device_id,
            "city": user.city,
            "country": user.country,
            "ip_address": user.ip_address,
            "known_devices": known_devices,
            "known_locations": known_locations,
            "suspicious_events": user.suspicious_events
        }

        risk, status, reasons, ai_prediction, confidence = evaluate_access(
            temp_user
        )

        user.risk_score = risk
        user.access_status = status
        user.reasons = json.dumps(reasons)
        user.last_checked = datetime.now(timezone.utc).isoformat()
        db.commit()
        db.refresh(user)

        save_login_log(
            db=db,
            user_id=user.user_id,
            event_type="CONTEXT_UPDATE",
            payload={
                "device_id": user.device_id,
                "city": user.city,
                "country": user.country,
                "ip_address": user.ip_address
            },
            risk_score=risk,
            access_status=status,
            reasons=reasons
        )

        db.commit()

        active_users[user_id] = {
            "user_id": user.user_id,
            "device_id": user.device_id,
            "city": user.city,
            "country": user.country,
            "ip_address": user.ip_address,
            "known_devices": known_devices,
            "known_locations": known_locations,
            "suspicious_events": user.suspicious_events,
            "risk_score": user.risk_score,
            "access_status": user.access_status,
            "is_active": user.is_active,
            "last_checked": user.last_checked,
            "reasons": reasons
        }

        return {
            "message": "Context updated",
            "user_id": user_id,
            "risk_score": risk,
            "access_status": status
        }

    finally:
        db.close()


@app.post("/logout/{user_id}")
def logout(user_id: str):
    if user_id in active_users:
        del active_users[user_id]
        return {"message": "Logged out successfully"}

    raise HTTPException(status_code=404, detail="User not active")

@app.post("/register")
def register(req: RegisterRequest):
    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.user_id == req.user_id)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="User already exists"
            )

        new_user = User(
            user_id=req.user_id,
            password=hash_password(req.password),

            device_id="unknown",
            city="unknown",
            country="unknown",
            ip_address="0.0.0.0",

            risk_score=0,
            access_status="ALLOW",
            is_active=True,

            reasons="[]",

            known_devices="[]",
            known_locations="[]",

            suspicious_events=0,
            last_checked=""
        )

        db.add(new_user)
        db.commit()

        return {
            "message": "Registration successful"
        }

    finally:
        db.close()