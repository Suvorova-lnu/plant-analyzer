from fastapi import FastAPI, UploadFile, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, get_db, User, AnalysisHistory
from auth import hash_password, verify_password, create_token, decode_token
from ml_model import predict

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
    record = AnalysisHistory(
        user_id=user.id,
        result=results[0]["label"],
        confidence=str(results[0]["confidence"]),
        image_name=file.filename
    )
    db.add(record)
    db.commit()
    return {"results": results}

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