import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://plant-analyzer-qvid.onrender.com"

function formatDate(dateStr) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short" })
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const CARE_INFO = {
  "Rose_Healthy": { water: 3, fertilize: 14, light: "Повне сонце", soil: "Родючий, злегка кислий", tip: "Поливай під корінь вранці" },
  "Rose_Black_Spot": { water: 3, fertilize: 14, light: "Повне сонце", soil: "Родючий", tip: "Уникай намокання листя" },
  "Tomato___healthy": { water: 3, fertilize: 14, light: "Повне сонце", soil: "Родючий pH 6-6.5", tip: "Полив кожні 2-3 дні під корінь" },
  "Tomato___Late_blight": { water: 3, fertilize: 14, light: "Повне сонце", soil: "Дренований", tip: "Полив вранці під корінь" },
  "Potato___healthy": { water: 4, fertilize: 21, light: "Повне сонце", soil: "Пухкий, родючий", tip: "Рівномірний полив кожні 4 дні" },
  "Hibiscus_Healthy": { water: 3, fertilize: 14, light: "Повне сонце 6+ год", soil: "Родючий, злегка кислий", tip: "Рясний полив влітку" },
  "Money Plant_Money_Plant_Healthy": { water: 7, fertilize: 30, light: "Непряме світло", soil: "Легкий, дренований", tip: "Дай ґрунту підсохнути між поливами" },
  "default": { water: 7, fertilize: 30, light: "Помірне світло", soil: "Універсальний", tip: "Поливай регулярно, уникай перезволоження" }
}

function getCare(species) {
  return CARE_INFO[species] || CARE_INFO["default"]
}

const neu = {
  bg: "#1e2420",
  shadow: "6px 6px 14px #131814, -6px -6px 14px #293030",
  shadowIn: "inset 4px 4px 10px #131814, inset -4px -4px 10px #293030",
  shadowSm: "3px 3px 6px #131814, -3px -3px 6px #293030",
  shadowBtn: "4px 4px 8px #131814, -4px -4px 8px #293030",
  green: "#4ade80",
  blue: "#67c8e8",
  fertilize: "#86efac",
  text: "#d1fae5",
  textLight: "#6b7f72",
  red: "#f87171",
  amber: "#fbbf24",
}

function MiniCalendar({ lastDate, nextDate, intervalDays, onMark, type, plantId }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = []
  for (let i = 14; i >= -14; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }

  const lastD = lastDate ? new Date(lastDate) : null
  const nextD = nextDate ? new Date(nextDate) : null
  if (lastD) lastD.setHours(0, 0, 0, 0)
  if (nextD) nextD.setHours(0, 0, 0, 0)

  const color = type === "water" ? neu.blue : neu.fertilize
  const daysLeft = daysUntil(nextDate)
  const isUrgent = daysLeft !== null && daysLeft <= 0
  const isSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 2

  return (
    <div style={{ background: neu.bg, borderRadius: 16, padding: 14, marginBottom: 14, boxShadow: neu.shadowIn }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: neu.text }}>
          {type === "water" ? "💧 Полив" : "🌿 Удобрення"}
        </div>
        <button onClick={() => onMark(plantId)} style={{
          padding: "6px 14px", border: "none", borderRadius: 10,
          cursor: "pointer", fontSize: 12, fontWeight: 700,
          background: neu.bg, color: color, boxShadow: neu.shadowBtn
        }}>
          ✓ {type === "water" ? "Полито" : "Удобрено"}
        </button>
      </div>
      <div style={{
        display: "flex", gap: 4, marginBottom: 10,
        overflowX: "scroll", WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 4
      }}>
        {days.map((d, i) => {
          const isToday = d.getTime() === today.getTime()
          const isLast = lastD && d.getTime() === lastD.getTime()
          const isNext = nextD && d.getTime() === nextD.getTime()
          const isPast = d < today
          const dayNum = d.getDate()
          const dayName = d.toLocaleDateString("uk-UA", { weekday: "short" }).slice(0, 2)
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 30, flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: isToday ? color : neu.textLight, fontWeight: isToday ? 700 : 400, marginBottom: 3 }}>
                {dayName}
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: isToday || isLast || isNext ? 700 : 400,
                background: isLast ? color : isNext ? neu.bg : isToday ? neu.bg : "transparent",
                color: isLast ? "#1e2420" : isNext ? (isUrgent ? neu.red : neu.green) : isToday ? color : isPast ? "#3a4a3a" : neu.text,
                boxShadow: isLast ? `2px 2px 6px ${color}88` : isNext ? neu.shadowSm : isToday ? neu.shadowSm : "none",
                border: isNext ? `1.5px dashed ${isUrgent ? neu.red : neu.green}` : "none"
              }}>
                {dayNum}
              </div>
              {(isLast || isNext) && (
                <div style={{ fontSize: 8, color: isLast ? color : isUrgent ? neu.red : neu.green, marginTop: 2, fontWeight: 700 }}>
                  {isLast ? "✓" : "!"}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
        <span style={{ color: neu.textLight }}>Останній: <b style={{ color: neu.text }}>{formatDate(lastDate)}</b></span>
        <span style={{ color: isUrgent ? neu.red : isSoon ? neu.amber : neu.green, fontWeight: 700 }}>
          {isUrgent ? "⚠️ Час!" : daysLeft === null ? "—" : `Через ${daysLeft} дн — ${formatDate(nextDate)}`}
        </span>
      </div>
    </div>
  )
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [screen, setScreen] = useState("home")
  const [userInfo, setUserInfo] = useState(null)
  const [plants, setPlants] = useState([])
  const [calendar, setCalendar] = useState([])
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [showAddPlant, setShowAddPlant] = useState(false)
  const [newPlant, setNewPlant] = useState({ name: "", species: "", soil_type: "", notes: "" })
  const [checkingPlant, setCheckingPlant] = useState(false)

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })

  async function auth() {
    try {
      setError("")
      const url = isLogin ? "/login" : "/register"
      const res = await axios.post(API + url, { email, password })
      localStorage.setItem("token", res.data.token)
      setToken(res.data.token)
    } catch (e) {
      setError(e.response?.data?.detail || "Помилка")
    }
  }

  async function analyze(e) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true); setResult(null); setScreen("result")
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await axios.post(API + "/analyze", form, { headers: getHeaders() })
      setResult(res.data)
      loadHistory(); loadMe()
    } catch { setError("Помилка аналізу") }
    setLoading(false)
  }

  async function checkPlantHealth(e, plantId) {
    const file = e.target.files[0]
    if (!file) return
    setCheckingPlant(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await axios.post(API + "/analyze", form, { headers: getHeaders() })
      setSelectedPlant(prev => ({ ...prev, lastCheck: res.data }))
      await loadHistory(); await loadMe()
    } catch { alert("Помилка аналізу") }
    setCheckingPlant(false)
  }

  async function loadAll() {
    try {
      const [h, m, p, c] = await Promise.all([
        axios.get(API + "/history", { headers: getHeaders() }),
        axios.get(API + "/me", { headers: getHeaders() }),
        axios.get(API + "/plants", { headers: getHeaders() }),
        axios.get(API + "/calendar", { headers: getHeaders() })
      ])
      setHistory(h.data); setUserInfo(m.data); setPlants(p.data); setCalendar(c.data)
    } catch {}
  }

  async function loadHistory() { try { const r = await axios.get(API + "/history", { headers: getHeaders() }); setHistory(r.data) } catch {} }
  async function loadMe() { try { const r = await axios.get(API + "/me", { headers: getHeaders() }); setUserInfo(r.data) } catch {} }
  async function loadPlants() { try { const r = await axios.get(API + "/plants", { headers: getHeaders() }); setPlants(r.data) } catch {} }
  async function loadCalendar() { try { const r = await axios.get(API + "/calendar", { headers: getHeaders() }); setCalendar(r.data) } catch {} }

  async function addPlant() {
    try {
      await axios.post(API + "/plants", null, { headers: getHeaders(), params: newPlant })
      setShowAddPlant(false); setNewPlant({ name: "", species: "", soil_type: "", notes: "" })
      await loadPlants(); await loadCalendar()
    } catch { setError("Помилка додавання") }
  }

  async function deletePlant(plantId) {
    if (!confirm("Видалити рослину?")) return
    try {
      await axios.delete(API + `/plants/${plantId}`, { headers: getHeaders() })
      setSelectedPlant(null); await loadPlants(); await loadCalendar()
    } catch { alert("Помилка видалення") }
  }

  async function markWatered(plantId) {
    try {
      await axios.post(API + `/plants/${plantId}/watered`, null, { headers: getHeaders() })
      await loadPlants(); await loadCalendar()
      const r = await axios.get(API + "/plants", { headers: getHeaders() })
      const updated = r.data.find(p => p.id === plantId)
      if (updated && selectedPlant?.id === plantId) setSelectedPlant(prev => ({ ...prev, ...updated }))
    } catch(e) { alert("Помилка: " + e.message) }
  }

  async function markFertilized(plantId) {
    try {
      await axios.post(API + `/plants/${plantId}/fertilized`, null, { headers: getHeaders() })
      await loadPlants(); await loadCalendar()
      const r = await axios.get(API + "/plants", { headers: getHeaders() })
      const updated = r.data.find(p => p.id === plantId)
      if (updated && selectedPlant?.id === plantId) setSelectedPlant(prev => ({ ...prev, ...updated }))
    } catch(e) { alert("Помилка: " + e.message) }
  }

  function logout() { localStorage.removeItem("token"); setToken(null) }
  useEffect(() => { if (token) loadAll() }, [token])

  const s = {
    page: { maxWidth: 480, width: "100%", margin: "0 auto", fontFamily: "'Nunito', sans-serif", paddingBottom: 80, background: neu.bg, minHeight: "100vh" },
    topbar: { background: "#171d1a", padding: "20px 20px 16px", boxShadow: "0 4px 16px #0d1210" },
    content: { padding: 20, background: neu.bg },
    card: { background: neu.bg, borderRadius: 20, padding: 16, marginBottom: 14, boxShadow: neu.shadow },
    btn: { width: "100%", padding: 14, background: neu.green, color: "#1a2a1a", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 10, boxShadow: `0 4px 14px ${neu.green}44` },
    btnNeu: { width: "100%", padding: 14, background: neu.bg, color: neu.green, border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10, boxShadow: neu.shadowBtn },
    btnBlue: { width: "100%", padding: 14, background: neu.blue, color: "#1a2a2a", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 10, boxShadow: `0 4px 14px ${neu.blue}44` },
    input: { width: "100%", padding: "12px 14px", border: "none", borderRadius: 12, fontSize: 14, marginBottom: 12, boxSizing: "border-box", background: neu.bg, color: neu.text, boxShadow: neu.shadowIn, outline: "none" },
    label: { fontSize: 12, color: neu.textLight, marginBottom: 6, display: "block", fontWeight: 600 },
    nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#171d1a", boxShadow: "0 -4px 16px #0d1210", display: "flex", padding: "8px 0 12px" },
    navBtn: (active) => ({ flex: 1, padding: "8px 4px", border: "none", background: "none", cursor: "pointer", fontSize: 10, fontWeight: active ? 800 : 500, color: active ? neu.green : neu.textLight, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }),
    uploadZone: { border: `2px dashed ${neu.green}55`, borderRadius: 20, padding: 32, textAlign: "center", cursor: "pointer", background: neu.bg, display: "block", width: "100%", boxShadow: neu.shadowIn },
    tag: (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: neu.bg, color: color === "green" ? neu.green : color === "red" ? neu.red : color === "blue" ? neu.blue : neu.amber, boxShadow: neu.shadowSm }),
    modal: { position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, height: "100%", background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end" },
    modalContent: { background: neu.bg, borderRadius: "24px 24px 0 0", padding: 22, width: "100%", maxHeight: "90vh", overflowY: "auto" },
  }

  if (!token) return (
    <div style={s.page}>
      <div style={{ ...s.topbar, textAlign: "center", padding: "48px 24px 32px" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: neu.bg, boxShadow: neu.shadow, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>🌿</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: neu.text }}>Plant AI</div>
        <div style={{ fontSize: 13, color: neu.textLight, marginTop: 6 }}>Аналіз рослин з ШІ</div>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", background: neu.bg, borderRadius: 14, padding: 4, marginBottom: 20, boxShadow: neu.shadowIn }}>
          <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: 10, border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, background: isLogin ? "#2a3a2a" : "transparent", color: isLogin ? neu.green : neu.textLight, boxShadow: isLogin ? neu.shadowSm : "none" }}>Увійти</button>
          <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: 10, border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, background: !isLogin ? "#2a3a2a" : "transparent", color: !isLogin ? neu.green : neu.textLight, boxShadow: !isLogin ? neu.shadowSm : "none" }}>Реєстрація</button>
        </div>
        {error && <p style={{ color: neu.red, fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</p>}
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label style={s.label}>Пароль</label>
        <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={s.btn} onClick={auth}>{isLogin ? "Увійти" : "Зареєструватись"}</button>
      </div>
    </div>
  )

  return (
    <div style={s.page}>

      {selectedPlant && (
        <div style={s.modal} onClick={() => setSelectedPlant(null)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#3a4a3a", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: neu.text }}>{selectedPlant.name}</div>
                <div style={{ fontSize: 12, color: neu.textLight, marginTop: 2 }}>{selectedPlant.species?.replace(/_/g, " ")}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => deletePlant(selectedPlant.id)} style={{ background: neu.bg, border: "none", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", boxShadow: neu.shadowBtn, fontSize: 16 }}>🗑</button>
                <button onClick={() => setSelectedPlant(null)} style={{ background: neu.bg, border: "none", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", boxShadow: neu.shadowBtn, fontSize: 20, color: neu.textLight, fontWeight: 700 }}>×</button>
              </div>
            </div>

            {(() => {
              const care = getCare(selectedPlant.species)
              return (
                <div style={{ background: neu.bg, borderRadius: 16, padding: 14, marginBottom: 14, boxShadow: neu.shadowIn }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: neu.green, marginBottom: 10 }}>📋 Рекомендації по догляду</div>
                  <div style={{ fontSize: 12, color: neu.text, display: "flex", flexDirection: "column", gap: 6 }}>
                    <span>☀️ {care.light}</span>
                    <span>🌱 {care.soil}</span>
                    <span>💡 {care.tip}</span>
                  </div>
                </div>
              )
            })()}

            <label style={{ ...s.btnBlue, display: "block", textAlign: "center", cursor: "pointer", borderRadius: 14 }}>
              {checkingPlant ? "⏳ Аналізуємо..." : "🔍 Перевірити стан рослини"}
              <input type="file" accept="image/*" onChange={(e) => checkPlantHealth(e, selectedPlant.id)} style={{ display: "none" }} />
            </label>

            {selectedPlant.lastCheck && (
              <div style={{ background: selectedPlant.lastCheck.is_disease ? "#2d1515" : "#152d1e", borderRadius: 16, padding: 14, marginBottom: 14, boxShadow: neu.shadowIn }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: selectedPlant.lastCheck.is_disease ? neu.red : neu.green, marginBottom: 10 }}>
                  {selectedPlant.lastCheck.is_disease ? "⚠️ Виявлено хворобу!" : "✅ Рослина здорова!"}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: neu.text, marginBottom: 8 }}>
                  {selectedPlant.lastCheck.results[0]?.label} — {selectedPlant.lastCheck.results[0]?.confidence}%
                </div>
                {selectedPlant.lastCheck.results.slice(1).map((r, i) => (
                  <div key={i} style={{ fontSize: 11, color: neu.textLight, marginBottom: 3 }}>
                    {r.label} — {r.confidence}%
                  </div>
                ))}
                {selectedPlant.lastCheck.treatment && (
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "#1a0f0f", borderRadius: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: neu.red, marginBottom: 6 }}>💊 Як лікувати:</div>
                    <div style={{ fontSize: 12, color: neu.textLight, lineHeight: 1.7 }}>{selectedPlant.lastCheck.treatment}</div>
                  </div>
                )}
                {selectedPlant.lastCheck.care?.watering_tip && (
                  <div style={{ fontSize: 12, color: neu.textLight, marginTop: 8, padding: "8px 12px", background: "#0f1a15", borderRadius: 10 }}>
                    💧 {selectedPlant.lastCheck.care.watering_tip}
                  </div>
                )}
              </div>
            )}

            <MiniCalendar lastDate={selectedPlant.last_watered} nextDate={selectedPlant.next_watering} intervalDays={selectedPlant.watering_interval_days || 7} onMark={markWatered} plantId={selectedPlant.id} type="water" />
            <MiniCalendar lastDate={selectedPlant.last_fertilized} nextDate={selectedPlant.next_fertilizing} intervalDays={selectedPlant.fertilizing_interval_days || 30} onMark={markFertilized} plantId={selectedPlant.id} type="fertilize" />

            {selectedPlant.notes && <div style={{ fontSize: 12, color: neu.textLight, marginTop: 4 }}>📝 {selectedPlant.notes}</div>}
          </div>
        </div>
      )}

      {showAddPlant && (
        <div style={s.modal} onClick={() => setShowAddPlant(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#3a4a3a", margin: "0 auto 16px" }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: neu.text, marginBottom: 16 }}>🪴 Додати рослину</div>
            <label style={s.label}>Як ти її називаєш</label>
            <input style={s.input} placeholder="Наприклад: Моя троянда" value={newPlant.name} onChange={e => setNewPlant({ ...newPlant, name: e.target.value })} />
            <label style={s.label}>Вид рослини</label>
            <select style={{ ...s.input, appearance: "none", WebkitAppearance: "none" }} value={newPlant.species} onChange={e => setNewPlant({ ...newPlant, species: e.target.value })}>
              <option value="">— Оберіть вид —</option>
              <optgroup label="🌹 Квіти">
                <option value="Rose_Healthy">Троянда</option>
                <option value="Hibiscus_Healthy">Гібіскус</option>
                <option value="Chrysanthemum_Healthy">Хризантема</option>
              </optgroup>
              <optgroup label="🌿 Кімнатні">
                <option value="Money Plant_Money_Plant_Healthy">Потос</option>
                <option value="Turmeric_Healthy">Куркума</option>
              </optgroup>
              <optgroup label="🍅 Городні">
                <option value="Tomato___healthy">Томат</option>
                <option value="Potato___healthy">Картопля</option>
                <option value="Pepper,_bell___healthy">Перець</option>
                <option value="Strawberry___healthy">Суниця</option>
                <option value="Apple___healthy">Яблуня</option>
                <option value="Grape___healthy">Виноград</option>
                <option value="Cherry_(including_sour)___healthy">Вишня</option>
                <option value="Peach___healthy">Персик</option>
                <option value="Blueberry___healthy">Чорниця</option>
                <option value="Raspberry___healthy">Малина</option>
              </optgroup>
              <optgroup label="🌾 Зернові">
                <option value="Corn_(maize)___healthy">Кукурудза</option>
                <option value="Soybean___healthy">Соя</option>
              </optgroup>
            </select>
            <label style={s.label}>Тип ґрунту</label>
            <select style={{ ...s.input, appearance: "none", WebkitAppearance: "none" }} value={newPlant.soil_type} onChange={e => setNewPlant({ ...newPlant, soil_type: e.target.value })}>
              <option value="">— Оберіть тип ґрунту —</option>
              <option value="Універсальний">🌱 Універсальний</option>
              <option value="Родючий, злегка кислий">🌿 Родючий, злегка кислий</option>
              <option value="Легкий, дренований">🪨 Легкий, дренований</option>
              <option value="Пухкий, родючий">🌾 Пухкий, родючий</option>
              <option value="Кактусовий">🌵 Кактусовий</option>
              <option value="Торфяний, кислий">🍂 Торфяний, кислий</option>
              <option value="Піщано-глинистий">🏖️ Піщано-глинистий</option>
            </select>
            <label style={s.label}>Нотатки</label>
            <input style={s.input} placeholder="Додаткові нотатки..." value={newPlant.notes} onChange={e => setNewPlant({ ...newPlant, notes: e.target.value })} />
            <button style={s.btn} onClick={addPlant}>Зберегти рослину</button>
            <button style={s.btnNeu} onClick={() => setShowAddPlant(false)}>Скасувати</button>
          </div>
        </div>
      )}

      {screen === "home" && <>
        <div style={s.topbar}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: neu.text }}>🌿 Plant AI</div>
              <div style={{ fontSize: 12, color: neu.textLight, marginTop: 2 }}>Привіт, {userInfo?.email?.split("@")[0]}!</div>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: neu.bg, boxShadow: neu.shadow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: neu.green }}>
              {userInfo?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
        <div style={s.content}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ ...s.card, margin: 0, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: neu.textLight, marginBottom: 4, fontWeight: 600 }}>Аналізів</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: neu.green }}>{userInfo?.total_analyses || 0}</div>
            </div>
            <div style={{ ...s.card, margin: 0, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: neu.textLight, marginBottom: 4, fontWeight: 600 }}>Моїх рослин</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: neu.green }}>{plants.length}</div>
            </div>
          </div>

          {calendar.filter(c => daysUntil(c.next_watering) <= 0).length > 0 && (
            <div style={{ ...s.card, boxShadow: neu.shadowIn, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: neu.blue, marginBottom: 10 }}>💧 Треба полити сьогодні</div>
              {calendar.filter(c => daysUntil(c.next_watering) <= 0).map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: neu.text }}>{c.plant_name}</span>
                  <button onClick={() => markWatered(c.plant_id)} style={{ padding: "6px 14px", background: neu.bg, color: neu.blue, border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: neu.shadowBtn }}>✓ Полито</button>
                </div>
              ))}
            </div>
          )}

          <label style={s.uploadZone}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📷</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: neu.green, marginBottom: 6 }}>Сфотографувати рослину</div>
            <div style={{ fontSize: 12, color: neu.textLight }}>або завантажити з галереї</div>
            <input type="file" accept="image/*" onChange={analyze} style={{ display: "none" }} />
          </label>

          {history.length > 0 && <>
            <div style={{ fontSize: 13, fontWeight: 800, color: neu.text, margin: "18px 0 10px" }}>Останні аналізи</div>
            <div style={s.card}>
              {history.slice(0, 3).map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid #2a3a2a` : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: neu.text }}>{h.result}</div>
                    <div style={{ fontSize: 11, color: neu.textLight, marginTop: 2 }}>{h.date?.slice(0, 10)}</div>
                  </div>
                  <span style={s.tag(parseFloat(h.confidence) > 80 ? "green" : "amber")}>{h.confidence}%</span>
                </div>
              ))}
            </div>
          </>}
        </div>
      </>}

      {screen === "result" && <>
        <div style={s.topbar}>
          <div style={{ fontSize: 18, fontWeight: 800, color: loading ? neu.text : neu.red }}>{loading ? "🔍 Аналізуємо..." : "📊 Результат"}</div>
          <div style={{ fontSize: 12, color: neu.textLight, marginTop: 2 }}>{loading ? "Зачекайте" : "Аналіз завершено"}</div>
        </div>
        <div style={s.content}>
          {loading && (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: neu.bg, boxShadow: neu.shadow, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>🌿</div>
              <div style={{ fontSize: 14, color: neu.text, fontWeight: 700 }}>ML модель аналізує фото...</div>
            </div>
          )}
          {!loading && !result && (
            <label style={s.uploadZone}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📷</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: neu.green }}>Завантажити фото</div>
              <input type="file" accept="image/*" onChange={analyze} style={{ display: "none" }} />
            </label>
          )}
          {result && <>
            <div style={s.card}>
              <div style={{ fontSize: 14, fontWeight: 800, color: neu.text, marginBottom: 14 }}>Топ результати</div>
              {result.results?.map((r, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: i === 0 ? 800 : 500, color: i === 0 ? neu.text : neu.textLight }}>{r.label}</span>
                    <span style={{ color: i === 0 ? neu.green : neu.textLight, fontWeight: 700 }}>{r.confidence}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: neu.bg, boxShadow: neu.shadowIn }}>
                    <div style={{ height: 6, borderRadius: 3, background: i === 0 ? neu.green : "#2a3a2a", width: `${r.confidence}%`, transition: "width 0.5s" }}></div>
                  </div>
                </div>
              ))}
            </div>

            {result.is_disease && result.treatment && (
              <div style={{ ...s.card, boxShadow: neu.shadowIn }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: neu.red, marginBottom: 10 }}>⚠️ Виявлено хворобу</div>
                <div style={{ fontSize: 12, color: neu.textLight, lineHeight: 1.7, marginBottom: 10 }}>{result.treatment}</div>
                {result.care?.watering_tip && (
                  <div style={{ fontSize: 12, color: neu.blue }}>💧 {result.care.watering_tip}</div>
                )}
              </div>
            )}

            {!result.is_disease && (
              <div style={{ ...s.card, boxShadow: neu.shadowIn }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: neu.green }}>✅ Рослина виглядає здоровою!</div>
              </div>
            )}

            <button style={{ ...s.btn }} onClick={() => {
              setNewPlant({ name: "", species: result.results?.[0]?.label?.replace(/ — /g, "___").replace(/ /g, "_") || "", soil_type: "", notes: "" })
              setShowAddPlant(true)
            }}>🪴 Додати до моїх рослин</button>
            <button style={s.btnNeu} onClick={() => setScreen("home")}>На головну</button>
          </>}
        </div>
      </>}

      {screen === "plants" && <>
        <div style={s.topbar}>
          <div style={{ fontSize: 18, fontWeight: 800, color: neu.text }}>🪴 Мої рослини</div>
          <div style={{ fontSize: 12, color: neu.textLight, marginTop: 2 }}>{plants.length} рослин</div>
        </div>
        <div style={s.content}>
          <button style={s.btn} onClick={() => { setNewPlant({ name: "", species: "", soil_type: "", notes: "" }); setShowAddPlant(true) }}>+ Додати рослину</button>
          {plants.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: neu.textLight }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: neu.bg, boxShadow: neu.shadow, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>🪴</div>
              <p style={{ fontWeight: 700 }}>У тебе ще немає рослин</p>
              <p style={{ fontSize: 12, marginTop: 6 }}>Зроби аналіз і додай рослину!</p>
            </div>
          )}
          {plants.map((p, i) => {
            const daysW = daysUntil(p.next_watering)
            return (
              <div key={i} style={{ ...s.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }} onClick={() => setSelectedPlant(p)}>
                <div style={{ width: 50, height: 50, borderRadius: 16, background: neu.bg, boxShadow: neu.shadow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🌿</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: neu.text }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: neu.textLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{p.species?.replace(/_/g, " ")}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={s.tag(daysW === null ? "blue" : daysW <= 0 ? "red" : daysW <= 2 ? "amber" : "green")}>
                    {daysW === null ? "💧!" : daysW <= 0 ? "💧 Полий!" : `💧 ${daysW}д`}
                  </span>
                  <div style={{ fontSize: 10, color: neu.textLight, marginTop: 4 }}>деталі →</div>
                </div>
              </div>
            )
          })}
        </div>
      </>}

      {screen === "profile" && <>
        <div style={s.topbar}>
          <div style={{ fontSize: 18, fontWeight: 800, color: neu.text }}>👤 Профіль</div>
        </div>
        <div style={s.content}>
          <div style={{ ...s.card, textAlign: "center", padding: 28 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: neu.bg, boxShadow: neu.shadow, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 28, fontWeight: 800, color: neu.green }}>
              {userInfo?.email?.[0]?.toUpperCase()}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: neu.text }}>{userInfo?.email}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[["Аналізів", userInfo?.total_analyses || 0], ["Рослин", plants.length], ["Розклад", calendar.length]].map(([label, val]) => (
              <div key={label} style={{ ...s.card, margin: 0, textAlign: "center", padding: 14 }}>
                <div style={{ fontSize: 10, color: neu.textLight, marginBottom: 6, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: neu.green }}>{val}</div>
              </div>
            ))}
          </div>
          <button style={{ ...s.btnNeu, color: neu.red }} onClick={logout}>Вийти з акаунту</button>
        </div>
      </>}

      <nav style={s.nav}>
        {[["🏠","Головна","home"],["📷","Аналіз","result"],["🪴","Рослини","plants"],["👤","Профіль","profile"]].map(([icon, label, sc]) => (
          <button key={sc} style={s.navBtn(screen === sc)} onClick={() => { setScreen(sc); if (sc === "result") setResult(null) }}>
            <span style={{ fontSize: 20 }}>{icon}</span>{label}
          </button>
        ))}
      </nav>
    </div>
  )
}