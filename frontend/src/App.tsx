import AppRoutes from './routes/AppRoutes'
import { LanguageProvider } from './context/LanguageContext'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <AppRoutes />
    </LanguageProvider>
  )
}

export default App
