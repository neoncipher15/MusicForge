import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface Session {
  id: string
  mode: TimerMode
  duration: number
  completedAt: Date
}

interface PomodoroContextType {
  // Timer state
  mode: TimerMode
  status: TimerStatus
  timeRemaining: number
  totalTime: number
  
  // Session history
  sessions: Session[]
  todayFocusTime: number
  completedPomodoros: number
  
  // Actions
  setMode: (mode: TimerMode) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tick: () => void
  completeSession: () => void
  
  // Settings
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  setFocusDuration: (minutes: number) => void
  setShortBreakDuration: (minutes: number) => void
  setLongBreakDuration: (minutes: number) => void
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

const MODES: Record<TimerMode, number> = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15
}

const STORAGE_KEY = 'pomodoro-sessions'

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<TimerMode>('focus')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeRemaining, setTimeRemaining] = useState(MODES.focus * 60)
  const [totalTime, setTotalTime] = useState(MODES.focus * 60)
  const [sessions, setSessions] = useState<Session[]>([])
  const [focusDuration, setFocusDurationState] = useState(25)
  const [shortBreakDuration, setShortBreakDurationState] = useState(5)
  const [longBreakDuration, setLongBreakDurationState] = useState(15)

  // Load sessions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSessions(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse sessions:', e)
      }
    }
  }, [])

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  // Calculate today's stats
  const todayFocusTime = sessions.reduce((acc, session) => {
    const sessionDate = new Date(session.completedAt)
    const today = new Date()
    if (
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear() &&
      session.mode === 'focus'
    ) {
      return acc + session.duration
    }
    return acc
  }, 0)

  const completedPomodoros = sessions.filter(session => {
    const sessionDate = new Date(session.completedAt)
    const today = new Date()
    return (
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear() &&
      session.mode === 'focus'
    )
  }).length

  const setMode = useCallback((newMode: TimerMode) => {
    setModeState(newMode)
    setTotalTime(MODES[newMode] * 60)
    setTimeRemaining(MODES[newMode] * 60)
    setStatus('idle')
  }, [])

  const setFocusDuration = useCallback((minutes: number) => {
    setFocusDurationState(minutes)
    if (mode === 'focus') {
      const newTime = minutes * 60
      setTotalTime(newTime)
      if (status === 'idle') {
        setTimeRemaining(newTime)
      }
    }
  }, [mode, status])

  const setShortBreakDuration = useCallback((minutes: number) => {
    setShortBreakDurationState(minutes)
    if (mode === 'shortBreak') {
      const newTime = minutes * 60
      setTotalTime(newTime)
      if (status === 'idle') {
        setTimeRemaining(newTime)
      }
    }
  }, [mode, status])

  const setLongBreakDuration = useCallback((minutes: number) => {
    setLongBreakDurationState(minutes)
    if (mode === 'longBreak') {
      const newTime = minutes * 60
      setTotalTime(newTime)
      if (status === 'idle') {
        setTimeRemaining(newTime)
      }
    }
  }, [mode, status])

  const startTimer = useCallback(() => {
    setStatus('running')
  }, [])

  const pauseTimer = useCallback(() => {
    setStatus('paused')
  }, [])

  const resetTimer = useCallback(() => {
    setTimeRemaining(totalTime)
    setStatus('idle')
  }, [totalTime])

  const tick = useCallback(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        // Timer completed
        return 0
      }
      return prev - 1
    })
  }, [])

  const completeSession = useCallback(() => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      mode,
      duration: totalTime - timeRemaining,
      completedAt: new Date()
    }
    setSessions(prev => [...prev, newSession])
  }, [mode, totalTime, timeRemaining])

  const value: PomodoroContextType = {
    mode,
    status,
    timeRemaining,
    totalTime,
    sessions,
    todayFocusTime,
    completedPomodoros,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    completeSession,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    setFocusDuration,
    setShortBreakDuration,
    setLongBreakDuration
  }

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  )
}

export const usePomodoro = (): PomodoroContextType => {
  const context = useContext(PomodoroContext)
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider')
  }
  return context
}

