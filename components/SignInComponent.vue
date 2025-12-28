<template>
  <div class="auth-wrapper">
    <div class="container-signup">
      <div class="modal__block">
        <form class="modal__form-login" @submit.prevent="handleSubmit">
          <NuxtLink to="/">
            <div class="modal__logo">
              <NuxtImg
                src="/img/logo_modal.png"
                alt="logo"
                loading="eager"
                format="png"
                quality="100"
              />
            </div>
          </NuxtLink>

          <div v-if="userStore.error" class="error-message">
            {{ userStore.error }}
          </div>

          <input
            v-model.trim="email"
            class="modal__input"
            type="email"
            placeholder="Почта"
            autocomplete="email"
            @input="userStore.error = null"
          />

          <input
            v-model.trim="password"
            class="modal__input"
            type="password"
            placeholder="Пароль"
            autocomplete="current-password"
            @input="userStore.error = null"
          />

          <input
            v-if="isSignUp"
            v-model.trim="confirmPassword"
            class="modal__input"
            type="password"
            placeholder="Повторите пароль"
            @input="userStore.error = null"
          />

          <button
            class="modal__btn-submit"
            type="submit"
            :disabled="userStore.loading"
          >
            <span v-if="!userStore.loading">
              {{ isSignUp ? "Зарегистрироваться" : "Войти" }}
            </span>
            <span v-else>Обработка...</span>
          </button>

          <button
            v-if="!isSignUp"
            class="modal__btn-switch"
            type="button"
            @click="$router.push('/signup')"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isSignUp = computed(() => route.path.includes("signup"));
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const handleSubmit = async () => {
  try {
    userStore.error = null;

    if (!email.value || !password.value) {
      userStore.error = "Заполните все обязательные поля";
      return;
    }

    if (isSignUp.value) {
      if (password.value !== confirmPassword.value) {
        userStore.error = "Пароли не совпадают";
        return;
      }

      if (!validateEmail(email.value)) {
        userStore.error = "Введите корректный email";
        return;
      }

      await userStore.setUser({
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
        username: email.value.split("@")[0],
      });
    } else {
      if (!validateEmail(email.value)) {
        userStore.error = "Введите корректный email";
        return;
      }

      await userStore.setUser({
        email: email.value,
        password: password.value,
      });
    }

    router.push("/");
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
};

onMounted(() => {
  if (userStore.isAuth) {
    userStore.clearUser();
  }
});
</script>

<style lang="css">
.auth-wrapper {
  min-height: 100vh;
  background: rgba(49, 49, 49, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal__block {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 366px;
  padding: 40px;
}

.modal__form-login {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal__input {
  width: 100%;
  padding: 8px 16px;
  border: none;
  border-bottom: 1px solid rgba(208, 206, 206, 1);
  font-size: 16px;
  color: #333;
  background-color: transparent;

  &:focus {
    outline: none;
  }
}

.modal__btn-submit {
  width: 100%;
  margin-top: 40px;
  padding: 14px;
  background-color: rgba(88, 14, 162, 1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(63, 0, 125, 1);
  }
  &:active {
    background-color: rgba(39, 26, 88, 1);
  }
}

.modal__btn-switch {
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 1);
  border: 1px solid #d0cece;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(244, 245, 246, 1);
    border-color: 1px solid rgba(208, 206, 206, 1);
  }
  &:active {
    background-color: rgba(217, 217, 217, 1);
    border-color: 1px solid rgba(208, 206, 206, 1);
  }
}

.modal__logo {
  text-align: center;
  margin-bottom: 23px;

  img {
    width: 140px;
    height: 21px;
  }
}

.error-message {
  color: #ff4d4d;
  background: #ffe6e6;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #ffcccc;
  font-size: 14px;
}
</style>
