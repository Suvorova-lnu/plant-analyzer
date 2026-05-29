import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:8000"

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

  const headers = { Authorization: `Bearer ${token}` }

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
    setLoading(true)
    setResult(null)
    setScreen("result")
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await axios.post(API + "/analyze", form, { headers })
      setResult(res.data.results)
      loadHistory()
    } catch {
      setError("Помилка аналізу")
    }
    setLoading(false)
  }

  async function loadHistory() {
    try {
      const res = await axios.get(API + "/history", { headers })
      setHistory(res.data)
    } catch {}
  }

  async function loadMe() {
    try {
      const res = await axios.get(API + "/me", { headers })
      setUserInfo(res.data)
    } catch {}
  }

  function logout() {
    localStorage.removeItem("token")
    setToken(null)
    setResult(null)
    setHistory([])
  }

  useEffect(() => {
    if (token) { loadHistory(); loadMe() }
  }, [token])

  const s = {
    page: { maxWidth: 480, width: "100%", margin: "0 auto", fontFamily: "sans-serif", paddingBottom: 70, background: "#fff", minHeight: "100vh", boxShadow: "0 0 40px rgba(0,0,0,0.1)" },
    topbar: { background: "#1a3a2a", padding: "14px 16px", color: "#fff" },
    topbarTitle: { fontSize: 16, fontWeight: 500, margin: 0 },
    topbarSub: { fontSize: 11, opacity: .7, margin: "2px 0 0" },
    content: { padding: 16, background: "#f5f5f5", minHeight: "calc(100vh - 120px)" },
    card: { background: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, border: "0.5px solid #e0e0e0" },
    btn: { width: "100%", padding: 13, background: "#1a6b3a", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer", marginBottom: 8 },
    btnOut: { width: "100%", padding: 11, background: "none", color: "#1a6b3a", border: "1.5px solid #1a6b3a", borderRadius: 12, fontSize: 14, cursor: "pointer", marginBottom: 8 },
    input: { width: "100%", padding: "10px 12px", border: "0.5px solid #ddd", borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box" },
    label: { fontSize: 12, color: "#666", marginBottom: 4, display: "block" },
    nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "0.5px solid #eee", display: "flex" },
    navBtn: (active) => ({ flex: 1, padding: "10px 4px 8px", border: "none", background: "none", cursor: "pointer", fontSize: 10, color: active ? "#1a6b3a" : "#999", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }),
    uploadZone: { border: "2px dashed #5DCAA5", borderRadius: 12, padding: 28, textAlign: "center", cursor: "pointer", background: "#E1F5EE", display: "block", width: "100%" },    tag: (color) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: color === "green" ? "#EAF3DE" : color === "red" ? "#FCEBEB" : "#FAEEDA", color: color === "green" ? "#27500A" : color === "red" ? "#791F1F" : "#633806" }),
    error: { color: "#A32D2D", fontSize: 13, marginBottom: 10, textAlign: "center" }
  }

  if (!token) return (
    <div style={s.page}>
      <div style={{ ...s.topbar, textAlign: "center", padding: "32px 20px 24px" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🌿</div>
        <div style={{ fontSize: 18, fontWeight: 500 }}>Plant AI</div>
        <div style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>Аналіз рослин з ШІ</div>
      </div>
      <div style={{ padding: 20, background: "#fff", minHeight: "100vh" }}>
        <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 8, padding: 3, marginBottom: 16 }}>
          <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: 8, border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500, background: isLogin ? "#fff" : "none", fontSize: 13 }}>Увійти</button>
          <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: 8, border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500, background: !isLogin ? "#fff" : "none", fontSize: 13 }}>Реєстрація</button>
        </div>
        {error && <p style={s.error}>{error}</p>}
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
      {screen === "home" && <>
        <div style={s.topbar}>
          <p style={s.topbarTitle}>🌿 Plant AI</p>
          <p style={s.topbarSub}>Привіт, {userInfo?.email?.split("@")[0]}!</p>
        </div>
        <div style={s.content}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div style={{ ...s.card, margin: 0 }}><div style={{ fontSize: 11, color: "#666" }}>Аналізів</div><div style={{ fontSize: 24, fontWeight: 500 }}>{userInfo?.total_analyses || 0}</div></div>
            <div style={{ ...s.card, margin: 0 }}><div style={{ fontSize: 11, color: "#666" }}>Останній</div><div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{history[0]?.result?.split(" — ")[0] || "—"}</div></div>
          </div>
          <label style={s.uploadZone}>
  <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
  <div style={{ fontSize: 15, fontWeight: 500, color: "#085041", marginBottom: 6 }}>Сфотографувати рослину</div>
  <div style={{ fontSize: 12, color: "#0F6E56" }}>або завантажити з галереї</div>
  <input type="file" accept="image/*" capture="environment" onChange={analyze} style={{ display: "none" }} />
</label>
          {history.length > 0 && <>
            <div style={{ fontSize: 13, fontWeight: 500, margin: "16px 0 8px" }}>Останні аналізи</div>
            <div style={s.card}>
              {history.slice(0, 3).map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "0.5px solid #eee" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{h.result}</div>
                    <div style={{ fontSize: 11, color: "#999" }}>{h.date?.slice(0, 10)}</div>
                  </div>
                  <span style={s.tag(parseFloat(h.confidence) > 80 ? "green" : "amber")}>{h.confidence}%</span>
                </div>
              ))}
            </div>
          </>}
        </div>
      </>}

      {screen === "result" && <>
        <div style={{ ...s.topbar, background: loading ? "#1a3a2a" : "#712B13" }}>
          <p style={s.topbarTitle}>{loading ? "Аналізуємо..." : "Результат"}</p>
          <p style={s.topbarSub}>{loading ? "Зачекайте" : "Аналіз завершено"}</p>
        </div>
        <div style={s.content}>
          {loading && <div style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 48 }}>🔍</div><p>ML модель аналізує фото...</p></div>}
          {result && <>
            <div style={s.card}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Топ результати</div>
              {result.map((r, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                    <span style={{ fontWeight: i === 0 ? 500 : 400 }}>{r.label}</span>
                    <span style={{ color: "#666" }}>{r.confidence}%</span>
                  </div>
                  <div style={{ height: 6, background: "#eee", borderRadius: 3 }}>
                    <div style={{ height: 6, borderRadius: 3, background: i === 0 ? "#1a6b3a" : "#ccc", width: `${r.confidence}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button style={s.btn} onClick={() => setScreen("home")}>На головну</button>
          </>}
        </div>
      </>}

      {screen === "history" && <>
        <div style={s.topbar}><p style={s.topbarTitle}>Історія аналізів</p></div>
        <div style={s.content}>
          <div style={s.card}>
            {history.length === 0 && <p style={{ textAlign: "center", color: "#999" }}>Ще немає аналізів</p>}
            {history.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < history.length - 1 ? "0.5px solid #eee" : "none" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{h.result}</div>
                  <div style={{ fontSize: 11, color: "#999" }}>{h.date?.slice(0, 10)}</div>
                </div>
                <span style={s.tag(parseFloat(h.confidence) > 80 ? "green" : "amber")}>{h.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      </>}

      {screen === "profile" && <>
        <div style={s.topbar}><p style={s.topbarTitle}>Профіль</p></div>
        <div style={s.content}>
          <div style={{ ...s.card, textAlign: "center", padding: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EAF3DE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 20, fontWeight: 500, color: "#27500A" }}>
              {userInfo?.email?.[0]?.toUpperCase()}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{userInfo?.email}</div>
            <div style={{ marginTop: 8 }}><span style={s.tag("green")}>Активний акаунт</span></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div style={{ ...s.card, margin: 0 }}><div style={{ fontSize: 11, color: "#666" }}>Всього аналізів</div><div style={{ fontSize: 24, fontWeight: 500 }}>{userInfo?.total_analyses || 0}</div></div>
            <div style={{ ...s.card, margin: 0 }}><div style={{ fontSize: 11, color: "#666" }}>Акаунт</div><div style={{ fontSize: 13, fontWeight: 500, marginTop: 4, color: "#1a6b3a" }}>Активний</div></div>
          </div>
          <button style={{ ...s.btn, background: "none", color: "#A32D2D", border: "0.5px solid #F09595" }} onClick={logout}>Вийти з акаунту</button>
        </div>
      </>}

      <nav style={s.nav}>
        {[["🏠","Головна","home"],["📷","Аналіз","result"],["🕐","Історія","history"],["👤","Профіль","profile"]].map(([icon, label, sc]) => (
          <button key={sc} style={s.navBtn(screen === sc)} onClick={() => { setScreen(sc); if(sc==="result") setResult(null) }}>
            <span style={{ fontSize: 20 }}>{icon}</span>{label}
          </button>
        ))}
      </nav>
    </div>
  )
}