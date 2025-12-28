<template>
  <div v-if="playerStore.currentTrack" class="bar">
    <div class="bar__content">
      <div class="bar__player-progress" @click="handleProgressClick">
        <div
          class="progress-indicator"
          :style="{ width: progress + '%' }"
        ></div>
      </div>

      <div class="bar__player-block">
        <div class="bar__player player">
          <div class="player__controls">
            <button
              class="player__btn-prev _btn"
              :disabled="!hasPrevTrack"
              @click="handlePrevTrack"
            >
              <svg class="player__btn-prev-svg">
                <use xlink:href="/img/sprite.svg#icon-prev"></use>
              </svg>
            </button>
            <button
              class="player__btn-play _btn"
              :class="{ 'is-playing': playerStore.isPlaying }"
              @click="handlePlay"
            >
              <svg class="player__btn-play-svg">
                <use
                  :xlink:href="
                    playerStore.isPlaying
                      ? '/img/sprite.svg#icon-pause'
                      : '/img/sprite.svg#icon-play'
                  "
                ></use>
              </svg>
            </button>
            <button
              class="player__btn-next _btn"
              :disabled="!hasNextTrack"
              @click="handleNextTrack"
            >
              <svg class="player__btn-next-svg">
                <use xlink:href="/img/sprite.svg#icon-next"></use>
              </svg>
            </button>
            <button
              class="player__btn-repeat _btn-icon"
              :class="{ 'is-active': playerStore.isLoop }"
              @click="playerStore.toggleLoop"
            >
              <svg class="player__btn-repeat-svg">
                <use xlink:href="/img/sprite.svg#icon-repeat"></use>
              </svg>
            </button>
            <button
              class="player__btn-shuffle _btn-icon"
              :class="{ 'is-active': playerStore.isShuffle }"
              @click="playerStore.toggleShuffle"
            >
              <svg class="player__btn-shuffle-svg">
                <use xlink:href="/img/sprite.svg#icon-shuffle"></use>
              </svg>
            </button>
          </div>
          <div class="player__track-play track-play">
            <div class="track-play__contain">
              <div class="track-play__image">
                <svg class="track-play__svg">
                  <use xlink:href="/img/sprite.svg#icon-note"></use>
                </svg>
              </div>
              <div class="track-play__author">
                <a class="track-play__author-link" href="#">{{
                  playerStore.currentTrack?.author || "Выберите трек"
                }}</a>
              </div>
              <div class="track-play__album">
                <a class="track-play__album-link" href="#">{{
                  playerStore.currentTrack?.album || ""
                }}</a>
              </div>
            </div>
            <div class="track-play__like-dis">
              <DisLikeButton
                v-if="playerStore.currentTrack"
                :track="playerStore.currentTrack"
                :isFavoritePage="false"
              />
            </div>
          </div>
        </div>
        <div class="bar__volume-block volume">
          <div class="volume__content">
            <div class="volume__image">
              <svg class="volume__svg">
                <use xlink:href="/img/sprite.svg#icon-volume"></use>
              </svg>
            </div>
            <div class="volume__progress _btn">
              <input
                v-model="volume"
                class="volume__progress-line _btn"
                type="range"
                name="range"
                min="0"
                max="100"
                @input="setVolume"
                :style="volumeProgressStyle"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <audio
      ref="audio"
      @timeupdate="handleTimeUpdate"
      @ended="playerStore.onTrackEnd"
      @loadedmetadata="handleLoadedMetadata"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { usePlayerStore } from "@/stores/player";
import DisLikeButton from "./DisLikeButton.vue";

const playerStore = usePlayerStore();

const audio = ref(null);
const volume = ref(playerStore.volume ?? 50);
const shouldAutoPlay = ref(false);

const progress = computed(() => playerStore.progressPercent);
const hasNextTrack = computed(() => playerStore.hasNextTrack);
const hasPrevTrack = computed(() => playerStore.hasPrevTrack);

function setVolume() {
  playerStore.setVolume(volume.value);
  if (audio.value) audio.value.volume = volume.value / 100;
}

const volumeProgressStyle = computed(() => {
  const percent = volume.value;
  return {
    background: `linear-gradient(to right, #fff 0%, #fff ${percent}%, #797979 ${percent}%, #797979 100%)`,
  };
});

function handlePlay() {
  if (!playerStore.currentTrack) return;
  if (playerStore.isPlaying) {
    playerStore.pauseTrack();
  } else {
    if (!audio.value || audio.value.readyState < 1) {
      shouldAutoPlay.value = true;
    } else {
      playerStore.resumeTrack();
    }
  }
}

function handleNextTrack() {
  playerStore.nextTrack();
}
function handlePrevTrack() {
  playerStore.prevTrack();
}

function handleTimeUpdate() {
  if (!audio.value) return;
  playerStore.updateCurrentTime(audio.value.currentTime, audio.value.duration);
}

function handleProgressClick(e) {
  if (!audio.value || !audio.value.duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  playerStore.seekTo(percent);
}

onMounted(() => {
  playerStore.setAudioRef(audio.value);
  setVolume();
});

watch(audio, (val) => {
  if (val) {
    playerStore.setAudioRef(val);
    setVolume();
  }
});

watch(
  () => playerStore.volume,
  (val) => {
    volume.value = val;
    if (audio.value) audio.value.volume = val / 100;
  }
);

function handleLoadedMetadata() {
  if (shouldAutoPlay.value && audio.value) {
    audio.value.play();
    shouldAutoPlay.value = false;
  }
  playerStore.updateCurrentTime(audio.value.currentTime, audio.value.duration);
}
</script>

<style lang="scss" scoped>
.bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(28, 28, 28, 0.5);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.bar__content {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
}

.bar__player-progress {
  position: relative;
  width: 100%;
  height: 5px;
  background: #2e2e2e;
  cursor: pointer;

  .progress-indicator {
    position: absolute;
    height: 100%;
    background: #b672ff;
    transition: width 0.2s ease;
  }
}

.bar__player-block {
  height: 73px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
}

.bar__player {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: start;
  -ms-flex-pack: start;
  justify-content: flex-start;
}

.bar__volume-block {
  width: auto;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  padding: 0 92px 0 0;
}

.player__controls {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  padding: 0 27px 0 31px;
}

.player__btn-prev,
.player__btn-play,
.player__btn-next,
.player__btn-repeat,
.player__btn-shuffle {
  padding: 5px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  background-color: none;
}

.player__btn-prev {
  margin-right: 23px;
}

.player__btn-prev-svg {
  width: 15px;
  height: 14px;
}

.player__btn-play {
  margin-right: 23px;
}

.player__btn-play-svg {
  width: 22px;
  height: 20px;
  fill: #d9d9d9;
}

.player__btn-next {
  margin-right: 28px;
  fill: #a53939;
}

.player__btn-next-svg {
  width: 15px;
  height: 14px;
  fill: inherit;
  stroke: #d9d9d9;
}

.player__btn-repeat {
  margin-right: 24px;

  // Иконка повтора
  &-svg {
    width: 18px;
    height: 12px;
    fill: transparent;
    stroke: #696969;
    transition: inherit; // Наследуем анимацию

    // Активное состояние
    .is-active & {
      stroke: #ad61ff;
      fill: #ad61ff;
    }
  }
}

.player__btn-shuffle {
  // Иконка перемешивания
  &-svg {
    width: 19px;
    height: 12px;
    fill: transparent;
    stroke: #696969;
    transition: inherit; // Наследуем анимацию

    // Активное состояние
    .is-active & {
      stroke: #ad61ff;
      fill: #ad61ff;
    }
  }
}

// Общие стили для активных состояний
.is-active {
  svg {
    filter: drop-shadow(0 0 2px rgba(173, 97, 255, 0.4));
  }

  &:hover {
    transform: scale(1.05);
  }
}

.player__track-play {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
}

.track-play__contain {
  width: auto;
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: auto 1fr;
  grid-template-columns: auto 1fr;
  grid-template-areas: "image author" "image album";
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.track-play__image {
  width: 51px;
  height: 51px;
  background-color: #313131;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  margin-right: 12px;
  grid-row: 1;
  -ms-grid-row-span: 2;
  grid-column: 1;
  grid-area: image;
}

.track-play__svg {
  width: 18px;
  height: 17px;
  fill: transparent;
  stroke: #4e4e4e;
}

.track-play__author {
  grid-row: 1;
  grid-column: 2;
  grid-area: author;
  min-width: 49px;
}

.track-play__author-link {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #ffffff;
  white-space: nowrap;
}

.track-play__album {
  grid-row: 2;
  grid-column: 2;
  grid-area: album;
  min-width: 49px;
}

.track-play__album-link {
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 24px;
  color: #ffffff;
}

.track-play__like-dis {
  display: flex;
  padding-left: 31px;
  align-items: center;
}

.track-play__like-svg {
  width: 14px;
  height: 12px;
  fill: transparent;
  stroke: #696969;
}

.track-play__dislike {
  margin-left: 28.5px;
}

.track-play__dislike-svg {
  width: 14.34px;
  height: 13px;
  fill: transparent;
  stroke: #696969;
}

.volume__content {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: end;
  -ms-flex-pack: end;
  justify-content: end;
}

.volume__image {
  width: 13px;
  height: 18px;
  margin-right: 17px;
}

.volume__svg {
  width: 13px;
  height: 13px;
  fill: transparent;
}

.volume__progress {
  width: 109px;
  display: flex;
}

.volume__progress-line {
  width: 109px;
  height: 1px;
  background: transparent;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  overflow: hidden;
  cursor: pointer;
  margin: 0;
  padding: 0;
}

/* Chrome, Safari */
.volume__progress-line::-webkit-slider-runnable-track {
  height: 6px;
  background: #797979;
  border-radius: 3px;
}
.volume__progress-line::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  border: none;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  margin-top: -4px; /* чтобы круг был по центру */
  position: relative;
  z-index: 2;
}

/* Заполненная белая часть */
.volume__progress-line::-webkit-slider-runnable-track {
  background: linear-gradient(
    to right,
    #fff 0%,
    #fff calc(var(--val, 50%) * 1%),
    #797979 calc(var(--val, 50%) * 1%),
    #797979 100%
  );
}
/* Для плавности */
.volume__progress-line {
  transition: background 0.2s;
}

/* Firefox */
.volume__progress-line::-moz-range-track {
  height: 6px;
  background: #797979;
  border-radius: 3px;
}
.volume__progress-line::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  border: none;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.volume__progress-line::-moz-range-progress {
  background: #fff;
  height: 6px;
  border-radius: 3px;
}

/* IE */
.volume__progress-line::-ms-fill-lower {
  background: #fff;
  border-radius: 3px;
}
.volume__progress-line::-ms-fill-upper {
  background: #797979;
  border-radius: 3px;
}
.volume__progress-line::-ms-thumb {
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  border: none;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
}
.volume__progress-line {
  background: transparent;
}

/* Убираем лишний фокус и стили */
.volume__progress-line:focus {
  outline: none;
}

/* Для Firefox */
.volume__progress-line::-moz-focus-outer {
  border: 0;
}
</style>
