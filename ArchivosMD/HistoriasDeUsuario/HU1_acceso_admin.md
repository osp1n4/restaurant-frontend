
# HU1: Acceso seguro al Panel de Administración (Frontend)

**Como** Administrador  
**Quiero** que solo los usuarios con rol Administrador puedan acceder a la sección de Gestión de Personal  
**Para** proteger la información y evitar accesos no autorizados, usando autenticación conectada a Restaurant Firebase (firebase.google.com).

## Criterios de Aceptación
- Al ingresar a la aplicación, se muestra una pantalla de login (según el mock visual).
- El usuario debe autenticarse con email/usuario y contraseña usando el proveedor Restaurant Firebase (firebase.google.com).
- Tras autenticarse, si el usuario tiene rol Administrador, puede ver y acceder al panel de administración.
- Si el usuario no es administrador, no puede ver ni acceder a la sección de gestión de personal (redirección o mensaje de acceso denegado).
- El frontend debe validar el JWT y el rol (obtenidos desde Restaurant Firebase) antes de mostrar la sección.
- El diseño y experiencia de usuario siguen el mock adjunto (inputs, botones, colores, layout).
