# Grabación de Audio en Safari - Guía de Configuración

## ¿Qué cambios se hicieron?

Se implementó soporte mejorado para grabación de audio en **Safari** y otros navegadores. Los cambios incluyen:

### 1. **Detección de Navegador**
El código ahora detecta automáticamente qué navegador está usando el usuario (Safari, Chrome, Firefox) y adapta la grabación accordingly.

### 2. **Soporte para Múltiples Formatos de Audio**
- **Safari**: Usa `audio/mp4` (m4a) como formato preferido
- **Chrome**: Usa `audio/webm` (webm)
- **Firefox**: Usa `audio/ogg` (ogg)
- **Fallback**: Si el navegador no soporta ninguno, usa el formato nativo

### 3. **Mejoras de Calidad**
Se habilitaron opciones de audio avanzadas:
- `echoCancellation`: Elimina ecos
- `noiseSuppression`: Reduce ruido de fondo
- `autoGainControl`: Ajusta el volumen automáticamente

### 4. **Manejo Robusto de Errores**
Se agregaron mensajes de error específicos para Safari, indicando que requiere HTTPS (o localhost) para funcionar.

## Cómo probar en Safari

### Requisitos:
1. **Safari versión 14.1+** (incluye soporte para MediaRecorder)
2. **HTTPS** o **localhost** (Safari no permite acceso al micrófono en HTTP)
3. **Permisos de micrófono** permitidos en los ajustes del navegador

### Pasos para probar:

#### En Mac (Safari local):
```bash
# 1. Abre el sitio en localhost (si tienes un servidor local)
# 2. Safari pedirá permiso para acceder al micrófono la primera vez
# 3. Haz clic en "Permitir" (Allow)
# 4. Prueba el botón "🎤 Grabar"
```

#### En iPhone/iPad (Safari):
```
1. Abre el sitio en Safari (debe ser HTTPS)
2. El navegador pedirá permiso para el micrófono
3. Toca "Permitir" (Allow) en la alerta
4. Prueba la grabación
```

#### Si ves un mensaje de error en Safari:
**"Safari requiere HTTPS o localhost para grabar"**

Esto significa:
- ✅ El código está funcionando correctamente
- ⚠️ Safari bloqueó el acceso al micrófono por seguridad
- 📍 Necesitas estar en HTTPS o localhost

### Soluciones:

**Opción 1: Usar HTTPS en producción**
- Sube tu sitio a un servidor con certificado SSL/TLS válido
- Safari permitirá el acceso al micrófono automáticamente

**Opción 2: Usar localhost para pruebas**
- Configura un servidor local (ej: `python -m http.server 8000`)
- Accede a `http://localhost:8000`
- Safari permitirá el micrófono sin necesidad de HTTPS

**Opción 3: Permitir manualmente en Ajustes**
- Mac: Safari → Preferencias → Privacidad → Micrófono
- iPhone: Ajustes → Safari → Micrófono → Permitir para el sitio

## Formatos de Audio por Navegador

| Navegador | Formato | Extensión | Notas |
|-----------|---------|-----------|-------|
| Safari    | audio/mp4 | .m4a | Formato optimizado para iOS |
| Chrome    | audio/webm | .webm | Formato comprimido |
| Firefox   | audio/ogg | .ogg | Formato abierto |
| Edge      | audio/webm | .webm | Compatible con Chrome |
| Opera     | audio/webm | .webm | Compatible con Chrome |

## Prueba de Funcionalidad

1. **Abre la página de Voces** (voces.html)
2. **Haz clic en "🎤 Grabar"**
   - Deberías ver el botón cambiar a "⏹ Detener"
   - En Safari, aparecerá un aviso de permisos
3. **Habla durante 5-10 segundos**
4. **Haz clic en "⏹ Detener"**
   - Deberías ver un reproductor de audio debajo
   - El audio debe reproducirse correctamente
5. **Haz clic en "Subir grabación"**
   - El archivo se cargará a Firebase Storage
   - Aparecerá un mensaje de confirmación

## Notas Técnicas

### Cambios en el Código

**Antes:**
```javascript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
mediaRecorder = new MediaRecorder(stream);
```

**Después:**
```javascript
const mimeType = getSupportedMimeType(); // Detecta formato soportado
const mediaRecorderOptions = mimeType ? { mimeType } : {};
mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
```

### Características Agregadas

1. **`getBrowserInfo()`**: Detecta el navegador del usuario
2. **`getSupportedMimeType()`**: Encuentra el formato de audio soportado
3. **Detención limpia de streams**: Libera recursos después de grabar
4. **Mensajes de error específicos**: Información útil para el usuario

## Compatibilidad

✅ Chrome (versión 49+)  
✅ Firefox (versión 25+)  
✅ Safari (versión 14.1+)  
✅ Edge (versión 79+)  
✅ Opera (versión 36+)  
✅ Android Chrome  
✅ Android Firefox  

⚠️ Safari en iOS requiere HTTPS  
⚠️ Internet Explorer NO soportado  

## Solución de Problemas

### "Error al acceder al micrófono"
- ✅ Verifica que hayas permitido el micrófono en los ajustes del navegador
- ✅ Recarga la página y intenta de nuevo
- ✅ En Safari, verifica que estés en HTTPS o localhost

### El audio no se escucha en la vista previa
- ✅ Algunos navegadores requieren interacción del usuario para reproducir
- ✅ Intenta haciendo clic en el botón reproducir del reproductor de audio

### "Safari requiere HTTPS o localhost"
- ✅ Este NO es un error, es un mensaje informativo
- ✅ Safari está protegiendo tu privacidad requiriendo conexión segura
- ✅ Usa un servidor HTTPS en producción

## Próximas Mejoras Posibles

- [ ] Implementar grabación con calidad de usuario (bitrate ajustable)
- [ ] Agregar duración máxima de grabación
- [ ] Permitir pausa/reanudar en la grabación
- [ ] Mostrar nivel de volumen en tiempo real
- [ ] Transcripción de audio (usando API externa)

---

**Última actualización:** Diciembre 4, 2025  
**Versión:** 1.0
