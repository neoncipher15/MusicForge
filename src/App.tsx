import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { Home, CheckSquare, BarChart3, Calendar, Heart, Play, Pause, RotateCcw } from 'lucide-react'
import { PomodoroProvider } from './context/PomodoroContext'
import HomePage from './pages/Home'
import TasksPage from './pages/Tasks'
import AnalyticsPage from './pages/Analytics'
import PlannerPage from './pages/Planner'
import DonationPage from './pages/Donation'
import Timer from './components/Timer'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('home')

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/planner', icon: Calendar, label: 'Planner' },
    { path: '/donation', icon: Heart, label: 'Donation' },
  ]

  return (
    <PomodoroProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          {/* Sidebar */}
          <aside
            className={`fixed left-0 top-0 h-full bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-300 z-50 ${
              isSidebarOpen ? 'w-64' : 'w-20'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-gray-700/50">
                <h1 className={`text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ${!isSidebarOpen && 'hidden'}`}>
                  🎯 Pomodoro
                </h1>
                <h1 className={`text-2xl font-bold text-center ${isSidebarOpen && 'hidden'}`}>🍅</h1>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-6">
                <ul className="space-y-2 px-4">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                            isActive
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                          }`
                        }
                        onClick={() => setActiveTab(item.path.replace('/', '') || 'home')}
                      >
                        <item.icon size={24} />
                        <span className={`${!isSidebarOpen && 'hidden'}`}>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Toggle Button */}
              <div className="p-4 border-t border-gray-700/50">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300"
                >
                  <span className={!isSidebarOpen ? 'rotate-180' : ''}>
                    <RotateCcw size={20} />
                  </span>
                  <span className={!isSidebarOpen ? 'hidden' : ''}>Collapse</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main
            className={`transition-all duration-300 ${
              isSidebarOpen ? 'ml-64' : 'ml-20'
            }`}
          >
            <div className="container-fluid p-6">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/planner" element={<PlannerPage />} />
                <Route path="/donation" element={<DonationPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>

          {/* Floating Timer */}
          <Timer />
        </div>
      </Router>
    </PomodoroProvider>
  )
}

export default App

