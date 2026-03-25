export const SOUNDS = {
  // UI click / transition sound
  timerStart: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  // Soft bell / notification chime
  timerFinish: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  // Magical / success ding for completing
  taskComplete: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  // Low pop / cancel format
  taskUndo: "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3",
}

export const playSound = (type: keyof typeof SOUNDS) => {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio(SOUNDS[type])
    audio.volume = 0.4 // prevent sounds from being too loud
    audio.play().catch(e => console.log("Audio play failed (browser might require interaction first):", e))
  } catch (error) {
    console.log("Audio error:", error)
  }
}
