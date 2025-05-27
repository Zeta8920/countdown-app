import { useState, useEffect } from "react";

export default function CountdownApp() {
  const [screen, setScreen] = useState("countdown");
  const [phases] = useState([
    { name: "Pre-vuelo", duration: 2 },
    { name: "Despegar", duration: 1 },
    { name: "Crucero", duration: 2 }
  ]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [paused, setPaused] = useState(true);
  const [beepType] = useState("sine");

  // Iniciar el cronómetro al cargar
  useEffect(() => {
    if (screen === "countdown") {
      setTimeLeft(phases[currentPhase].duration * 60);
    }
  }, [screen, currentPhase, phases]);

  // Funciones de voz y pitido
  const speak = (text) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      window.speechSynthesis.speak(utterance);
    } catch {
      console.warn("Speech synthesis not available");
    }
  };

  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = beepType;
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      console.warn("Audio not available");
    }
  };

  // Lógica de cuenta regresiva
  useEffect(() => {
    if (isRunning && !paused) {
      if (timeLeft > 0) {
        if (timeLeft <= 5) {
          beep();
          speak(`${timeLeft}`);
        }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        if (currentPhase < phases.length - 1) {
          setCurrentPhase(currentPhase + 1);
          setTimeLeft(phases[currentPhase + 1].duration * 60);
          speak(`Comienza ${phases[currentPhase + 1].name}`);
        } else {
          setIsRunning(false);
          setScreen("done");
          speak("Trabajo finalizado");
        }
      }
    }
  }, [isRunning, paused, timeLeft, currentPhase, phases]);

  // Formateo tiempo y progreso
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const progress = phases[currentPhase].duration
    ? 1 - timeLeft / (phases[currentPhase].duration * 60)
    : 0;
  const dashOffset = 628 * (1 - progress);

  // Controles
  const toggleTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setPaused(false);
    } else {
      setPaused(!paused);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPaused(true);
    setCurrentPhase(0);
    setTimeLeft(phases[0].duration * 60);
    setScreen("countdown");
  };

  // Pantalla final
  if (screen === "done") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-yellow-400 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Trabajo finalizado</h1>
          <button
            onClick={resetTimer}
            className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-6 rounded shadow-md"
          >
            Reiniciar
          </button>
        </div>
      </main>
    );
  }

  // Vista principal
  return (
    <main className="flex items-center justify-center min-h-screen bg-yellow-400 text-white px-4">
      <div className="w-full max-w-md mx-auto space-y-8 text-center">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold">{phases[currentPhase].name}</h1>
          <h2 className="text-lg text-gray-300">
            Fase {currentPhase + 1} / {phases.length}
          </h2>
        </div>

        {/* Cronómetro circular */}
        <div className="relative w-64 h-64 mx-auto">
          <svg viewBox="0 0 256 256" className="absolute inset-0 w-full h-full">
            <circle cx="128" cy="128" r="100" stroke="#333" strokeWidth="12" fill="none" />
            <circle
              cx="128"
              cy="128"
              r="100"
              stroke="8A2BE2"
              strokeWidth="12"
              fill="none"
              strokeDasharray={628}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 128 128)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-semibold">{minutes}:{seconds}</span>
            <span className="text-sm text-red-500">{phases[currentPhase].duration * 60} seg</span>
          </div>
        </div>

        {/* Info siguiente fase */}
        <div>
          <p className="text-sm text-gray-300 mb-1">Siguiente:</p>
          <p className="text-lg font-semibold">
            {currentPhase + 1 < phases.length ? phases[currentPhase + 1].name : "Fin"}
          </p>
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-6 rounded shadow-md transition"
          >
            {!isRunning ? "Iniciar" : paused ? "Reanudar" : "Pausar"}
          </button>
          <button
            onClick={resetTimer}
            className="border border-white text-white font-bold py-2 px-6 rounded hover:bg-white hover:text-black transition"
          >
            Reset
          </button>
        </div>
      </div>
    </main>
  );
}
