# Contexto del Negocio - Sistema de Pedidos de Restaurante

## 1. Descripción del Proyecto
**Nombre del Proyecto:** Sistema de Pedidos de Restaurante (Restaurant Backend & Frontend)

**Objetivo del Proyecto:** Desarrollar una plataforma integral y escalable basada en microservicios para la gestión eficiente de pedidos en un restaurante. El sistema busca automatizar el flujo desde la solicitud del cliente hasta la entrega, facilitando la comunicación en tiempo real entre el cliente, el sistema de pedidos y el personal de cocina, además de proveer herramientas administrativas para la gestión del personal.

## 2. Flujos Críticos del Negocio
**Principales Flujos de Trabajo:**
1.  **Ciclo de Vida del Pedido:**
    *   **Creación:** El cliente selecciona productos y confirma el pedido (Frontend -> API Gateway -> Order Service).
    *   **Procesamiento:** El pedido se notifica automáticamente a la cocina (Order Service -> RabbitMQ -> Kitchen Service).
    *   **Preparación:** El personal de cocina marca el pedido como "En Preparación" y luego "Listo" (Kitchen Service -> RabbitMQ).
    *   **Entrega:** El sistema actualiza el estado final y notifica al cliente.
2.  **Notificaciones en Tiempo Real:** Los clientes reciben actualizaciones automáticas sobre el estado de su pedido (Pendiente, Preparando, Listo) mediante Server-Sent Events (SSE).
3.  **Gestión de Usuarios (Administración):** El administrador se autentica y gestiona el acceso del personal (crear, editar, desactivar usuarios) mediante un panel dedicado.

**Módulos o Funcionalidades Críticas:**
*   **Order Service:** Gestión centralizada de la creación y estado de los pedidos.
*   **Kitchen Service:** Panel para el personal de cocina para visualizar y gestionar la cola de preparación.
*   **Notification Service:** Sistema de difusión de eventos en tiempo real hacia los clientes.
*   **API Gateway:** Punto único de entrada que enruta y protege las peticiones.
*   **Panel de Administración:** Módulo de seguridad para la gestión de roles y usuarios del personal.

## 3. Reglas de Negocio y Restricciones
**Reglas de Negocio Relevantes:**
*   **Flujo de Estados Estricto:** Un pedido debe seguir la secuencia lógica: `PENDING` -> `PREPARING` -> `READY` -> `DELIVERED` (o `CANCELLED`).
*   **Seguridad de Acceso:** Solo los usuarios con rol de **Administrador** pueden acceder al módulo de gestión de usuarios y configuración.
*   **Integridad de Datos:** El correo electrónico de los usuarios debe ser único y válido. Las contraseñas deben cumplir criterios mínimos de seguridad.
*   **Desacoplamiento:** La comunicación crítica entre servicios (ej. crear pedido -> notificar cocina) debe ser asíncrona (RabbitMQ) para garantizar la disponibilidad.

**Regulaciones o Normativas:**
*   **Autenticación Segura:** Uso de Firebase Auth para la gestión de identidades, cumpliendo estándares de seguridad en el manejo de credenciales.

## 4. Perfiles de Usuario y Roles
**Perfiles o Roles de Usuario en el Sistema:**
1.  **Cliente Final:** Usuario externo que navega el menú y realiza pedidos.
2.  **Personal de Cocina:** Empleado encargado de visualizar la cola de pedidos y actualizar su estado de preparación.
3.  **Administrador:** Usuario con privilegios elevados para la gestión del sistema.

**Permisos y Limitaciones de Cada Perfil:**
*   **Cliente:** Puede crear pedidos y consultar *solo* sus propios pedidos. No tiene acceso a paneles internos.
*   **Personal de Cocina:** Puede ver todos los pedidos activos y cambiar su estado (`start-preparing`, `ready`). No puede administrar usuarios.
*   **Administrador:** Tiene acceso total al módulo de "User Management" (crear, editar, desactivar personal). No puede desactivar su propia cuenta para evitar bloqueos accidentales.

## 5. Condiciones del Entorno Técnico
**Plataformas Soportadas:**
*   **Web:** Aplicación Single Page Application (SPA) accesible desde navegadores de escritorio y móviles.

**Tecnologías o Integraciones Clave:**
*   **Frontend:** React, Vite, TailwindCSS.
*   **Backend (Microservicios):** Node.js, Express, TypeScript.
*   **Base de Datos:** MongoDB (persistencia de pedidos y usuarios).
*   **Mensajería Asíncrona:** RabbitMQ (comunicación entre microservicios).
*   **Infraestructura:** Docker y Docker Compose para orquestación de contenedores.
*   **Autenticación:** Integración con **Firebase Auth** y **Google Identity Platform**.
*   **Comunicación Real-Time:** Server-Sent Events (SSE) para notificaciones.

## 6. Casos Especiales o Excepciones (Opcional)
**Escenarios Alternos:**
*   **Consistencia Eventual:** Debido al uso de colas de mensajes (RabbitMQ), puede haber un ligero retraso (milisegundos) entre la creación de un pedido y su aparición en la pantalla de cocina.
*   **Fallas de Red:** El frontend debe manejar reconexiones automáticas al servicio de notificaciones (SSE) si se pierde la conexión.
