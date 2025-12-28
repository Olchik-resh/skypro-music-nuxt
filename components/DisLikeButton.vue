<template>
  <div class="like-container">
    <button
      class="like-button"
      :class="{ 'is-liked': computedIsLiked, 'in-favorites': isFavoritePage }"
      @click="handleLikeClick"
      :disabled="isLoading"
    >
      <svg class="icon-like">
        <use xlink:href="/img/sprite.svg#icon-like"></use>
      </svg>
    </button>
    <div v-if="error" class="error-tooltip">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useTracksStore } from "@/stores/useTracks";

const props = defineProps({
  track: {
    type: Object,
    required: true,
    validator: (t) => !!t.id && Array.isArray(t.staredUsers),
  },
  showCount: Boolean,
  isFavoritePage: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const emit = defineEmits(["toggle-favorite"]);
const tracksStore = useTracksStore();
const error = ref(null);
const isLoading = ref(false);

const computedIsLiked = computed(() =>
  tracksStore.likedTracks.has(props.track.id)
);

const handleLikeClick = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    await tracksStore.toggleFavorite(props.track.id, props.isFavoritePage);

    emit("toggle-favorite", props.track.id, props.isFavoritePage);
  } catch (err) {
    error.value = "Ошибка при обновлении лайка";
    console.error("Ошибка обработки лайка:", err);
  } finally {
    isLoading.value = false;
    if (error.value) {
      setTimeout(() => (error.value = null), 2000);
    }
  }
};
</script>

<style lang="scss">
.like-container {
  --icon-size: 18px;
  --icon-color: #696969;
  --active-color: #ad61ff;
  &.small {
    --icon-size: 14px;
  }
  &.medium {
    --icon-size: 18px;
  }
  &.large {
    --icon-size: 22px;
  }
}
.like-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:hover:not(.is-liked):not(:disabled) {
    opacity: 0.8;
  }
  &.is-liked .icon-like {
    stroke: var(--active-color);
  }
}
.icon-like {
  width: 14px;
  height: 12px;
  fill: transparent;
  stroke: var(--icon-color);
  transition: all 0.2s ease;
}
.error-tooltip {
  position: absolute;
  background: #ff4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 5px;
}
</style>
