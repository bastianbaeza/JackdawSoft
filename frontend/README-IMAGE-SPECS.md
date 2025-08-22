# Resoluciones Recomendadas para la Imagen de Fondo

## Resolución Óptima Principal
- **Resolución recomendada**: 3840x2160 (4K Ultra HD)
- **Formato**: PNG o WebP para mejor calidad
- **Tamaño máximo**: 2-5 MB (optimizada)

## Resoluciones Alternativas por Dispositivo

### Escritorio
- **Full HD**: 1920x1080
- **2K/QHD**: 2560x1440  
- **4K**: 3840x2160
- **Ultra-wide**: 3440x1440

### Móviles
- **HD**: 1280x720
- **Full HD**: 1920x1080
- **2K**: 2048x1152

## Aspectos Técnicos

### CSS aplicado:
- `background-size: cover` - Escala la imagen para cubrir todo el contenedor
- `background-position: center center` - Centra la imagen
- `background-attachment: fixed` - Fija la imagen durante el scroll (solo desktop)

### Optimizaciones implementadas:
1. **Responsive**: Se adapta a todas las resoluciones automáticamente
2. **Mobile-first**: Funciona perfectamente en dispositivos móviles
3. **Fixed positioning**: Elimina espacios en blanco
4. **Viewport units**: Usa 100vw y 100vh para cobertura completa
5. **Dynamic viewport**: Soporte para 100dvh en móviles modernos

## Recomendación:
Si quieres la máxima calidad, proporciona una imagen de **3840x2160** (4K).
La imagen actual se escala automáticamente, pero una resolución más alta 
eliminará cualquier posible pixelado en pantallas grandes.
