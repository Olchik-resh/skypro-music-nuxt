<template>
  <div>
    <NuxtLayout name="default">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/useUser";

const userStore = useUserStore();
onMounted(() => {
  userStore.restoreUser();
});
</script>
