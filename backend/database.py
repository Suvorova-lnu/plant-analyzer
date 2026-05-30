from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./plant_app.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AnalysisHistory(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    result = Column(Text)
    confidence = Column(String)
    image_name = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MyPlant(Base):
    __tablename__ = "my_plants"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    species = Column(String)
    photo_url = Column(String, nullable=True)
    soil_type = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WateringSchedule(Base):
    __tablename__ = "watering_schedule"
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey("my_plants.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    watering_interval_days = Column(Integer)
    fertilizing_interval_days = Column(Integer)
    last_watered = Column(DateTime, nullable=True)
    last_fertilized = Column(DateTime, nullable=True)
    next_watering = Column(DateTime, nullable=True)
    next_fertilizing = Column(DateTime, nullable=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()