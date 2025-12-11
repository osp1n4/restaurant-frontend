# HU2: Crear un nuevo usuario del personal (Frontend)

**Como** Administrador  
**Quiero** un formulario visual para crear usuarios con nombre, email, contraseña temporal y rol  
**Para** poder dar de alta nuevos empleados fácilmente y de forma intuitiva.

## Criterios de Aceptación
- El panel de administración incluye una sección “User Management” accesible solo para administradores.
- El formulario de alta de usuario contiene los siguientes campos obligatorios:
	- Full Name (Nombre completo)
	- Email Address (Correo electrónico)
	- Password (Contraseña temporal)
	- Confirm Password (Confirmar contraseña)
	- Role (Rol, como dropdown: Admin, Editor, Viewer, etc.)
- El formulario valida que:
	- Todos los campos estén completos.
	- El email tenga formato válido.
	- Las contraseñas coincidan y cumplan requisitos mínimos.
- Al hacer clic en “Save”, se envía la información al backend y:
	- Si es exitoso, se muestra un mensaje de éxito y la lista se actualiza.
	- Si hay error, se muestra un mensaje claro de error.
- El botón “Cancel” limpia el formulario y/o regresa a la lista de usuarios.
- El diseño y experiencia de usuario siguen el mock adjunto (inputs, botones, colores, layout).
