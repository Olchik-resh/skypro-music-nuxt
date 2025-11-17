const tracks = [];

export const getTracks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tracks);
    }, 500); 
  });
};
