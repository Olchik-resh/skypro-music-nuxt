<template>
  <div class="filter-container">
    <span class="filter-label">Искать по:</span>

    <div class="filter-group">
      <div class="filter-header">
        <button
          class="filter-button"
          :class="{ active: activeDropdown === 'authors' }"
          @click="toggleDropdown('authors')"
        >
          Исполнителю
          <span v-if="selectedAuthors.length" class="filter-indicator">
            {{ selectedAuthors.length }}
          </span>
        </button>
      </div>
      <transition name="dropdown" class="dropdown-authors">
        <div v-if="activeDropdown === 'authors'" class="dropdown-menu">
          <div class="dropdown-scroll">
            <ul class="filter-list">
              <li
                v-for="author in availableAuthors"
                :key="author"
                class="filter-item"
                :class="{ selected: selectedAuthors.includes(author) }"
                @click="handleAuthorSelect(author)"
              >
                <span
                  :class="{ visible: selectedAuthors.includes(author) }"
                ></span>
                {{ author }}
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>

    <div class="filter-group">
      <div class="filter-header">
        <button
          class="filter-button"
          :class="{ active: activeDropdown === 'years' }"
          @click="toggleDropdown('years')"
        >
          Году
          <span v-if="selectedYears.length" class="filter-indicator">
            {{ selectedYears.length }}
          </span>
        </button>
      </div>
      <transition name="dropdown" class="dropdown-years">
        <div v-if="activeDropdown === 'years'" class="dropdown-menu">
          <div class="dropdown-scroll">
            <ul class="filter-list">
              <li
                v-for="year in availableYears"
                :key="year"
                class="filter-item"
                :class="{ selected: selectedYears.includes(year) }"
                @click="handleYearSelect(year)"
              >
                <span :class="{ visible: selectedYears.includes(year) }"></span>
                {{ year }}
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>

    <div class="filter-group">
      <div class="filter-header">
        <button
          class="filter-button"
          :class="{ active: activeDropdown === 'genres' }"
          @click="toggleDropdown('genres')"
        >
          Жанру
          <span v-if="selectedGenres.length" class="filter-indicator">
            {{ selectedGenres.length }}
          </span>
        </button>
      </div>
      <transition name="dropdown" class="dropdown-genres">
        <div v-if="activeDropdown === 'genres'" class="dropdown-menu">
          <div class="dropdown-scroll">
            <ul class="filter-list">
              <li
                v-for="genre in availableGenres"
                :key="genre"
                class="filter-item"
                :class="{ selected: selectedGenres.includes(genre) }"
                @click="handleGenreSelect(genre)"
              >
                <span
                  :class="{ visible: selectedGenres.includes(genre) }"
                ></span>
                {{ genre }}
              </li>
            </ul>
          </div>
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

const availableAuthors = computed(() => tracksStore.availableFilters.authors);
const availableYears = computed(() => tracksStore.availableFilters.years);
const availableGenres = computed(() => tracksStore.availableFilters.genres);

const selectedAuthors = computed(() => tracksStore.filters.authors);
const selectedYears = computed(() => tracksStore.filters.years);
const selectedGenres = computed(() => tracksStore.filters.genres);

const toggleDropdown = (type) => {
  activeDropdown.value = activeDropdown.value === type ? null : type;
};

const toggleFilter = (type, value) => {
  const currentValues = [...tracksStore.filters[type]];
  const newValues = currentValues.includes(value)
    ? currentValues.filter((v) => v !== value)
    : [...currentValues, value];

  tracksStore.updateFilter({ [type]: newValues });
};

const handleAuthorSelect = (author) => toggleFilter("authors", author);
const handleYearSelect = (year) => toggleFilter("years", year);
const handleGenreSelect = (genre) => toggleFilter("genres", genre);
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
  margin-right: 3px;
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
.dropdown-authors {
  width: 248px;
  height: 305px;
}
.dropdown-years {
  width: 248px;
  height: 305px;
}
.dropdown-genres {
  width: 248px;
  height: 305px;
}

.dropdown-scroll {
  max-height: 237px;
  overflow-y: auto;
}

/* Скрыть стрелки скроллбара (Chrome, Edge, Safari) */
.dropdown-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.dropdown-scroll::-webkit-scrollbar-button:single-button {
  display: none;
  height: 0;
  width: 0;
}

.dropdown-scroll::-webkit-scrollbar-button:vertical:decrement,
.dropdown-scroll::-webkit-scrollbar-button:vertical:increment {
  display: none;
  height: 0;
  width: 0;
}

/* Ширина скроллбара */
.dropdown-scroll::-webkit-scrollbar {
  width: 4px;
  background: #4b4949;
  border-radius: 10px;
}

/* Цвет и скругление ползунка */
.dropdown-scroll::-webkit-scrollbar-thumb {
  background: #ffffff;
  border-radius: 10px;
}

/* Для Firefox */
.dropdown-scroll {
  scrollbar-width: thin;
  scrollbar-color: #ffffff #4b4949;
}
.dropdown-menu {
  min-width: 180px;
  padding: 34px;
  padding-right: 34px;
  background: rgba(49, 49, 49, 1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  margin-top: 8px;
  z-index: 20;
  position: absolute;
}

.filter-list {
  list-style: none;
  margin: 0;
}

.filter-item {
  padding-bottom: 28px;
  font-size: 20px;
  font-weight: 400;
  color: rgba(255, 255, 255, 1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.filter-item.selected {
  color: #ad61ff;
  text-decoration: underline;
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
