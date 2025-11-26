<template>
  <SignInComponent :isSignUp="true" />
</template>

<script setup>
import SignInComponent from "~/components/SignInComponent.vue";
</script>

<script>
export default {
  layout: "auth",
};
</script>
