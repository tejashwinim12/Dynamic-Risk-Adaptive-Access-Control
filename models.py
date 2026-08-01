from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)

    password = Column(String, nullable=True)
    role = Column(String, default="EMPLOYEE")
    
    device_id = Column(String, nullable=False)
    city = Column(String, nullable=False)
    country = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    risk_score = Column(Integer, default=0)
    access_status = Column(String, default="ALLOW")
    is_active = Column(Boolean, default=True)
    reasons = Column(Text, default="")
    known_devices = Column(Text, default="[]")
    known_locations = Column(Text, default="[]")
    suspicious_events = Column(Integer, default=0)
    last_checked = Column(Text, default="")

class LoginLog(Base):
    __tablename__ = "login_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    event_type = Column(String, nullable=False)
    device_id = Column(String, nullable=False)
    city = Column(String, nullable=False)
    country = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    risk_score = Column(Integer, nullable=False)
    access_status = Column(String, nullable=False)
    reasons = Column(Text, default="")

    login_hour = Column(Integer, default=0)
    day_of_week = Column(Integer, default=0)
    is_suspicious = Column(Boolean, default=False)

    unknown_device = Column(Boolean, default=False)
    new_location = Column(Boolean, default=False)
    suspicious_ip = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)