# 🌿 Plant AI — Додаток для аналізу стану рослин

> Мобільний PWA-додаток для автоматизованого визначення хвороб рослин за фотографією з використанням машинного навчання та надання практичних рекомендацій щодо догляду.

---

## 👤 Автор

- **ПІБ**: Суворова Софія Володимирівна
- **Група**: ФЕІ-45
- **Керівник**: Сінькевич Олег Олександрович, к.т.н., доцент
- **Дата виконання**: 31.05.2026

---

## 📌 Загальна інформація

- **Тип проєкту**: Мобільний PWA-застосунок (Progressive Web Application)
- **Мова програмування**: Python 3.11, JavaScript (React)
- **Фреймворки / Бібліотеки**: FastAPI, PyTorch, React, Vite, SQLAlchemy
- **База даних**: PostgreSQL (Neon — serverless хмарна БД)
- **Хостинг**: Vercel (frontend), Render (backend)
- **Живий додаток**: https://plant-analyzer-blush.vercel.app
- **Репозиторій**: https://github.com/Suvorova-lnu/plant-analyzer

---

## 🧠 Опис функціоналу

- 🔐 Реєстрація та авторизація користувачів (JWT + bcrypt)
- 📷 Аналіз фотографії рослини з визначенням хвороби (61 клас, точність 96,21%)
- 💊 Практичні рекомендації щодо лікування виявленої хвороби
- 🪴 Персональний список рослин з рекомендаціями по догляду
- 📅 Календар поливу та удобрення з автоматичним розрахунком розкладу
- 📋 Історія аналізів
- 📲 Встановлення на телефон як PWA без App Store / Google Play

---

## 🧱 Опис основних класів / файлів

| Файл | Призначення |
|------|-------------|
| `backend/main.py` | FastAPI додаток, всі API ендпоінти, CORS middleware |
| `backend/ml_model.py` | Завантаження MobileNetV2, функція predict |
| `backend/database.py` | SQLAlchemy ORM моделі (User, AnalysisHistory, MyPlant, WateringSchedule) |
| `backend/auth.py` | JWT генерація/перевірка, bcrypt хешування паролів |
| `backend/plant_care.json` | База знань по догляду для 61 класу рослин |
| `backend/plant_model_v2.pth` | Навчена модель MobileNetV2 (61 клас) |
| `backend/class_names_v2.json` | Назви 61 класу хвороб рослин |
| `backend/requirements.txt` | Залежності Python |
| `frontend/src/App.jsx` | Головний React компонент, всі екрани та логіка |
| `frontend/src/main.jsx` | Точка входу, реєстрація Service Worker |
| `frontend/public/manifest.json` | PWA маніфест (назва, іконка, тема) |
| `frontend/public/sw.js` | Service Worker для кешування |

---

## ▶️ Як запустити проєкт "з нуля"

### 1. Встановлення інструментів

- Python 3.11 або новіший
- Node.js v20.0 + npm v10.0
- Git

### 2. Клонування репозиторію

```bash
git clone https://github.com/Suvorova-lnu/plant-analyzer.git
cd plant-analyzer
```

### 3. Встановлення залежностей

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 4. Додати файли моделі

Помістити у папку `backend/`:
- `plant_model_v2.pth` — навчена модель
- `class_names_v2.json` — назви класів

### 5. Створення `.env` файлу для backend

```
DATABASE_URL=postgresql://user:password@host/dbname
SECRET_KEY=your_secret_key
```

### 6. Запуск

```bash
# Backend (термінал 1)
cd backend
uvicorn main:app --reload
# Сервер: http://localhost:8000
# Документація API: http://localhost:8000/docs

# Frontend (термінал 2)
cd frontend
# У файлі src/App.jsx змінити: const API = "http://localhost:8000"
npm run dev
# Додаток: http://localhost:5173
```

---

## 🔌 API приклади

### 🔐 Реєстрація

**POST /register**

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 🔐 Авторизація

**POST /login**

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 🌿 Аналіз зображення

**POST /analyze**

```
Header: Authorization: Bearer <token>
Body: multipart/form-data, file=photo.jpg
```

**Response:**

```json
{
  "results": [
    {"class": "Tomato_Late_blight", "confidence": 94.5},
    {"class": "Tomato_Early_blight", "confidence": 3.2},
    {"class": "Tomato_healthy", "confidence": 1.1}
  ],
  "is_disease": true,
  "treatment": "Обробіть рослину фунгіцидом на основі міді..."
}
```

---

### 🪴 Управління рослинами

**GET /plants** — отримати список рослин

**POST /plants**

```json
{
  "name": "Моя троянда",
  "species": "Rose_healthy",
  "soil_type": "Суглинок"
}
```

**POST /plants/{id}/watered** — відмітити полив

**DELETE /plants/{id}** — видалити рослину

---

## 🖱️ Інструкція для користувача

1. **Відкрити додаток** за адресою https://plant-analyzer-blush.vercel.app

2. **Реєстрація / Вхід**:
   - Вкладка `Реєстрація` → ввести email та пароль → `Зареєструватись`
   - При повторному відвідуванні → вкладка `Увійти`

3. **Аналіз рослини**:
   - На головному екрані натиснути `🖼️ Галерея` → обрати фото листка
   - ⚠️ Рекомендується фотографувати окремий листок при денному освітленні
   - ⚠️ Якщо фото зроблено камерою — спочатку надіслати собі через Telegram, потім завантажити збережений файл
   - Результат з'явиться автоматично через кілька секунд

4. **Додати рослину**:
   - Після аналізу натиснути `Додати до моїх рослин`
   - Або перейти до розділу `🪴 Рослини` → `+ Додати рослину`
   - Обрати вид зі списку, ввести назву та тип ґрунту

5. **Відстеження догляду**:
   - Натиснути на рослину у списку → відкриється вікно деталей
   - Переглянути міні-календар поливу та удобрення
   - Після поливу натиснути `✓ Полито` — дата оновиться автоматично

6. **Встановити як PWA**:
   - Android (Chrome): меню `⋮` → `Встановити додаток`
   - iOS (Safari): кнопка `Поділитися` → `На початковий екран`

---

## 📷 Скриншоти

- Екран авторизації
- Головний екран (статистика + кнопки аналізу)
- Результат аналізу (топ-3 класи + рекомендації)
- Мої рослини (список + міні-календар)

*(скриншоти у папці `/screenshots/`)*

---

## 🧪 Проблеми і рішення

| Проблема | Рішення |
|----------|---------|
| Сервер не відповідає (перший запит) | Render засинає після 15 хв бездіяльності — зачекати 30–60 сек |
| Камера не працює для аналізу | Надіслати фото через Telegram, завантажити збережений файл через Галерею |
| 401 Unauthorized | JWT токен застарів — вийти та увійти знову |
| Рослина не розпізнається | Модель підтримує лише 61 клас з датасету — алое, кактуси та орхідеї не підтримуються |

---

## 🧾 Використані джерела / література

- PyTorch Documentation — https://pytorch.org/docs
- FastAPI Documentation — https://fastapi.tiangolo.com
- React Documentation — https://react.dev
- Hughes D., Salathé M. PlantVillage Dataset — https://arxiv.org/abs/1511.08060
- Sandler M. et al. MobileNetV2 — CVPR 2018
- Neon Documentation — https://neon.tech/docs
- Vercel Documentation — https://vercel.com/docs
- MDN Web Docs. Progressive Web Apps — https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
