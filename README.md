# 🌿 Plant AI — Додаток для аналізу стану рослин

> Мобільний PWA-додаток для визначення хвороб рослин за фотографією з використанням машинного навчання. Дозволяє відстежувати стан рослин, отримувати рекомендації по лікуванню та керувати календарем поливу.

---

## 👤 Автор

- **ПІБ**: Суворова Софія Володмирівна
- **Група**: ФЕІ-45
- **Керівник**: Сінькевич Олег Олександрович, кандидат технічних наук, доцент кафедри радіоелектронних і комп’ютерних систем]
- **Дата виконання**: 31.05.2026

---

## 🌐 Посилання

- **Живий додаток**: https://plant-analyzer-blush.vercel.app
- **API документація**: https://plant-analyzer-qvid.onrender.com/docs

---

## 📌 Загальна інформація

- **Тип проєкту**: Мобільний PWA веб-додаток
- **Мова програмування**: Python (Backend), JavaScript (Frontend)
- **Фреймворки / Бібліотеки**: FastAPI, React, PyTorch, SQLAlchemy
- **База даних**: PostgreSQL (Neon)
- **ML модель**: MobileNetV2 (transfer learning)
- **Датасет**: PlantVillage + Indoor Plant Disease Dataset (75,828 фото, 61 клас)
- **Точність моделі**: 96.21%

---

## 🧠 Опис функціоналу

- 🔐 Реєстрація та авторизація користувачів (JWT токени)
- 📷 Аналіз фото рослини через камеру або галерею
- 🤖 Визначення хвороби рослини з точністю 96% (61 клас)
- 💊 Рекомендації по лікуванню виявлених хвороб
- 🪴 Сторінка "Мої рослини" — додавання і відстеження рослин
- 💧 Календар поливу і удобрення з нагадуваннями
- 📋 Рекомендації по догляду для кожного виду рослини
- 📊 Історія аналізів
- 📱 PWA — встановлення на телефон як нативний додаток

---

## 🧱 Опис основних файлів

| Файл | Призначення |
|------|-------------|
| `backend/main.py` | FastAPI сервер, всі API ендпоінти |
| `backend/ml_model.py` | Завантаження ML моделі, функція predict |
| `backend/database.py` | Моделі бази даних (User, MyPlant, WateringSchedule) |
| `backend/auth.py` | JWT авторизація, хешування паролів |
| `backend/plant_care.json` | База знань по догляду за рослинами |
| `backend/plant_model_v2.pth` | Натренована ML модель (61 клас) |
| `frontend/src/App.jsx` | React додаток (всі екрани і логіка) |
| `frontend/public/manifest.json` | PWA маніфест |
| `backend/plant_model_training.ipynb` | Colab ноутбук навчання моделі |

---

## 🤖 ML Модель

- **Архітектура**: MobileNetV2 (transfer learning)
- **Датасет**: PlantVillage (54,305 фото) + Indoor Plant Disease Dataset (21,523 фото)
- **Класів**: 61 (хвороби культурних і кімнатних рослин)
- **Точність**: 96.21% на валідаційній вибірці
- **Навчання**: Google Colab (GPU T4), 10 епох
- **Платформа**: PyTorch + torchvision

---

## ▶️ Як запустити проєкт локально

### 1. Встановлення інструментів

- Python 3.11+
- Node.js 20+
- Git

### 2. Клонування репозиторію

```bash
git clone https://github.com/Suvorova-lnu/plant-analyzer.git
cd plant-analyzer
```

### 3. Налаштування бекенду

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 4. Додати файли моделі

Завантажити з Google Drive і покласти в `backend/`:
- `plant_model_v2.pth`
- `class_names_v2.json`

### 5. Запуск бекенду

```bash
uvicorn main:app --reload
```

API доступне на `http://localhost:8000`

### 6. Налаштування фронтенду

```bash
cd ../frontend
npm install
```

Відкрити `frontend/src/App.jsx` і знайти:
```js
const API = "https://plant-analyzer-qvid.onrender.com"
```
Заміни на:
```js
const API = "http://localhost:8000"
```

### 7. Запуск фронтенду

```bash
npm run dev
```

Додаток доступний на `http://localhost:5173`

---

## 🔌 API ендпоінти

### 🔐 Авторизація

**POST /register**
```json
{ "email": "user@example.com", "password": "password123" }
```
**POST /login**
```json
{ "email": "user@example.com", "password": "password123" }
```
**Response:**
```json
{ "token": "jwt_token_here" }
```

### 🌿 Аналіз рослини

**POST /analyze** *(multipart/form-data)*

```json
{
  "results": [
    { "label": "Tomato — Late blight", "confidence": 94.2 },
    { "label": "Tomato — Early blight", "confidence": 3.1 }
  ],
  "is_disease": true,
  "treatment": "Обробіть фунгіцидом на основі міді...",
  "care": { "watering_tip": "Полив вранці під корінь" }
}
```

### 🪴 Мої рослини

| Метод | Ендпоінт | Опис |
|-------|----------|------|
| GET | /plants | Список рослин користувача |
| POST | /plants | Додати рослину |
| DELETE | /plants/{id} | Видалити рослину |
| POST | /plants/{id}/watered | Відмітити полив |
| POST | /plants/{id}/fertilized | Відмітити удобрення |
| GET | /calendar | Календар догляду |
| GET | /history | Історія аналізів |
| GET | /me | Профіль користувача |

---

## 🖱️ Інструкція для користувача

1. **Реєстрація** — введи email і пароль → натисни "Зареєструватись"

2. **Аналіз рослини**:
   - Натисни 📷 Камера або 🖼️ Галерея
   - Завантаж фото листка рослини
   - Отримай результат з визначенням хвороби і рекомендаціями

3. **Мої рослини**:
   - Натисни "+ Додати рослину"
   - Вибери вид зі списку
   - Натисни на рослину щоб побачити деталі, календар і перевірити стан

4. **Перевірка стану**:
   - Відкрий рослину → натисни "🔍 Перевірити стан"
   - Завантаж фото → отримай діагноз і рекомендації по лікуванню

5. **Календар поливу**:
   - В деталях рослини є міні-календар поливу і удобрення
   - Натисни "✓ Полито" або "✓ Удобрено" щоб відмітити

6. **PWA** — відкрий сайт на телефоні → додай на головний екран

---

## 🧪 Проблеми і рішення

| Проблема | Рішення |
|----------|---------|
| Бекенд не відповідає | Render засинає — зачекати 30-60 сек після першого запиту |
| 401 Unauthorized | Вийти і увійти знову — токен міг застаріти |
| Модель не розпізнає рослину | Система працює для 61 класу з датасету PlantVillage і Indoor |
| Фото з камери не аналізується | Надіслати фото через Telegram собі і завантажити скачаний файл |

---

## 🏗️ Архітектура системи
Телефон/Браузер (PWA)
↓
React Frontend (Vercel)
↓
FastAPI Backend (Render)
↙        ↘
ML Model    PostgreSQL
(PyTorch)   (Neon)

---

## 🧾 Використані джерела

- PyTorch документація — https://pytorch.org
- FastAPI документація — https://fastapi.tiangolo.com
- React документація — https://react.dev
- PlantVillage Dataset — https://www.kaggle.com/datasets/emmarex/plantdisease
- Indoor Plant Disease Dataset — https://www.kaggle.com/datasets/abdulahad0296/indoor-plant-disease-detection-dataset
- MobileNetV2 paper — Howard et al., 2018
- Neon PostgreSQL — https://neon.tech
- Vercel — https://vercel.com
- Render — https://render.com