# Instructivo Paso a Paso para Desarrollar el Panel de Administración de Usuarios

## 1. Pre-requisitos
- Tener acceso al repositorio y entorno de desarrollo configurado.
- Backend y frontend corriendo localmente (Docker recomendado).
- Acceso a un sistema de autenticación (Firebase/Cognito) y base de datos.

## 2. Crear la Estructura de la HU
- Dentro de la carpeta `hu/`, crea un archivo por cada historia de usuario, por ejemplo: `HU1_acceso_admin.md`, `HU2_crear_usuario.md`, etc.
- En cada archivo, copia la HU correspondiente y sus criterios de aceptación.

## 3. Diseño de la Interfaz
- Boceta (wireframe) la pantalla de gestión de usuarios.
- Define los campos del formulario y la tabla de usuarios.

## 4. Implementación Backend
- Crea los endpoints necesarios:
  - POST `/usuarios` (crear usuario)
  - GET `/usuarios` (listar/buscar)
  - PUT `/usuarios/:id` (editar)
  - PATCH `/usuarios/:id/desactivar` (desactivar)
  - POST `/usuarios/:id/reset-password` (restablecer contraseña)
- Implementa la validación de roles y JWT.
- Asegura la integración con el sistema de autenticación y la base de datos.

## 5. Implementación Frontend
- Crea la nueva página o sección "Gestión de Personal".
- Implementa:
  - Formulario de alta de usuario
  - Tabla/lista de usuarios
  - Búsqueda y filtros
  - Botones de editar, desactivar y restablecer contraseña
- Asegura que solo los administradores puedan acceder.

## 6. Pruebas
- Prueba cada funcionalidad según los criterios de aceptación.
- Verifica mensajes de éxito/error y restricciones de acceso.

## 7. Documentación y Entrega
- Documenta endpoints, estructura de datos y flujos principales.
- Adjunta capturas de pantalla si es posible.
- Marca la HU como completada cuando pase las pruebas.

---
¿Necesitas plantillas para las HUs o ejemplos de endpoints/documentación técnica?