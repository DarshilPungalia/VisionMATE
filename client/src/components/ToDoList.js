import { useState, useEffect, useRef } from "react"
import { AlertCircle, Bell, BellOff, HelpCircle, Mic, MicOff, Trash2, Volume2, VolumeX } from "lucide-react"
import "../styles/ToDoList.css"

function ToDoList() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [tasks, setTasks] = useState([])
  const [audioFeedback, setAudioFeedback] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [recognitionSupported, setRecognitionSupported] = useState(true)
  const [recognitionError, setRecognitionError] = useState(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [manualInput, setManualInput] = useState("")

  const recognitionRef = useRef(null)
  const audioContext = useRef(null)
  const focusRef = useRef(null)
  const recognitionRetryCount = useRef(0)
  const maxRetries = 3
  const recognitionActive = useRef(false)

  // Initialize audio context for sound feedback
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        audioContext.current = new AudioContext()
      } catch (error) {
        console.error("Could not initialize AudioContext:", error)
      }
    }
    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [])

  // Play audio feedback
  const playSound = (type) => {
    if (!audioFeedback || !audioContext.current) return

    try {
      const oscillator = audioContext.current.createOscillator()
      const gainNode = audioContext.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.current.destination)

      switch (type) {
        case "success":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(800, audioContext.current.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.current.currentTime + 0.1)
          gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime)
          oscillator.start()
          oscillator.stop(audioContext.current.currentTime + 0.2)
          break
        case "error":
          oscillator.type = "sawtooth"
          oscillator.frequency.setValueAtTime(300, audioContext.current.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.current.currentTime + 0.2)
          gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime)
          oscillator.start()
          oscillator.stop(audioContext.current.currentTime + 0.3)
          break
        case "notification":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(600, audioContext.current.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.current.currentTime + 0.1)
          oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.current.currentTime + 0.2)
          gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime)
          oscillator.start()
          oscillator.stop(audioContext.current.currentTime + 0.3)
          break
        case "click":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(500, audioContext.current.currentTime)
          gainNode.gain.setValueAtTime(0.05, audioContext.current.currentTime)
          oscillator.start()
          oscillator.stop(audioContext.current.currentTime + 0.05)
          break
        default:
          break
      }
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (typeof window === "undefined") return false

    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setRecognitionSupported(false)
      setRecognitionError("Speech recognition is not supported in your browser.")
      return false
    }

    try {
      // Clean up any existing instance
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onresult = null
        recognitionRef.current.abort()
        recognitionRef.current = null
        recognitionActive.current = false
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      // Configure recognition
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US" // Set language explicitly

      // Set up event handlers
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex
        const transcriptText = event.results[current][0].transcript
        setTranscript(transcriptText)
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error)

        // Handle specific error types
        if (event.error === "not-allowed") {
          setRecognitionError("Microphone access denied. Please allow microphone access in your browser settings.")
          setRecognitionSupported(false)
        } else if (event.error === "aborted") {
          // This is often a temporary error, we can try to recover
          if (recognitionRetryCount.current < maxRetries) {
            recognitionRetryCount.current++
            console.log(`Recognition aborted, retrying (${recognitionRetryCount.current}/${maxRetries})`)

            // Try to restart after a short delay
            setTimeout(() => {
              if (isListening) {
                startListening(false)
              }
            }, 1000)
          } else {
            setRecognitionError("Speech recognition repeatedly failed. Please try again later.")
            setIsListening(false)
            recognitionActive.current = false
            playSound("error")
            speak("Speech recognition failed. Please try again later.")
          }
        } else {
          // For other errors, just notify the user
          setRecognitionError(`Speech recognition error: ${event.error}`)
          setIsListening(false)
          recognitionActive.current = false
          playSound("error")
          speak(`Speech recognition error: ${event.error}`)
        }

        showToast("Error", `Speech recognition error: ${event.error}`, "error")
      }

      recognitionRef.current.onend = () => {
        // If we're supposed to be listening but recognition stopped,
        // try to restart it (unless we're intentionally stopping)
        if (isListening && recognitionRef.current && !recognitionActive.current) {
          try {
            recognitionRef.current.start()
            recognitionActive.current = true
          } catch (error) {
            console.error("Error restarting speech recognition:", error)
            setIsListening(false)
            recognitionActive.current = false
          }
        }
      }

      return true
    } catch (error) {
      console.error("Error initializing speech recognition:", error)
      setRecognitionError("Failed to initialize speech recognition.")
      setRecognitionSupported(false)
      return false
    }
  }

  // Initialize on component mount
  useEffect(() => {
    const supported = initializeSpeechRecognition()

    // Check for notification permissions
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
      Notification.requestPermission()
    }

    // Announce app is ready if speech recognition is supported
    if (supported) {
      setTimeout(() => {
        speak("Voice to-do list ready. Press Space to start listening.")
      }, 1000)
    }

    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      // Space to toggle listening when not in an input
      if (
        e.code === "Space" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        !document.activeElement?.hasAttribute("role")
      ) {
        e.preventDefault()
        toggleListening()
      }

      // Escape to stop listening
      if (e.code === "Escape" && isListening) {
        e.preventDefault()
        stopListening()
      }

      // Alt+H to open help
      if (e.altKey && e.code === "KeyH") {
        e.preventDefault()
        setIsHelpOpen(!isHelpOpen)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Clean up on unmount
    return () => {
      stopListening()
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Set up task reminders
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date()
      tasks.forEach((task) => {
        if (task.reminder && !task.completed && new Date(task.reminder) <= now) {
          // Trigger notification
          if (Notification.permission === "granted") {
            try {
              new Notification("Task Reminder", {
                body: task.text,
                icon: "/favicon.ico",
              })
            } catch (error) {
              console.error("Error showing notification:", error)
            }
          }

          // Play notification sound
          playSound("notification")

          // Also announce for screen readers
          speak(`Reminder for task: ${task.text}`)

          // Remove the reminder after it's triggered
          updateTaskReminder(task.id, null)
        }
      })
    }, 10000) // Check every 10 seconds

    return () => clearInterval(intervalId)
  }, [tasks])

  // Text-to-speech function
  const speak = (text) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.1 // Slightly faster than default
        utterance.pitch = 1.0
        utterance.volume = 1.0
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("Error using speech synthesis:", error)
      }
    }
  }

  // Start listening with error handling
  const startListening = (announceStart = true) => {
    if (!recognitionSupported) {
      showToast("Not Available", "Speech recognition is not supported or has been disabled.", "error")
      return false
    }

    try {
      // Re-initialize recognition to ensure a fresh instance
      if (!recognitionRef.current) {
        initializeSpeechRecognition()
      }

      if (recognitionRef.current && !recognitionActive.current) {
        recognitionRef.current.start()
        recognitionActive.current = true
        setIsListening(true)
        recognitionRetryCount.current = 0 // Reset retry counter
        setRecognitionError(null)

        if (announceStart) {
          speak("Listening for your task. Speak clearly.")
        }

        return true
      }
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      showToast("Error", "Failed to start speech recognition.", "error")
      setIsListening(false)
      recognitionActive.current = false
      return false
    }

    return false
  }

  // Stop listening safely
  const stopListening = () => {
    if (recognitionRef.current && recognitionActive.current) {
      try {
        recognitionRef.current.stop()
        recognitionActive.current = false
      } catch (error) {
        console.error("Error stopping speech recognition:", error)
        // If stop fails, try to abort
        try {
          recognitionRef.current.abort()
          recognitionActive.current = false
        } catch (abortError) {
          console.error("Error aborting speech recognition:", abortError)
        }
      }
    }

    setIsListening(false)
  }

  const toggleListening = () => {
    playSound("click")

    if (isListening) {
      stopListening()
      speak("Listening stopped")

      // Process the transcript to add a task
      if (transcript.trim()) {
        addTask(transcript)
        setTranscript("")
      }
    } else {
      startListening()
    }
  }

  // Simple toast implementation
  const showToast = (title, message, type = "info") => {
    // In a real app, you would use a toast library or implement a proper toast component
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`)
  }

  const addTask = (text) => {
    // Process voice commands
    const lowerText = text.toLowerCase().trim()

    if (lowerText.startsWith("add ")) {
      const taskText = text.substring(4).trim()
      const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        reminder: null,
      }

      setTasks((prev) => [...prev, newTask])
      playSound("success")
      speak(`Added task: ${taskText}`)
      showToast("Task Added", taskText, "success")
    } else if (lowerText.startsWith("complete ") || lowerText.startsWith("mark complete ")) {
      const searchText = lowerText.startsWith("complete ") ? text.substring(9).trim() : text.substring(14).trim()

      completeTaskByText(searchText)
    } else if (lowerText.startsWith("delete ") || lowerText.startsWith("remove ")) {
      const searchText = lowerText.startsWith("delete ") ? text.substring(7).trim() : text.substring(7).trim()

      deleteTaskByText(searchText)
    } else if (lowerText.startsWith("remind ")) {
      // Format: "remind [task text] in [time period]"
      const reminderText = text.substring(7).trim()
      const inIndex = reminderText.lastIndexOf(" in ")

      if (inIndex > 0) {
        const taskText = reminderText.substring(0, inIndex).trim()
        const timeText = reminderText.substring(inIndex + 4).trim()
        setReminderByText(taskText, timeText)
      } else {
        playSound("error")
        speak("Please specify a time for the reminder using the format: remind [task] in [time period]")
      }
    } else if (lowerText === "read tasks" || lowerText === "read my tasks") {
      readAllTasks()
    } else if (lowerText === "help" || lowerText === "what can i say") {
      speak(
        "You can say: Add followed by your task, Complete followed by task name, Delete followed by task name, Remind followed by task name and in followed by time, or Read tasks to hear all your tasks.",
      )
    } else {
      // Default: add as a new task
      const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        reminder: null,
      }

      setTasks((prev) => [...prev, newTask])
      playSound("success")
      speak(`Added task: ${text}`)
      showToast("Task Added", text, "success")
    }
  }

  const readAllTasks = () => {
    if (tasks.length === 0) {
      speak("You have no tasks.")
      return
    }

    speak(
      `You have ${tasks.length} tasks. ${tasks
        .map(
          (task, index) =>
            `Task ${index + 1}: ${task.text}. ${task.completed ? "Completed." : "Not completed."} ${
              task.reminder
                ? `Reminder set for ${new Date(task.reminder).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`
                : ""
            }`,
        )
        .join(" ")}`,
    )
  }

  const completeTaskByText = (searchText) => {
    let found = false
    setTasks((prev) =>
      prev.map((task) => {
        if (task.text.toLowerCase().includes(searchText.toLowerCase())) {
          found = true
          return { ...task, completed: true }
        }
        return task
      }),
    )

    if (found) {
      playSound("success")
      speak(`Marked task as complete: ${searchText}`)
      showToast("Task Completed", searchText, "success")
    } else {
      playSound("error")
      speak(`No task found containing: ${searchText}`)
    }
  }

  const deleteTaskByText = (searchText) => {
    let found = false
    let deletedTask = ""

    setTasks((prev) => {
      const filtered = prev.filter((task) => {
        const match = task.text.toLowerCase().includes(searchText.toLowerCase())
        if (match) {
          found = true
          deletedTask = task.text
        }
        return !match
      })
      return filtered
    })

    if (found) {
      playSound("success")
      speak(`Deleted task: ${deletedTask}`)
      showToast("Task Deleted", deletedTask, "success")
    } else {
      playSound("error")
      speak(`No task found containing: ${searchText}`)
    }
  }

  const setReminderByText = (taskText, timeText) => {
    let reminderTime = null
    const now = new Date()

    // Parse time text like "5 minutes", "1 hour", "tomorrow"
    if (timeText.includes("minute")) {
      const minutes = Number.parseInt(timeText.match(/\d+/)?.[0] || "5")
      reminderTime = new Date(now.getTime() + minutes * 60000)
    } else if (timeText.includes("hour")) {
      const hours = Number.parseInt(timeText.match(/\d+/)?.[0] || "1")
      reminderTime = new Date(now.getTime() + hours * 3600000)
    } else if (timeText.includes("tomorrow")) {
      reminderTime = new Date(now.getTime() + 86400000) // 24 hours
    } else {
      // Default to 5 minutes if we can't parse
      reminderTime = new Date(now.getTime() + 300000)
    }

    let found = false
    setTasks((prev) =>
      prev.map((task) => {
        if (task.text.toLowerCase().includes(taskText.toLowerCase())) {
          found = true
          return { ...task, reminder: reminderTime }
        }
        return task
      }),
    )

    if (found && reminderTime) {
      const timeString = reminderTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      playSound("success")
      speak(`Set reminder for task: ${taskText} at ${timeString}`)
      showToast("Reminder Set", `${taskText} at ${timeString}`, "success")
    } else {
      playSound("error")
      speak(`No task found containing: ${taskText}`)
    }
  }

  const toggleTaskCompletion = (id) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const newStatus = !task.completed
          playSound(newStatus ? "success" : "click")
          speak(`Task ${newStatus ? "completed" : "marked as incomplete"}: ${task.text}`)
          return { ...task, completed: newStatus }
        }
        return task
      }),
    )
  }

  const deleteTask = (id) => {
    const taskToDelete = tasks.find((task) => task.id === id)
    setTasks((prev) => prev.filter((task) => task.id !== id))

    if (taskToDelete) {
      playSound("click")
      speak(`Deleted task: ${taskToDelete.text}`)
    }
  }

  const updateTaskReminder = (id, reminderTime) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          return { ...task, reminder: reminderTime }
        }
        return task
      }),
    )
  }

  const toggleTaskReminder = (id) => {
    const task = tasks.find((t) => t.id === id)

    if (task) {
      if (task.reminder) {
        updateTaskReminder(id, null)
        playSound("click")
        speak(`Removed reminder for task: ${task.text}`)
      } else {
        // Set reminder for 30 minutes from now
        const reminderTime = new Date(new Date().getTime() + 30 * 60000)
        updateTaskReminder(id, reminderTime)
        const timeString = reminderTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        playSound("success")
        speak(`Set reminder for task: ${task.text} at ${timeString}`)
      }
    }
  }

  // Toggle accessibility settings
  const toggleAudioFeedback = () => {
    setAudioFeedback(!audioFeedback)
    speak(audioFeedback ? "Audio feedback disabled" : "Audio feedback enabled")
  }

  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
    speak(highContrast ? "High contrast mode disabled" : "High contrast mode enabled")
  }

  const toggleLargeText = () => {
    setLargeText(!largeText)
    speak(largeText ? "Large text mode disabled" : "Large text mode enabled")
  }

  // Get text size class based on setting
  const getTextSizeClass = (baseSize) => {
    if (!largeText) return baseSize

    switch (baseSize) {
      case "text-sm":
        return "text-base"
      case "text-base":
        return "text-lg"
      case "text-lg":
        return "text-xl"
      case "text-xl":
        return "text-2xl"
      default:
        return baseSize
    }
  }

  // Handle manual text input as fallback
  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualInput.trim()) {
      addTask(manualInput)
      setManualInput("")
    }
  }

  return (
    <div className={`todo-container ${highContrast ? "high-contrast" : ""}`}>
      <div className="card">
        <div className="card-header">
          <div className="header-content">
            <h1 className={getTextSizeClass("text-xl")}>Voice To-Do List</h1>
            <div className="header-buttons">
              <button
                className="icon-button"
                onClick={toggleAudioFeedback}
                aria-label={audioFeedback ? "Disable audio feedback" : "Enable audio feedback"}
              >
                {audioFeedback ? <Volume2 className="icon" /> : <VolumeX className="icon" />}
              </button>
              <button className="icon-button" onClick={() => setIsHelpOpen(!isHelpOpen)} aria-label="Open help dialog">
                <HelpCircle className="icon" />
              </button>
            </div>
          </div>
          <p className={`description ${getTextSizeClass("text-sm")}`}>
            Press Space to start listening. Try saying "Add [task]" or "Help" for more commands.
          </p>
        </div>

        <div className="card-content">
          {recognitionError && (
            <div className="alert error">
              <AlertCircle className="icon-small" />
              <div>
                <h4>Speech Recognition Error</h4>
                <p>
                  {recognitionError}
                  {!recognitionSupported && (
                    <span className="mt-2">You can still use the text input below as an alternative.</span>
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="button-container">
            <button
              ref={focusRef}
              onClick={toggleListening}
              aria-label={isListening ? "Stop listening" : "Start listening"}
              className={`primary-button ${isListening ? "destructive" : ""} ${getTextSizeClass("text-base")}`}
              disabled={!recognitionSupported}
            >
              {isListening ? (
                <>
                  <MicOff className="icon-small" /> Stop Listening
                </>
              ) : (
                <>
                  <Mic className="icon-small" /> Start Listening
                </>
              )}
            </button>
          </div>

          {isListening && (
            <div className="listening-box" aria-live="polite">
              <p className={`font-medium ${getTextSizeClass("text-base")}`}>Listening...</p>
              <p className={getTextSizeClass("text-base")}>{transcript || "Speak now..."}</p>
            </div>
          )}

          {/* Manual text input as fallback */}
          <form onSubmit={handleManualSubmit} className="input-form">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Type a task or command..."
              className={`text-input ${getTextSizeClass("text-base")}`}
              aria-label="Type a task or command"
            />
            <button type="submit" className="secondary-button">
              Add
            </button>
          </form>

          <div className="tasks-section">
            <h3 className={`${getTextSizeClass("text-lg")} section-title`} id="tasks-heading">
              Your Tasks
            </h3>
            {tasks.length === 0 ? (
              <p className={`${getTextSizeClass("text-base")} empty-message`}>
                No tasks yet. Start speaking or typing to add some!
              </p>
            ) : (
              <ul className="task-list" aria-labelledby="tasks-heading">
                {tasks.map((task) => (
                  <li key={task.id} className="task-item">
                    <div className="task-content">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                          aria-label={`Mark ${task.text} as ${task.completed ? "incomplete" : "complete"}`}
                        />
                        <span className="checkmark"></span>
                      </label>
                      <span
                        className={`task-text ${getTextSizeClass("text-base")} ${task.completed ? "completed" : ""}`}
                      >
                        {task.text}
                        {task.reminder && (
                          <span className={`reminder-time ${getTextSizeClass("text-xs")}`}>
                            {new Date(task.reminder).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="task-actions">
                      <button
                        className="icon-button"
                        onClick={() => toggleTaskReminder(task.id)}
                        aria-label={task.reminder ? "Remove reminder" : "Set reminder"}
                      >
                        {task.reminder ? <Bell className="icon-small" /> : <BellOff className="icon-small" />}
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Delete task: ${task.text}`}
                      >
                        <Trash2 className="icon-small" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card-footer">
          <p className={`footer-text ${getTextSizeClass("text-sm")}`}>
            Press Space to start/stop listening or Alt+H for help.
          </p>
        </div>
      </div>

      {/* Help Dialog */}
      {isHelpOpen && (
        <div className="dialog-overlay" onClick={() => setIsHelpOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className={getTextSizeClass("text-lg")}>Help & Accessibility</h2>
              <p className={getTextSizeClass("text-sm")}>Voice commands and keyboard shortcuts</p>
            </div>
            <div className="dialog-content">
              <div className="help-section">
                <h3 className={`section-subtitle ${getTextSizeClass("text-base")}`}>Voice Commands:</h3>
                <ul className="help-list">
                  <li className={getTextSizeClass("text-sm")}>"Add [task]" - Creates a new task</li>
                  <li className={getTextSizeClass("text-sm")}>"Complete [task]" - Marks a task as done</li>
                  <li className={getTextSizeClass("text-sm")}>"Delete [task]" - Removes a task</li>
                  <li className={getTextSizeClass("text-sm")}>"Remind [task] in [time]" - Sets a reminder</li>
                  <li className={getTextSizeClass("text-sm")}>"Read tasks" - Reads all your tasks</li>
                  <li className={getTextSizeClass("text-sm")}>"Help" - Lists available commands</li>
                </ul>
              </div>
              <div className="help-section">
                <h3 className={`section-subtitle ${getTextSizeClass("text-base")}`}>Keyboard Shortcuts:</h3>
                <ul className="help-list">
                  <li className={getTextSizeClass("text-sm")}>Space - Start/stop listening</li>
                  <li className={getTextSizeClass("text-sm")}>Escape - Stop listening</li>
                  <li className={getTextSizeClass("text-sm")}>Alt+H - Open this help dialog</li>
                </ul>
              </div>
              <div className="help-section">
                <h3 className={`section-subtitle ${getTextSizeClass("text-base")}`}>Accessibility Settings:</h3>
                <div className="settings-option">
                  <label htmlFor="high-contrast" className={getTextSizeClass("text-sm")}>
                    High Contrast Mode
                  </label>
                  <input
                    type="checkbox"
                    id="high-contrast"
                    checked={highContrast}
                    onChange={() => toggleHighContrast()}
                    className="toggle-switch"
                  />
                </div>
                <div className="settings-option">
                  <label htmlFor="large-text" className={getTextSizeClass("text-sm")}>
                    Large Text Mode
                  </label>
                  <input
                    type="checkbox"
                    id="large-text"
                    checked={largeText}
                    onChange={() => toggleLargeText()}
                    className="toggle-switch"
                  />
                </div>
                <div className="settings-option">
                  <label htmlFor="audio-feedback" className={getTextSizeClass("text-sm")}>
                    Audio Feedback
                  </label>
                  <input
                    type="checkbox"
                    id="audio-feedback"
                    checked={audioFeedback}
                    onChange={() => toggleAudioFeedback()}
                    className="toggle-switch"
                  />
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="primary-button" onClick={() => setIsHelpOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ToDoList

