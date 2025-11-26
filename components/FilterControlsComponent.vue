<template>
  <div class="filter-container">
    <span class="filter-label">Искать по:</span>

    <!-- Фильтр по исполнителю -->
    <div class="filter-group">
      <button
        class="filter-button"
        :class="{ active: activeDropdown === 'author' }"
        @click="toggleDropdown('author')"
      >
        Исполнителю
        <span v-if="selectedAuthors.length" class="filter-indicator">{{
          selectedAuthors.length
        }}</span>
      </button>
      <transition name="dropdown">
        <div v-if="activeDropdown === 'author'" class="dropdown-menu">
          <ul class="filter-list">
            <li
              v-for="author in authors"
              :key="author"
              class="filter-item"
              :class="{ selected: selectedAuthors.includes(author) }"
              @click="toggleFilterValue('author', author)"
            >
              {{ author }}
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <!-- Фильтр по году -->
    <div class="filter-group">
      <button
        class="filter-button"
        :class="{ active: activeDropdown === 'year' }"
        @click="toggleDropdown('year')"
      >
        Году
        <span v-if="selectedYears.length" class="filter-indicator">{{
          selectedYears.length
        }}</span>
      </button>
      <transition name="dropdown">
        <div v-if="activeDropdown === 'year'" class="dropdown-menu">
          <ul class="filter-list">
            <li
              v-for="year in years"
              :key="year"
              class="filter-item"
              :class="{ selected: selectedYears.includes(year) }"
              @click="toggleFilterValue('year', year)"
            >
              {{ year }}
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <!-- Фильтр по жанру -->
    <div class="filter-group">
      <button
        class="filter-button"
        :class="{ active: activeDropdown === 'genre' }"
        @click="toggleDropdown('genre')"
      >
        Жанру
        <span v-if="selectedGenres.length" class="filter-indicator">{{
          selectedGenres.length
        }}</span>
      </button>
      <transition name="dropdown">
        <div v-if="activeDropdown === 'genre'" class="dropdown-menu">
          <ul class="filter-list">
            <li
              v-for="genre in genres"
              :key="genre"
              class="filter-item"
              :class="{ selected: selectedGenres.includes(genre) }"
              @click="toggleFilterValue('genre', genre)"
            >
              {{ genre }}
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useTracksStore } from "~/stores/useTracks";

const tracksStore = useTracksStore();
const activeDropdown = ref(null);

const authors = computed(() =>
  [...new Set(tracksStore.rawTracks.map((t) => t.author))].sort()
);
const years = computed(() =>
  [...new Set(tracksStore.rawTracks.map((t) => t.release_date))].sort(
    (a, b) => b - a
  )
);
const genres = computed(() =>
  [...new Set(tracksStore.rawTracks.flatMap((t) => t.genre))].sort()
);

const selectedAuthors = computed(() => tracksStore.filters.author || []);
const selectedYears = computed(() => tracksStore.filters.year || []);
const selectedGenres = computed(() => tracksStore.filters.genre || []);

const toggleDropdown = (type) => {
  activeDropdown.value = activeDropdown.value === type ? null : type;
};

function toggleFilterValue(type, value) {
  const arr = Array.isArray(tracksStore.filters[type])
    ? [...tracksStore.filters[type]]
    : [];
  const idx = arr.indexOf(value);
  if (idx > -1) arr.splice(idx, 1);
  else arr.push(value);

  tracksStore.updateFilter({ [type]: arr });
}
</script>

<style lang="css">
.filter-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  position: relative;
  padding-bottom: 51px;
}

.filter-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 1);
  margin-right: 8px;
}

.filter-group {
  position: relative;
}

.filter-button {
  font: 400 16px/24px sans-serif;
  border: 1px solid #fff;
  position: relative;
  border-radius: 60px;
  padding: 6px 20px;
  cursor: pointer;
  transition: all 0.3s;
  background: #181818;
  color: #ffffff;

  &.active {
    color: #ad61ff;
    border-color: #ad61ff;
  }
}

.filter-indicator {
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

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: #333333;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 180px;
  max-height: 240px;

  overflow-y: auto;
}

.filter-list {
  list-style: none;
  padding: 6px 0;
  margin: 0;
}

.filter-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #d0d0d0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.filter-item.selected {
  color: #ad61ff;
  text-decoration: underline;
}

.selection-dot {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
