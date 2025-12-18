# Instrucciones para Conectar el Frontend a Restaurant Firebase (firebase.google.com)

## 1. Crear un Proyecto en Firebase
- Ve a https://console.firebase.google.com/
- Haz clic en "Agregar proyecto" y sigue los pasos.

## 2. Registrar la Aplicación Web
- En el panel de tu proyecto, haz clic en el ícono "</>" para agregar una app web.
- Asigna un nombre y registra la app.
- Copia la configuración de Firebase (apiKey, authDomain, projectId, etc.).

## 3. Instalar el SDK de Firebase en el Frontend
```bash
npm install firebase
```

## 4. Configurar Firebase en tu Proyecto
- Crea un archivo `firebaseConfig.js` en `src/`:
```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  // ...otros datos
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

## 5. Implementar Login con Firebase
- Usa los métodos de Firebase Auth para login con email y contraseña.
- Ejemplo:
```js
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Usuario autenticado
    // userCredential.user contiene el JWT y datos
  })
  .catch((error) => {
    // Manejar error
  });
```

## 6. Validar Rol de Administrador
- Usa custom claims en Firebase para asignar el rol ADMIN a los usuarios desde la consola o backend.
- Tras login, obtén el JWT y decodifica los claims para validar el rol antes de mostrar el panel de administración.

## 7. Seguridad
- Nunca expongas claves privadas en el frontend.
- Usa HTTPS en producción.

## 8. Recursos
- [Documentación oficial Firebase Web](https://firebase.google.com/docs/web/setup)
- [Autenticación con Firebase](https://firebase.google.com/docs/auth/web/start)
- [Custom Claims y roles](https://firebase.google.com/docs/auth/admin/custom-claims)

---
¿Necesitas ejemplo de código para la validación de roles en React?