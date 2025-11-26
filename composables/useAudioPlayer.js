import { usePlayerStore } from "~/stores/player";

export function useAudioPlayer() {
  const playerStore = usePlayerStore();

  watchEffect(() => {
    if (playerStore.progress >= 100 && playerStore.isPlaying) {
      playerStore.audioRef.pause();
      playerStore.setPlaying(false);
      playerStore.setCurrentTime(0);
      playerStore.setProgress(0);
    }
  });

  // Инициализация плеера
  const initPlayer = (element) => {
    if (!element) {
      console.error("Плеера нет!");
      return;
    }
    playerStore.setAudioRef(element);
    setupEventListeners();
  };

  // Воспроизведение трека
  async function playTrack() {
    try {
      if (!playerStore.audioRef) return;
      await playerStore.audioRef.play();
    } catch (err) {
      console.error("Ошибка воспроизведения:", err);
    }
  }
  // Пауза трека
  const pauseTrack = () => {
    if (playerStore.audioRef) {
      playerStore.audioRef.pause();
      playerStore.setPlaying(false);

      // Сохраняем текущее время через метод хранилища
      playerStore.setCurrentTime(playerStore.audioRef.currentTime);
    }
  };

  // Обработка времени
  const handleTimeUpdate = () => {
    if (!playerStore.audioRef) return;

    const currentTime = playerStore.audioRef.currentTime;
    const duration = playerStore.audioRef.duration;

    if (duration) {
      const progress = (currentTime / duration) * 100;
      playerStore.setProgress(progress);
    }
  };
  // Обработка окончания трека
  const handleTrackEnd = () => {
    playerStore.setPlaying(false);
    playerStore.setCurrentTime(0);
    playerStore.setProgress(0);
  };

  // Перемотка
  const seekTo = (percentage) => {
    if (!playerStore.audioRef || !playerStore.currentTrack) return;

    const duration = playerStore.audioRef.duration;
    // Проверяем, что duration — конечное число
    if (typeof duration !== "number" || !isFinite(duration) || duration <= 0) {
      console.warn("Попытка перемотки, но duration не определён или равен 0");
      return;
    }

    const newTime = (percentage / 100) * duration;
    playerStore.audioRef.currentTime = newTime;
    playerStore.setCurrentTime(newTime);
    playerStore.setProgress(percentage);
  };

  // Обработка громкости
  const updateVolume = () => {
    if (!playerStore.audioRef) return;
    playerStore.audioRef.volume = playerStore.volume / 100;
  };

  function setupEventListeners() {
    if (!playerStore.audioRef) return;

    playerStore.audioRef.addEventListener("timeupdate", handleTimeUpdate);
    playerStore.audioRef.addEventListener("ended", handleTrackEnd);
    playerStore.audioRef.addEventListener("playing", () =>
      playerStore.setPlaying(true)
    );
    playerStore.audioRef.addEventListener("pause", () =>
      playerStore.setPlaying(false)
    );
  }

  return {
    initPlayer,
    playTrack,
    pauseTrack,
    handleTimeUpdate,
    handleTrackEnd,
    seekTo,
    updateVolume,
  };
}
