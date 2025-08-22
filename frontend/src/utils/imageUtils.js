/* Utilidad para cargar imágenes responsivas */

// Función para detectar la resolución de la pantalla y cargar la imagen apropiada
export const getOptimalImageSrc = (baseName) => {
  const pixelRatio = window.devicePixelRatio || 1;
  const screenWidth = window.screen.width * pixelRatio;
  const screenHeight = window.screen.height * pixelRatio;

  // Determinar la mejor resolución basada en la pantalla
  if (screenWidth >= 3840 || screenHeight >= 2160) {
    return `/images/${baseName}-4k.png`; // 4K
  } else if (screenWidth >= 2560 || screenHeight >= 1440) {
    return `/images/${baseName}-2k.png`; // 2K
  } else if (screenWidth >= 1920 || screenHeight >= 1080) {
    return `/images/${baseName}-fullhd.png`; // Full HD
  } else {
    return `/images/${baseName}-hd.png`; // HD
  }
};

// Función para precargar imágenes
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
};

// CSS-in-JS para fondos responsivos
export const createResponsiveBackground = (imageName) => {
  const baseStyle = {
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  // En un entorno real, detectaríamos la resolución
  // Por ahora usamos la imagen base que se escala automáticamente
  return {
    ...baseStyle,
    backgroundImage: `url(/images/${imageName})`,
    backgroundAttachment: window.innerWidth > 768 ? 'fixed' : 'scroll',
  };
};

export default {
  getOptimalImageSrc,
  preloadImage,
  createResponsiveBackground
};
