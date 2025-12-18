// Script para asignar roles (ADMIN o KITCHEN) a usuarios en Firebase Authentication
// Uso: node setAdminClaim.cjs [UID] [ROLE]
// Ejemplo: node setAdminClaim.cjs HcyFZ67HYRYBHs5zr6FqBCypjdf1 ADMIN
// Ejemplo: node setAdminClaim.cjs otro-uid-aqui KITCHEN

const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json"); // Ajusta la ruta si es necesario

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Obtener argumentos de línea de comandos o usar valores por defecto
const uid = process.argv[2] || "HcyFZ67HYRYBHs5zr6FqBCypjdf1"; // day@gmail.com
const role = (process.argv[3] || "ADMIN").toUpperCase(); // ADMIN o KITCHEN

// Validar rol
if (role !== "ADMIN" && role !== "KITCHEN") {
  console.error(`Error: El rol debe ser ADMIN o KITCHEN. Recibido: ${role}`);
  process.exit(1);
}

console.log(`Asignando rol ${role} al usuario ${uid}...`);

admin.auth().setCustomUserClaims(uid, { role: role })
  .then(() => {
    console.log(`✅ Rol ${role} asignado exitosamente al usuario ${uid}`);
    console.log(`⚠️  El usuario debe cerrar sesión y volver a iniciar para que el cambio tome efecto.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error asignando custom claim:", error);
    process.exit(1);
  });
