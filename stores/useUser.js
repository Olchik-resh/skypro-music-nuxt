import { defineStore } from "pinia";

function parseIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch {
    return null;
  }
}

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuth: false,
    loading: false,
    hydrated: false,
    error: null,
  }),

  actions: {
    async setUser(credentials) {
      const tracksStore = useTracksStore();

      try {
        this.loading = true;
        let authResponse, tokenResponse;

        if (credentials.username) {
          authResponse = await this.fetchApi(
            "/user/signup/",
            "POST",
            credentials,
            false
          );

          tokenResponse = await this.fetchApi(
            "/user/token/",
            "POST",
            {
              email: credentials.email,
              password: credentials.password,
            },
            false
          );
        } else {
          tokenResponse = await this.fetchApi(
            "/user/token/",
            "POST",
            {
              email: credentials.email,
              password: credentials.password,
            },
            false
          );

          authResponse = {
            result: {
              email: credentials.email,
              username: credentials.email.split("@")[0],
            },
          };
        }

        const userId = parseIdFromToken(tokenResponse.access);

        this.user = {
          id: userId,
          email: authResponse.result?.email || authResponse.email,
          username: authResponse.result?.username || authResponse.username,
        };
        this.accessToken = tokenResponse.access;
        this.refreshToken = tokenResponse.refresh;
        this.isAuth = true;

        this.saveToStorage({
          id: userId,
          email: this.user.email,
          username: this.user.username,
          accessToken: tokenResponse.access,
          refreshToken: tokenResponse.refresh,
        });

        await tracksStore.initialize(this.accessToken);
      } catch (error) {
        this.error = this.getErrorMessage(error);
        throw error;
      } finally {
        this.loading = false;
        this.hydrated = true;
      }
    },

    async clearUser() {
      const tracksStore = useTracksStore();

      try {
        tracksStore.$reset();
      } finally {
        this.$reset();
        this.removeFromStorage();
        this.hydrated = true;
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/signin")
        ) {
          window.location.href = "/signin";
        }
      }
    },

    saveToStorage(data) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          email: data.email,
          username: data.username,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );
    },

    removeFromStorage() {
      localStorage.removeItem("user");
      sessionStorage.clear();
      indexedDB.deleteDatabase("localforage");
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    },

    async restoreUser() {
      const tracksStore = useTracksStore();

      if (typeof window === "undefined") {
        this.hydrated = false;
        return;
      }

      if (window.location.pathname.startsWith("/sign")) {
        this.hydrated = true;
        return;
      }

      try {
        const storedData = localStorage.getItem("user");
        if (!storedData) {
          this.hydrated = true;
          return;
        }

        const parsedData = JSON.parse(storedData);
        if (
          this.isValidUser(parsedData) &&
          this.isTokenValid(parsedData.accessToken)
        ) {
          this.user = {
            id: parsedData.id,
            email: parsedData.email,
            username: parsedData.username,
          };
          this.accessToken = parsedData.accessToken;
          this.refreshToken = parsedData.refreshToken;
          this.isAuth = true;

          await tracksStore.initialize(this.accessToken);
        } else {
          await this.clearUser();
        }
      } catch (error) {
        console.error("Ошибка восстановления сессии:", error);
        await this.clearUser();
      } finally {
        this.hydrated = true;
      }
    },

    isValidUser(data) {
      return (
        !!data?.id &&
        !!data?.email &&
        !!data?.username &&
        !!data?.accessToken &&
        !!data?.refreshToken
      );
    },

    isTokenValid(token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 > Date.now();
      } catch {
        return false;
      }
    },

    async fetchApi(url, method, body, authRequired = false) {
      const headers = { "Content-Type": "application/json" };

      if (
        authRequired &&
        this.accessToken &&
        !window.location.pathname.includes("/signin")
      ) {
        headers.Authorization = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(
        `https://webdev-music-003b5b991590.herokuapp.com${url}`,
        { method, headers, body: JSON.stringify(body) }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Unknown error occurred";

        try {
          const errorData = contentType?.includes("application/json")
            ? await response.json()
            : await response.text();
          errorMessage =
            typeof errorData === "object" ? errorData.message : errorData;
        } catch {
          errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }
      return response.json();
    },

    getErrorMessage(error) {
      return error.message || "Ошибка при аутентификации";
    },
  },
});
