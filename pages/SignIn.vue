<template>
  <SignInComponent :isSignUp="false" />
</template>

<script setup>
import SignInComponent from "~/components/SignInComponent.vue";
</script>

<script>
export default {
  layout: "auth",
};
</script>
