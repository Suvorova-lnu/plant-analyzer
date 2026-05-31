from fastapi import FastAPI, UploadFile, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, get_db, User, AnalysisHistory, MyPlant, WateringSchedule
from auth import hash_password, verify_password, create_token, decode_token
from ml_model import predict
import json
import datetime
import os

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Plant Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class AuthData(BaseModel):
    email: str
    password: str

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(401, "Потрібна авторизація")
    try:
        token = authorization.replace("Bearer ", "")
        payload = decode_token(token)
        user = db.query(User).filter(User.email == payload["sub"]).first()
        if not user:
            raise HTTPException(401, "Користувача не знайдено")
        return user
    except:
        raise HTTPException(401, "Невірний токен")

@app.get("/")
def root():
    return {"message": "Plant Analyzer API працює!"}

@app.post("/register")
def register(data: AuthData, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email вже зареєстровано")
    user = User(email=data.email, hashed_password=hash_password(data.password))
    db.add(user)
    db.commit()
    return {"token": create_token({"sub": data.email})}

@app.post("/login")
def login(data: AuthData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Невірний email або пароль")
    return {"token": create_token({"sub": data.email})}

@app.post("/analyze")
async def analyze(
    file: UploadFile,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    results = predict(contents)

    # Завантажуємо рекомендації
    care_path = os.path.join(os.path.dirname(__file__), "plant_care.json")
    with open(care_path) as f:
        care_data = json.load(f)

    top = results[0]
    care = care_data.get(top["label"].replace(" — ", "_").replace(" ", "_"), {})
    is_disease = care.get("disease", False)

    treatment = None
    if is_disease:
        treatments = {
            "Late_blight": "Обробіть фунгіцидом на основі міді. Видаліть уражені листки. Уникайте поливу зверху.",
            "Early_blight": "Використайте фунгіцид манкоцеб або хлороталоніл. Прибирайте уражені листки.",
            "Bacterial_spot": "Обробіть мідним бактерицидом. Уникайте дощування. Знищіть сильно уражені рослини.",
            "Black_rot": "Видаліть уражені частини. Обробіть фунгіцидом. Забезпечте добру циркуляцію повітря.",
            "Powdery_mildew": "Обробіть розчином соди (1 ч.л. на 1л води) або фунгіцидом. Зменшіть вологість.",
            "Leaf_scorch": "Видаліть уражені листки. Обробіть фунгіцидом. Поливайте під корінь.",
            "Mosaic_virus": "Вірус невиліковний. Видаліть уражену рослину щоб не заразити інші. Боріться з попелицею.",
            "Rust": "Обробіть фунгіцидом на основі сірки або міді. Видаліть уражені листки.",
            "Leaf_Spot": "Обробіть фунгіцидом. Уникайте намокання листя при поливі.",
            "Blight": "Видаліть уражені частини. Обробіть фунгіцидом. Покращіть дренаж.",
            "Aphid": "Обробіть інсектицидом або мильним розчином. Промийте листя водою.",
            "Mildew": "Обробіть фунгіцидом. Забезпечте провітрювання. Зменшіть полив.",
            "Necrosis": "Перевірте полив і дренаж. Обробіть фунгіцидом. Видаліть мертві тканини.",
            "Chlorosis": "Додайте добриво з залізом і магнієм. Перевірте pH ґрунту.",
            "Scorch": "Захистіть від прямого сонця. Збільшіть полив. Обприскуйте листя.",
        }
        label = top["label"]
        for key, rec in treatments.items():
            if key.lower() in label.lower().replace(" ", "_"):
                treatment = rec
                break
        if not treatment:
            treatment = "Видаліть уражені частини рослини. Ізолюйте від інших рослин. Зверніться до агронома."

    record = AnalysisHistory(
        user_id=user.id,
        result=top["label"],
        confidence=str(top["confidence"]),
        image_name=file.filename
    )
    db.add(record)
    db.commit()

    return {
        "results": results,
        "is_disease": is_disease,
        "treatment": treatment,
        "care": {
            "watering_tip": care.get("watering_tip"),
            "fertilizer_tip": care.get("fertilizer_tip"),
            "sunlight": care.get("sunlight"),
        } if care else None
    }

@app.get("/history")
def history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(AnalysisHistory)\
        .filter(AnalysisHistory.user_id == user.id)\
        .order_by(AnalysisHistory.created_at.desc())\
        .all()
    return [
        {
            "result": r.result,
            "confidence": r.confidence,
            "image_name": r.image_name,
            "date": str(r.created_at)
        }
        for r in records
    ]

@app.get("/me")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total = db.query(AnalysisHistory).filter(AnalysisHistory.user_id == user.id).count()
    return {"email": user.email, "total_analyses": total}

@app.post("/plants")
def add_plant(
    name: str,
    species: str,
    soil_type: str = "",
    notes: str = "",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plant = MyPlant(
        user_id=user.id,
        name=name,
        species=species,
        soil_type=soil_type,
        notes=notes
    )
    db.add(plant)
    db.commit()
    db.refresh(plant)

    care_path = os.path.join(os.path.dirname(__file__), "plant_care.json")
    with open(care_path) as f:
        care_data = json.load(f)

    care = care_data.get(species, {"watering_days": 7, "fertilizing_days": 30})
    now = datetime.datetime.utcnow()

    schedule = WateringSchedule(
        plant_id=plant.id,
        user_id=user.id,
        watering_interval_days=care["watering_days"],
        fertilizing_interval_days=care["fertilizing_days"],
        last_watered=None,
        last_fertilized=None,
        next_watering=now,
        next_fertilizing=now
    )
    db.add(schedule)
    db.commit()
    return {"id": plant.id, "name": plant.name, "species": plant.species}

@app.get("/plants")
def get_plants(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plants = db.query(MyPlant).filter(MyPlant.user_id == user.id).all()
    result = []
    for p in plants:
        schedule = db.query(WateringSchedule).filter(WateringSchedule.plant_id == p.id).first()
        result.append({
            "id": p.id,
            "name": p.name,
            "species": p.species,
            "soil_type": p.soil_type,
            "notes": p.notes,
            "created_at": str(p.created_at),
            "next_watering": str(schedule.next_watering) if schedule and schedule.next_watering else None,
            "next_fertilizing": str(schedule.next_fertilizing) if schedule and schedule.next_fertilizing else None,
            "last_watered": str(schedule.last_watered) if schedule and schedule.last_watered else None,
            "last_fertilized": str(schedule.last_fertilized) if schedule and schedule.last_fertilized else None,
            "watering_interval_days": schedule.watering_interval_days if schedule else 7,
            "fertilizing_interval_days": schedule.fertilizing_interval_days if schedule else 30
        })
    return result

@app.post("/plants/{plant_id}/watered")
def mark_watered(
    plant_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedule = db.query(WateringSchedule).filter(
        WateringSchedule.plant_id == plant_id,
        WateringSchedule.user_id == user.id
    ).first()
    if not schedule:
        raise HTTPException(404, "Розклад не знайдено")
    now = datetime.datetime.utcnow()
    schedule.last_watered = now
    schedule.next_watering = now + datetime.timedelta(days=schedule.watering_interval_days)
    db.commit()
    return {"next_watering": str(schedule.next_watering), "last_watered": str(now)}

@app.post("/plants/{plant_id}/fertilized")
def mark_fertilized(
    plant_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedule = db.query(WateringSchedule).filter(
        WateringSchedule.plant_id == plant_id,
        WateringSchedule.user_id == user.id
    ).first()
    if not schedule:
        raise HTTPException(404, "Розклад не знайдено")
    now = datetime.datetime.utcnow()
    schedule.last_fertilized = now
    schedule.next_fertilizing = now + datetime.timedelta(days=schedule.fertilizing_interval_days)
    db.commit()
    return {"next_fertilizing": str(schedule.next_fertilizing), "last_fertilized": str(now)}

@app.get("/calendar")
def get_calendar(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    schedules = db.query(WateringSchedule).filter(WateringSchedule.user_id == user.id).all()
    result = []
    for s in schedules:
        plant = db.query(MyPlant).filter(MyPlant.id == s.plant_id).first()
        result.append({
            "plant_id": s.plant_id,
            "plant_name": plant.name if plant else "?",
            "next_watering": str(s.next_watering) if s.next_watering else None,
            "next_fertilizing": str(s.next_fertilizing) if s.next_fertilizing else None,
            "last_watered": str(s.last_watered) if s.last_watered else None,
            "last_fertilized": str(s.last_fertilized) if s.last_fertilized else None,
            "watering_interval_days": s.watering_interval_days,
            "fertilizing_interval_days": s.fertilizing_interval_days
        })
    result.sort(key=lambda x: x["next_watering"] or "")
    return result

@app.delete("/plants/{plant_id}")
def delete_plant(
    plant_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(WateringSchedule).filter(WateringSchedule.plant_id == plant_id).delete()
    db.query(MyPlant).filter(MyPlant.id == plant_id, MyPlant.user_id == user.id).delete()
    db.commit()
    return {"ok": True}