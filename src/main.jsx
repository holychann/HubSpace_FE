import ReactDOM from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

// 새 배포 뒤에는 열려 있던 탭이 기억하는 옛 파일(이름에 해시가 붙은 js·css)이 서버에서 사라져,
// 화면에 처음 들어갈 때 따로 받아 오는 파일을 불러오지 못한다. 이때 새로고침해 새 버전을 받는다.
// 새로고침 뒤에도 같은 실패가 나면 배포 문제이므로, 계속 새로고침하지 않게 10초 안에는 한 번만 한다.
const PRELOAD_RELOAD_KEY = 'hubspace:preload-error-reload-at'
const PRELOAD_RELOAD_INTERVAL_MS = 10_000

window.addEventListener('vite:preloadError', () => {
  try {
    const lastReloadAt = Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY))
    if (Date.now() - lastReloadAt < PRELOAD_RELOAD_INTERVAL_MS) return
    sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()))
  } catch {
    // 저장소를 쓸 수 없으면 반복 새로고침을 막을 수 없으므로 새로고침하지 않는다.
    return
  }
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
