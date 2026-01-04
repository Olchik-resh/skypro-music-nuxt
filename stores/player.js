import { defineStore } from "pinia";
import { useTracksStore } from "./useTracks";

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const usePlayerStore = defineStore("player", {
  state: () => ({
    currentTrack: null,
    playlist: [],
    isPlaying: false,
    progress: 0,
    volume: 50,
    audioRef: null,
    currentTime: 0,
    currentTrackIndex: -1,
    isShuffle: false,
    isLoop: false,
    originalPlaylist: [],
    shufflePlaylist: [],
    _onCanPlay: null,
    duration: 0,
  }),

  getters: {
    hasPrevTrack(state) {
      if (state.isLoop) return true;
      return state.currentTrackIndex > 0;
    },
    hasNextTrack(state) {
      if (state.isLoop) return true;
      return state.currentTrackIndex < state.activePlaylist.length - 1;
    },
    activePlaylist(state) {
      return state.isShuffle ? state.shufflePlaylist : state.playlist;
    },
    currentTrackInfo(state) {
      return state.currentTrack;
    },
    isTrackLiked(state) {
      const tracksStore = useTracksStore();
      return state.currentTrack
        ? tracksStore.likedTracks.has(state.currentTrack.id)
        : false;
    },
    progressPercent(state) {
      return state.duration > 0
        ? (state.currentTime / state.duration) * 100
        : 0;
    },
    formattedCurrentTime(state) {
      const min = Math.floor(state.currentTime / 60);
      const sec = Math.floor(state.currentTime % 60)
        .toString()
        .padStart(2, "0");
      return `${min}:${sec}`;
    },
    formattedDuration(state) {
      const duration = state.audioRef?.duration || 0;
      const min = Math.floor(duration / 60);
      const sec = Math.floor(duration % 60)
        .toString()
        .padStart(2, "0");
      return `${min}:${sec}`;
    },
  },

  actions: {
    setPlaylist(tracks) {
      const rawTracks = tracks?.tracks || tracks;
      this.playlist = Array.isArray(rawTracks) ? [...rawTracks] : [];
      this.originalPlaylist = [...this.playlist];
      this.shufflePlaylist = shuffleArray([...this.playlist]);
    },

    setCurrentTrack(track) {
      this.currentTrack = track;
      this.currentTrackIndex = this.activePlaylist.findIndex(
        (t) => t.id === track.id
      );
    },

    setAudioRef(ref) {
      this.audioRef = ref;
      if (ref) ref.volume = this.volume / 100;
    },
    updateCurrentTime(time, duration = null) {
      this.currentTime = time;
      if (duration !== null && duration !== undefined) {
        this.duration = duration;
      }
      this.progress = this.duration > 0 ? (time / this.duration) * 100 : 0;
    },

    toggleLoop() {
      this.isLoop = !this.isLoop;
    },

    toggleShuffle() {
      this.isShuffle = !this.isShuffle;

      if (this.isShuffle && this.shufflePlaylist.length === 0) {
        this.shufflePlaylist = shuffleArray([...this.playlist]);
      }
      this.syncCurrentTrackIndex();
    },

    syncCurrentTrackIndex() {
      if (this.activePlaylist.length === 0) {
        this.currentTrackIndex = -1;
        return;
      }
      this.currentTrackIndex = this.activePlaylist.findIndex(
        (t) => t.id === this.currentTrack?.id
      );
    },

    async playTrack(track) {
      if (!track?.track_file) return;
      this.setCurrentTrack(track);
      if (this.audioRef) {
        await this.loadCurrentTrack();
      }
    },

    async loadCurrentTrack() {
      const track = this.activePlaylist[this.currentTrackIndex];

      if (!track || !this.audioRef) return;

      if (this._onCanPlay) {
        this.audioRef.removeEventListener("canplay", this._onCanPlay);
        this._onCanPlay = null;
      }

      this.audioRef.pause();
      this.audioRef.src = "";
      this.audioRef.currentTime = 0;

      this.audioRef.src = track.track_file;
      this.audioRef.currentTime = 0;
      this.audioRef.volume = this.volume / 100;
      this.audioRef.load();

      this._onCanPlay = () => {
        this.audioRef.removeEventListener("canplay", this._onCanPlay);
        this._onCanPlay = null;
        this.audioRef
          .play()
          .then(() => {
            this.isPlaying = true;
          })
          .catch((err) => {
            this.isPlaying = false;
            console.error("[loadCurrentTrack] play() error:", err);
          });
      };
      this.audioRef.addEventListener("canplay", this._onCanPlay);
    },

    async nextTrack() {
      const playlist = this.activePlaylist;
      if (!playlist || playlist.length === 0) return;

      let newIndex = this.currentTrackIndex + 1;
      if (newIndex >= playlist.length) {
        if (this.isLoop) {
          newIndex = 0;
        } else {
          return;
        }
      }

      this.currentTrackIndex = newIndex;
      this.setCurrentTrack(playlist[newIndex]);
      await this.loadCurrentTrack();
    },

    async prevTrack() {
      const playlist = this.activePlaylist;
      if (!playlist || playlist.length === 0) return;

      let newIndex = this.currentTrackIndex - 1;
      if (newIndex < 0) {
        if (this.isLoop) {
          newIndex = playlist.length - 1;
        } else {
          return;
        }
      }

      this.currentTrackIndex = newIndex;
      this.setCurrentTrack(playlist[newIndex]);
      await this.loadCurrentTrack();
    },

    async resumeTrack() {
      if (this.audioRef) {
        if (this.audioRef.readyState < 3) {
          await new Promise((resolve) => {
            const handler = () => {
              this.audioRef.removeEventListener("canplay", handler);
              resolve();
            };
            this.audioRef.addEventListener("canplay", handler);
          });
        }
        try {
          await this.audioRef.play();
          this.isPlaying = true;
        } catch (err) {
          this.isPlaying = false;
          console.error("[resumeTrack] play error:", err);
        }
      }
    },

    seekTo(percent) {
      const duration = this.audioRef?.duration || 0;
      if (duration > 0) {
        const newTime = percent * duration;
        this.audioRef.currentTime = newTime;
        this.setCurrentTime(newTime);
      }
    },

    toggleLikeTrack(trackId) {
      const tracksStore = useTracksStore();
      if (tracksStore.likedTracks.has(trackId)) {
        tracksStore.likedTracks.delete(trackId);
      } else {
        tracksStore.likedTracks.add(trackId);
      }
    },

    pauseTrack() {
      if (this.audioRef) {
        this.audioRef.pause();
        this.isPlaying = false;
      }
    },

    setProgress(value) {
      this.progress = value;
    },

    setVolume(volume) {
      this.volume = volume;
      if (this.audioRef) {
        this.audioRef.volume = volume / 100;
      }
    },

    setPlaying(isPlaying) {
      this.isPlaying = isPlaying;
    },

    setCurrentTime(time) {
      this.currentTime = time;
    },

    onTrackEnd() {
      if (this.isLoop) {
        if (this.audioRef) {
          this.audioRef.currentTime = 0;
          this.audioRef.play();
        }
      } else {
        this.nextTrack();
      }
    },
  },
});
