<template>
  <div class="content-wrapper">
    <h2 class="centerblock__h2">{{ playlistTitle }}</h2>
    <div v-if="error" class="error">Ошибка: {{ error }}</div>
    <PlaylistComponent
      :tracks="filteredTracks"
      :pending="pending"
      :error="error"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useHead } from "@unhead/vue";
import { useTracksStore } from "~/stores/useTracks";

const route = useRoute();
const tracksStore = useTracksStore();
const { rawTracks, pending, error } = storeToRefs(tracksStore);

const playlistMap = {
  day: "Плейлист дня",
  dance: "100 танцевальных хитов",
  indie: "Инди-заряд",
};

const playlistFilterRules = {
  day: (_track) => true,
  dance: (track) => {
    const danceGenres = ["электронная музыка", "рок музыка"];
    return track.genre.some((g) => danceGenres.includes(g.toLowerCase()));
  },
  indie: (track) => {
    const indieGenres = ["классическая музыка"];
    return track.genre.some((g) => indieGenres.includes(g.toLowerCase()));
  },
};

const playlistTitle = computed(
  () => playlistMap[route.params.id] || "Все треки"
);

watch(
  playlistTitle,
  (newTitle) => {
    useHead({
      title: `${newTitle || "Skypro.Music"} | Skypro.Music`,
    });
  },
  { immediate: true }
);

onMounted(() => {
  if (!rawTracks.value.length) {
    tracksStore.fetchTracks();
  }
});

const filteredTracks = computed(() => {
  const id = route.params.id;
  if (!id) return rawTracks.value;
  const rule = playlistFilterRules[id];
  if (!rule) return [];
  return rawTracks.value.filter(rule);
});
</script>
