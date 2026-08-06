// Reads a picked document's content URI and resolves to its base64 payload
// (without the "data:...;base64," prefix), using fetch + FileReader so no
// extra native filesystem dependency is required.
export const fileToBase64 = (uri) =>
  new Promise((resolve, reject) => {
    fetch(uri)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          const result = reader.result;
          const base64 = typeof result === 'string' ? result.split(',')[1] : '';
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
