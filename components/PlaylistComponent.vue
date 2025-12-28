<template>
  <div class="centerblock__content playlist-content">
    <div class="content__title playlist-title">
      <div class="playlist-title__col col01">Трек</div>
      <div class="playlist-title__col col02">Исполнитель</div>
      <div class="playlist-title__col col03">Альбом</div>
      <svg class="playlist-title__svg">
        <use xlink:href="/img/sprite.svg#icon-watch"></use>
      </svg>
    </div>

    <div class="playlist-scroll">
    
      <div v-if="activeFilters.length" class="active-filters">
        <div
          v-for="(filter, index) in activeFilters"
          :key="index"
          class="filter-tag"
        >
          {{ filter.label }}: {{ filter.value }}
          <button
            class="filter-tag-remove"
            @click="removeFilter(filter.type, filter.value)"
          >
            ×
          </button>
        </div>
        <button
          v-if="activeFilters.length > 1"
          class="clear-all-filters"
          @click="clearAllFilters"
        >
          Сбросить все
        </button>
      </div>

  
      <div v-if="hasSearchResults" class="search-status">
        Найдено треков: {{ filteredTracks.length }}
        <span v-if="tracksStore.searchQuery">
          по запросу "{{ tracksStore.searchQuery }}"
        </span>
      </div>

      <div class="content__playlist playlist">
        <TrackComponent
          v-for="track in filteredTracks"
          :key="track.id"
          :track="track"
          :playlist="{ id: playlistId, tracks: filteredTracks }"
          :is-favorite-page="isFavoritePage"
          @toggle-favorite="handleToggleFavorite"
          @play="handlePlayTrack"
        />
      </div>

      
      <div v-if="tracksStore.pending" class="loading">
        <div class="loading-spinner"></div>
        Загрузка треков...
      </div>


      <div v-if="tracksStore.error" class="error">
        ⚠️ Ошибка: {{ tracksStore.error }}
      </div>

  
      <div v-if="showEmptyState" class="empty-state">
        <template v-if="tracksStore.searchQuery">
          😔 По запросу "{{ tracksStore.searchQuery }}" ничего не найдено
        </template>
        <template v-else-if="hasActiveFilters">
          😔 Нет треков, соответствующих выбранным фильтрам
        </template>
        <template v-else> В этой категории пока нет треков </template>
        <button
          v-if="hasActiveFilters"
          class="retry-button"
          @click="clearAllFilters"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import TrackComponent from "./TrackComponent.vue";
import { usePlayerStore } from "@/stores/player";
import { useTracksStore } from "@/stores/useTracks";

const tracksStore = useTracksStore();
const playerStore = usePlayerStore();

const props = defineProps({
  isFavoritePage: {
    type: Boolean,
    default: false,
  },
});

const handlePlayTrack = (track) => {
  playerStore.playTrack(track);
};

const emit = defineEmits({
  "toggle-favorite": (id, isFavorite) =>
    typeof id === "number" && typeof isFavorite === "boolean",
});

const handleToggleFavorite = (trackId) => {
  emit("toggle-favorite", trackId, props.isFavoritePage);
};


const filteredTracks = toRef(tracksStore, "filteredTracks");

const playlistId = computed(() =>
  props.isFavoritePage ? "favorites" : "filtered"
);

const activeFilters = computed(() => {
  const filters = [];

  tracksStore.filters.authors.forEach((author) => {
    filters.push({
      type: "authors",
      label: "Исполнитель",
      value: author,
    });
  });

  tracksStore.filters.genres.forEach((genre) => {
    filters.push({
      type: "genres",
      label: "Жанр",
      value: genre,
    });
  });

  tracksStore.filters.years.forEach((year) => {
    filters.push({
      type: "years",
      label: "Год",
      value: year,
    });
  });

  if (tracksStore.searchQuery) {
    filters.push({
      type: "search",
      label: "Поиск",
      value: `"${tracksStore.searchQuery}"`,
    });
  }

  return filters;
});

const hasSearchResults = computed(
  () =>
    filteredTracks.value.length > 0 &&
    (tracksStore.searchQuery || tracksStore.filters.initialized)
);

const showEmptyState = computed(
  () =>
    !filteredTracks.value.length && !tracksStore.pending && !tracksStore.error
);

const hasActiveFilters = computed(
  () => activeFilters.value.length > 0 || tracksStore.filters.initialized
);



const removeFilter = (type, value) => {
  if (type === "search") {
    tracksStore.clearSearch();
  } else {
    const newValues = tracksStore.filters[type].filter((v) => v !== value);
    tracksStore.updateFilter({ [type]: newValues });
  }
};

const clearAllFilters = () => {
  tracksStore.resetFilters();
  tracksStore.clearSearch();
};


onMounted(() => {
  if (!props.isFavoritePage && !tracksStore.rawTracks.length) {
    tracksStore.fetchTracks();
  }
});
</script>

<style lang="scss">
$text-secondary: #696969;
$scrollbar-thumb: #4a4a4a;
$scrollbar-border: #181818;

.playlist-content {
  height: calc(100vh - 240px);
  display: flex;
  flex-direction: column;
  position: relative;

  .playlist-scroll {
    flex: 1;
    overflow-y: auto; 
    overflow-x: hidden;

   
    &::-webkit-scrollbar {
      width: 0px;
      height: 0px;
      background: transparent;
      display: none;
    }


    scrollbar-width: none;
    -ms-overflow-style: none;
  }
}

.content__playlist {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.playlist-title {
  &__col {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 2px;
    color: $text-secondary;
    text-transform: uppercase;
  }

  &__svg {
    width: 12px;
    height: 12px;
    stroke: $text-secondary;
  }
}

.col01 {
  width: 434px;
}
.col02 {
  width: 321px;
}
.col03 {
  width: 342px;
}
.col04 {
  width: 60px;
  text-align: end;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 1.2em;
}

.error {
  padding: 20px;
  color: #ff4444;
  background: #ffecec;
  border-radius: 8px;
  margin: 20px;
  text-align: center;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: $text-secondary;
}

.search-status {
  padding: 10px 0;
  color: $text-secondary;
  font-size: 0.9em;
  border-bottom: 1px solid rgba($text-secondary, 0.2);
  margin-bottom: 15px;
}

.active-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid #404040;
}

.filter-tag {
  background: #3a1a4f;
  border-radius: 16px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #d8a4ff;
}

.filter-tag-remove {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  font-size: 16px;
  line-height: 1;
  transition: opacity 0.2s;
}

.filter-tag-remove:hover {
  opacity: 0.8;
}

.clear-all-filters {
  background: none;
  border: 1px solid #ad61ff;
  border-radius: 16px;
  padding: 6px 12px;
  color: #ad61ff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.clear-all-filters:hover {
  background: rgba(173, 97, 255, 0.1);
}

.search-status {
  padding: 12px 0;
  color: #a0a0a0;
  font-size: 14px;
}

.loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #a0a0a0;
  justify-content: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #a0a0a0;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  color: #ff4d4d;
  padding: 20px;
  text-align: center;
  background: rgba(255, 77, 77, 0.1);
  border-radius: 8px;
  margin: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #a0a0a0;
  font-size: 16px;
}

.retry-button {
  display: block;
  margin: 12px auto 0;
  background: none;
  border: 1px solid #ad61ff;
  color: #ad61ff;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: rgba(173, 97, 255, 0.1);
}
</style>
