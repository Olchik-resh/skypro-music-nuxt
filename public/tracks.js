const tracks = [];

// Имитация асинхронного запроса
export const getTracks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tracks);
    }, 500); // Имитация задержки запроса
  });
};
