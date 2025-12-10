# Copilot Instructions for AI Agents


**Principio Rector:** Garantizar que todas las contribuciones de la IA sean seguras, transparentes, tengan un propósito definido y estén plenamente alineadas con las instrucciones explícitas del usuario y la integridad del proyecto.

## I. Integridad del Código y del Sistema

- **Prohibida la Generación de Código No Autorizado:** No escribir, generar ni sugerir ningún código nuevo, script o solución programática a menos que el usuario lo solicite explícitamente para una tarea específica.
- **Prohibidas las Modificaciones o Eliminaciones No Autorizadas:** No modificar, refactorizar ni eliminar ningún código, archivo, comentario o estructura de datos existente sin la aprobación previa explícita e instrucciones claras del usuario.
- **Prohibida la Creación de Activos No Autorizados:** No crear nuevos archivos, directorios, funciones, clases, rutas, esquemas de bases de datos ni ningún otro componente del sistema sin instrucción explícita del usuario.
- **Prohibido el Cambio de Nombre No Autorizado:** No cambiar el nombre de ninguna variable, función, clase, archivo, componente u otros activos del proyecto existentes sin el consentimiento explícito del usuario.
- **Preservar la Lógica Existente:** Respetar y mantener los patrones arquitectónicos, el estilo de codificación y la lógica operativa existentes del proyecto, a menos que el usuario indique explícitamente que se modifiquen.

## II. Clarificación de Requisitos y Anulación de Suposiciones

- **Clarificación Obligatoria:** Si la solicitud, intención, requisitos o cualquier información contextual del usuario es ambigua, incompleta o poco clara de alguna manera, detenerse siempre y solicitar una clarificación detallada antes de proceder.
- **No Realizar Suposiciones:** Nunca hacer suposiciones sobre los objetivos del proyecto, las preferencias del usuario, las limitaciones técnicas o las tareas implícitas. Basar todas las acciones estrictamente en la información explícita proporcionada por el usuario.
- **Verificar la Comprensión:** Antes de emprender acciones significativas o proporcionar soluciones complejas, resumir brevemente la comprensión de la tarea y los requisitos, y buscar la confirmación del usuario.

## III. Transparencia Operativa y Comunicación Proactiva

- **Explicar Antes de Actuar:** Antes de realizar cualquier acción solicitada (p. ej., generar un plan, redactar contenido, analizar información), explicar claramente qué se va a hacer, los pasos involucrados y cualquier posible implicación.
- **Registro Detallado de Acciones y Decisiones:** Para cada paso, análisis o sugerencia significativa, registrar/declarar claramente la acción realizada, la información en la que se basa y el razonamiento detrás de la decisión o el resultado.
- **Detención Inmediata ante la Incertidumbre:** Si en algún momento surge inseguridad sobre cómo proceder, se encuentra un problema inesperado o si una solicitud parece entrar en conflicto con estas reglas o la seguridad del proyecto, detenerse inmediatamente y consultar al usuario.
- **Acciones Orientadas a un Propósito:** Asegurar que cada acción o fragmento de información proporcionado sea directamente relevante para la solicitud explícita del usuario y tenga un propósito claramente establecido. Ningún consejo o funcionalidad no solicitados.

## IV. Cumplimiento y Revisión

- **Cumplimiento Estricto:** Estas reglas son innegociables y deben cumplirse estrictamente en todas las interacciones.
- **Revisión de las Reglas:** Estar abierto a discutir y refinar estas reglas con el usuario a medida que la colaboración evoluciona.

## Project Overview
- **Type:** Restaurant SPA frontend
- **Tech Stack:** React (Vite), TailwindCSS, JavaScript, Docker
- **Purpose:** Admin panel, kitchen, and analytics for restaurant operations
- **API:** Communicates with backend via REST (see `src/services/api.js`)

## Architecture & Key Modules
- **SPA Structure:** Main entry in `src/main.jsx`, routes/pages in `src/pages/`, context in `src/context/`
- **User Management:** All user CRUD and authentication logic in `src/modules/users/` (see `UserForm.jsx`, `usersService.js`)
- **Authentication:** Uses Firebase Auth (`src/firebaseConfig.js`), context managed in `src/context/AuthContext.jsx`
- **Analytics Dashboard:** Modular React components in `src/views/SalesAnalyticsDashboard/` and `src/components/analytics/`
- **Custom Hooks:** Business logic and state in `src/hooks/`
- **Styling:** TailwindCSS, custom styles in `src/styles/`

## Developer Workflows
- **Local Development:**
  - Install: `npm install`
  - Start: `npm run dev` (Vite, port 5173)
- **Production Build:**
  - Build: `npm run build`
- **Docker:**
  - Build image: `docker build -t restaurant-frontend .`
  - Run: `docker run -p 5173:80 restaurant-frontend`
- **Testing:**
  - Unit/integration tests in `src/__tests__/` and `src/modules/users/__tests__/`
  - Run: `npm test`

## Project-Specific Patterns
- **Password Handling:** Passwords are encrypted client-side with bcryptjs before sending to backend (see `src/utils/passwordEncryption.js`)
- **API Calls:** Use fetch, endpoints defined in `src/services/api.js` and `src/modules/users/usersService.js`
- **Role-Based Routing:** Auth context and claims determine navigation (see `Login.jsx`, `AuthContext.jsx`)
- **Modular Analytics:** Dashboard components are decoupled, use custom hooks and services for data
- **Internationalization:** i18n setup in `src/i18n.js`, translations in `src/locales/`

## Integration Points
- **Firebase:** Auth and config in `src/firebaseConfig.js`
- **Backend API:** Base URL from environment variable `VITE_API_URL`
- **Docker:** Containerizes static build for deployment

## Conventions & Tips

## Clean Code & Design Patterns

**SOLID Principles:**
- Apply SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) in all components, hooks, and services. This ensures code is robust, extensible, and easy to maintain.

**Ejemplos en este proyecto:**
- **Responsabilidad Única:** Cada hook en `src/hooks/` encapsula una sola lógica de negocio (ejemplo: `useSalesAnalytics.js` solo gestiona estado y lógica de analíticas).
- **Abierto/Cerrado:** Los servicios en `src/services/` y `src/modules/users/usersService.js` pueden extenderse para nuevos endpoints sin modificar la lógica existente.
- **Sustitución de Liskov:** Los componentes de analíticas (`StatCard.jsx`, `BarChart.jsx`, etc.) pueden intercambiarse o extenderse sin romper el dashboard.
- **Segregación de Interfaces:** Los props de componentes están diseñados para ser mínimos y específicos, evitando dependencias innecesarias.
- **Inversión de Dependencias:** La lógica de negocio se implementa en hooks y servicios, mientras los componentes solo consumen datos y funciones, facilitando pruebas y cambios.

**Clean Code:** Prioritize readable, maintainable, and well-documented code. Use clear naming, avoid duplication, and keep functions/components focused on a single responsibility.
**Design Patterns:** The codebase follows modular and decoupled patterns:
  - **Feature-based structure:** Components, hooks, and services are grouped by domain (e.g., users, analytics, kitchen).
  - **Custom Hooks:** Encapsulate business logic and state (see `src/hooks/`).
  - **Service Layer:** API communication is abstracted in service files (see `src/services/`, `src/modules/users/usersService.js`).
  - **Context API:** Used for global state (auth, notifications) instead of external libraries.
  - **Reusable Components:** UI elements are designed for reusability and clarity (see `src/components/`).
  - **Error Boundaries:** User-facing errors are handled gracefully via modals and inline messages.

## Conventions & Tips
- **Component Organization:** Grouped by feature (e.g., `users`, `analytics`, `kitchen`)
- **Error Handling:** User-facing errors shown via modals or inline messages
- **State Management:** Prefer React context and hooks over external state libraries
- **Testing:** Use Jest, tests colocated with modules
- **Environment Variables:** Use `.env` and `import.meta.env` for config

## Examples
- Creating a user: see `UserForm.jsx` (uses encrypted password)
- Fetching analytics: see `analyticsService.js` and `useSalesAnalytics.js`
- Custom modal: see `NotificationModal.jsx`


_If any section is unclear or missing, please provide feedback for improvement._



Antes de ejecutar cualquier acción o dar una respuesta relacionada con tests unitarios o cobertura, la IA debe revisar el archivo `copilot-instructions-tests.md` para obtener el contexto y las instrucciones específicas de los tests.
