<template>
  <div class="centerblock__filter filter">
    <div class="filter__title">Искать по:</div>

    <!-- Фильтр по исполнителю -->
    <div class="filter-wrapper">
      <div
        class="filter__button"
        :class="{ active: activeFilter === 'author' }"
        @click="toggleFilter('author')"
        style="position: relative"
      >
        исполнителю
        <span v-if="filters.author.length" class="filter__badge">
          {{ filters.author.length }}
        </span>
      </div>
      <transition name="fade">
        <div
          v-if="activeFilter === 'author'"
          class="filter__dropdown filter__dropdown_author"
        >
          <ul class="filter__list">
            <li
              v-for="item in authorItems"
              :key="item"
              class="filter__item"
              :class="{ selected: filters.author.includes(item) }"
              @click="selectAuthor(item)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <!-- Фильтр по году -->
    <div class="filter-wrapper">
      <div
        class="filter__button"
        :class="{ active: activeFilter === 'year' }"
        @click="toggleFilter('year')"
        style="position: relative"
      >
        году выпуска
        <span v-if="filters.year.length" class="filter__badge">
          {{ filters.year.length }}
        </span>
      </div>
      <transition name="fade">
        <div
          v-if="activeFilter === 'year'"
          class="filter__dropdown filter__dropdown_year"
        >
          <ul class="filter__list">
            <li
              v-for="item in yearItems"
              :key="item"
              class="filter__item"
              :class="{ selected: filters.year.includes(item) }"
              @click="selectYear(item)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <!-- Фильтр по жанру -->
    <div class="filter-wrapper">
      <div
        class="filter__button"
        :class="{ active: activeFilter === 'genre' }"
        @click="toggleFilter('genre')"
        style="position: relative"
      >
        жанру
        <span v-if="filters.genre.length" class="filter__badge">
          {{ filters.genre.length }}
        </span>
      </div>
      <transition name="fade">
        <div
          v-if="activeFilter === 'genre'"
          class="filter__dropdown filter__dropdown_genre"
        >
          <ul class="filter__list">
            <li
              v-for="item in genreItems"
              :key="item"
              class="filter__item"
              :class="{ selected: filters.genre.includes(item) }"
              @click="selectGenre(item)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
const props = defineProps({ tracks: { type: Array, default: () => [] } });
const emit = defineEmits(["update:filter"]);

const activeFilter = ref(null);
// Массивы для мультивыбора!
const filters = ref({ author: [], year: [], genre: [] });

const toggleFilter = (filter) => {
  activeFilter.value = activeFilter.value === filter ? null : filter;
};

// Универсальная функция для многократного выбора:
function toggleSelect(arr, value) {
  const idx = arr.indexOf(value);
  if (idx > -1) arr.splice(idx, 1);
  else arr.push(value);
}

function selectAuthor(author) {
  toggleSelect(filters.value.author, author);
  emitFilters();
}
function selectYear(year) {
  toggleSelect(filters.value.year, year);
  emitFilters();
}
function selectGenre(genre) {
  toggleSelect(filters.value.genre, genre);
  emitFilters();
}

function emitFilters() {
  // Передаем массивы выбранных
  emit("update:filter", { ...filters.value });
}

function sortItems(items, unknownLabel = "Неизвестно", numeric = false) {
  const filtered = items.filter((item) => item !== unknownLabel);
  filtered.sort(numeric ? (a, b) => a - b : undefined);
  if (items.includes(unknownLabel)) filtered.push(unknownLabel);
  return filtered;
}

const authorItems = computed(() => {
  if (!props.tracks?.length) return [];
  const items = new Set();
  props.tracks.forEach((track) => {
    if (track.author) items.add(track.author);
  });
  return sortItems(Array.from(items), "Неизвестно");
});

const yearItems = computed(() => {
  if (!props.tracks?.length) return [];
  const items = new Set();
  props.tracks.forEach((track) => {
    const year = track.release_date?.split("-")[0];
    if (year) {
      items.add(year);
    } else {
      items.add("Неизвестно");
    }
  });
  return sortItems(Array.from(items), "Неизвестно", true);
});

const genreItems = computed(() => {
  if (!props.tracks?.length) return [];
  const items = new Set();
  props.tracks.forEach((track) => {
    if (track.genre) {
      const genres = Array.isArray(track.genre) ? track.genre : [track.genre];
      genres.forEach((g) => {
        if (g && g.trim()) {
          items.add(g.trim());
        }
      });
    } else {
      items.add("неизвестно");
    }
  });
  return sortItems(Array.from(items), "неизвестно");
});
</script>

<style lang="css" scoped>
.centerblock__filter {
  display: flex;

  align-items: center;
  margin-bottom: 51px;
  position: relative;
}

.filter__title {
  font: 400 16px/24px sans-serif;

  margin-right: 15px;
}

.filter-wrapper {
  position: relative;
  margin-right: 10px;
}

.filter__button {
  font: 400 16px/24px sans-serif;
  border: 1px solid #fff;
  position: relative;
  border-radius: 60px;
  padding: 6px 20px;
  cursor: pointer;
  transition: all 0.3s;

  &.active {
    background: rgba(255, 255, 255, 0.15);
    border-color: #ad61ff;
  }
}

.filter__dropdown {
  box-sizing: border-box;
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  z-index: 1000;
  background: #313131;
  border-radius: 12px;
  padding: 34px;
  max-height: 305px;
  scrollbar-width: thin; /* 'auto', 'thin', или 'none' */
  scrollbar-color: #666 #222;
  overflow-y: auto;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);

  .filter__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .filter__list::-webkit-scrollbar {
    width: 8px; /* ширина скроллбара */
    background: #232323; /* фон дорожки */
    border-radius: 8px;
    margin-right: 8px;
  }

  .filter__list::-webkit-scrollbar-thumb {
    background: #666; /* цвет ползунка */
    border-radius: 8px; /* скругление углов */
    border: 2px solid #313131; /* обводка вокруг ползунка */
  }

  .filter__list::-webkit-scrollbar-thumb:hover {
    background: #888; /* цвет при наведении */
  }

  .filter__dropdown_author {
    width: 248px;
    height: 305px;
  }

  .filter__dropdown_year {
    width: 221px;
    height: 196px;
  }

  .filter__dropdown_genre {
    width: 248px;
    height: 305px;
  }

  .filter__item {
    color: #fff;
    font-size: 14px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.filter__item.selected {
  color: rgba(182, 114, 255, 1);
  text-decoration-line: underline;
}

.filter__badge {
  position: absolute;
  top: 10%;
  right: -13px;
  transform: translateY(-50%);
  display: inline-block;
  width: 26px;
  height: 25.5px;
  background: #ad61ff;
  color: #ffffff;
  border-radius: 50%;
  text-align: center;
  font-size: 12px;
  line-height: 22px;
  pointer-events: none;
}
</style>
