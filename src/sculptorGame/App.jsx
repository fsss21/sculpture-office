import { useState } from 'react'
import MainMenu from './components/MainMenu'
import StartScreen from './components/StartScreen'
import QuizScreen from './components/QuizScreen'
import ResultScreen from './components/ResultScreen'
import { useSound } from './hooks/useSound'
import { getDataUrl } from './config'
import axios from 'axios'
import styles from './App.module.css'

const GAME_STATES = {
  MENU: 'menu',
  START: 'start',
  QUIZ: 'quiz',
  RESULT: 'result'
}

function App({ exitToMenu }) {
  const [gameState, setGameState] = useState(GAME_STATES.MENU)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [quizData, setQuizData] = useState(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useSound(soundEnabled)

  const handleSelectQuiz = async (quizId) => {
    setCurrentQuiz(quizId)
    
    try {
      const response = await axios.get(getDataUrl(`${quizId === 'tools' ? 'tools-quiz' : 'sculptors-quiz'}.json`))
      setQuizData(response.data)
      setGameState(GAME_STATES.START)
    } catch (error) {
      console.error('Error loading quiz data:', error)
      const fallbackData = quizId === 'tools'
        ? {
            title: 'Узнай инструмент по описанию',
            subtitle: 'Какой инструмент нужен для этой задачи?',
            questions: []
          }
        : {
            title: 'Угадай скульптора по произведению',
            subtitle: 'Кто автор этого произведения?',
            questions: []
          }
      setQuizData(fallbackData)
      setGameState(GAME_STATES.START)
      if (fallbackData.questions.length === 0) {
        alert('Не удалось загрузить вопросы. Попробуйте позже или проверьте подключение.')
      }
    }
  }

  const handleStartQuiz = () => {
    setScore(0)
    setGameState(GAME_STATES.QUIZ)
  }

  const handleQuizComplete = (finalScore, total) => {
    setScore(finalScore)
    setTotalQuestions(total)
    setGameState(GAME_STATES.RESULT)
  }

  const handleRestart = () => {
    setScore(0)
    setGameState(GAME_STATES.QUIZ)
  }

  const handleBackToMenu = () => {
    if (typeof exitToMenu === 'function') {
      exitToMenu()
      return
    }
    setCurrentQuiz(null)
    setQuizData(null)
    setScore(0)
    setTotalQuestions(0)
    setGameState(GAME_STATES.MENU)
  }

  const handleBackToQuizSelection = () => {
    setCurrentQuiz(null)
    setQuizData(null)
    setScore(0)
    setTotalQuestions(0)
    setGameState(GAME_STATES.MENU)
  }

  return (
    <div className={styles.app}>
      {gameState === GAME_STATES.MENU && (
        <MainMenu 
          onSelectQuiz={handleSelectQuiz}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onBack={exitToMenu}
        />
      )}

      {gameState === GAME_STATES.START && quizData && (
        <StartScreen
          title={quizData.title}
          subtitle={quizData.subtitle}
          onStartQuiz={handleStartQuiz}
          quizType={currentQuiz}
          soundEnabled={soundEnabled}
        />
      )}

      {gameState === GAME_STATES.QUIZ && quizData && (
        <QuizScreen
          quizData={quizData}
          quizType={currentQuiz}
          onQuizComplete={handleQuizComplete}
          soundEnabled={soundEnabled}
        />
      )}

      {gameState === GAME_STATES.RESULT && (
        <ResultScreen
          score={score}
          totalQuestions={totalQuestions}
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
          onBackToQuizSelection={handleBackToQuizSelection}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  )
}

export default App
