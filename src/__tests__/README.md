# Tests Suite - Delicious Kitchen

Este directorio contiene todos los tests unitarios, de integración y end-to-end para verificar la implementación correcta de las 40 historias de usuario del proyecto Delicious Kitchen.

## 📁 Estructura de Tests

```
src/__tests__/
├── orders/
│   └── order.test.js          # US-001 a US-005, US-013 (Gestión de pedidos)
├── kitchen/
│   └── kitchen.test.js        # US-006 a US-008, US-011, US-012, US-040 (Cocina)
├── notifications/
│   └── notifications.test.js  # US-009, US-010, US-014 (Notificaciones SSE)
├── reviews/
│   └── reviews.test.js        # US-022 a US-025 (Reseñas)
├── auth/
│   └── auth-users.test.js     # US-015 a US-021, US-037 (Autenticación y Usuarios)
├── analytics/
│   └── analytics.test.js      # US-026 a US-032 (Dashboard y Reportes)
├── infrastructure/
│   └── infrastructure.test.js # US-033 a US-036, US-038, US-039 (Infra y Calidad)
└── README.md                  # Este archivo
```

## 🚀 Ejecución de Tests

### Ejecutar todos los tests

```bash
npm test
```

### Ejecutar tests por módulo

```bash
# Tests de pedidos
npm test orders

# Tests de cocina
npm test kitchen

# Tests de notificaciones
npm test notifications

# Tests de reseñas
npm test reviews

# Tests de autenticación
npm test auth

# Tests de analíticas
npm test analytics

# Tests de infraestructura
npm test infrastructure
```

### Ejecutar con cobertura

```bash
npm run test:coverage
```

### Ejecutar en modo watch (desarrollo)

```bash
npm run test:watch
```

### Ejecutar tests específicos

```bash
# Por nombre de test
npm test -- -t "TC-CLIENT-001"

# Por archivo
npm test -- orders/order.test.js
```

## 📊 Cobertura de Tests

### Objetivo: ≥85% de cobertura

Los tests cubren:

- ✅ **160+ casos de prueba** distribuidos en 7 módulos
- ✅ **40 historias de usuario** (US-001 a US-040)
- ✅ **Funcionalidades críticas:** Pedidos, Notificaciones, Reseñas, Auth
- ✅ **Seguridad:** XSS, SQL Injection, Rate Limiting
- ✅ **Rendimiento:** Tiempos de respuesta, LCP, carga de datos
- ✅ **Integración:** RabbitMQ, MongoDB, Firebase Auth

### Reporte de Cobertura

Después de ejecutar `npm run test:coverage`, el reporte estará disponible en:

```
coverage/
├── lcov-report/
│   └── index.html  # Abrir en navegador para ver reporte visual
├── lcov.info       # Formato para CI/CD
└── coverage-summary.json
```

## 📋 Tipos de Tests

### 1. Tests Unitarios (60%)

Tests de funciones puras, utilidades y lógica de negocio aislada.

**Ejemplo:**

```javascript
test('TC-CLIENT-007: Calcular subtotal correcto del carrito', () => {
  const cart = [
    { price: 15.00, quantity: 2 },
    { price: 12.00, quantity: 1 },
  ];

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  expect(subtotal).toBe(42.00);
});
```

### 2. Tests de Integración (30%)

Tests de comunicación entre servicios, RabbitMQ, MongoDB, APIs.

**Ejemplo:**

```javascript
test('TC-INTEGRATION-003: Flujo Order Service → Kitchen Service', async () => {
  await mockRabbitMQ.publish('order.created', { orderId: 'ORD-123' });
  
  let received = null;
  await mockRabbitMQ.consume('order.created', (msg) => {
    received = msg;
  });

  expect(received.orderId).toBe('ORD-123');
});
```

### 3. Tests End-to-End (10%)

Tests de flujos completos de usuario.

**Ejemplo:**

```javascript
test('TC-INTEGRATION-008: Flujo Cliente → Admin → Público', async () => {
  // 1. Cliente deja reseña
  const created = await createReview({ rating: 5, comment: 'Excelente' });
  
  // 2. Admin aprueba
  await approveReview(created.reviewId);
  
  // 3. Reseña visible públicamente
  const publicReviews = await getPublicReviews();
  expect(publicReviews).toContainEqual(created);
});
```

## 🎯 Criterios de Aceptación

Para que un test pase, debe cumplir:

- ✅ **Resultado esperado:** Coincide con los criterios de aceptación de la US
- ✅ **Sin errores:** No debe lanzar excepciones no controladas
- ✅ **Limpieza:** Restaurar estado inicial (mocks, datos de prueba)
- ✅ **Rendimiento:** Ejecutarse en tiempo razonable (<5s por test)

## 🛠️ Configuración

### Jest Configuration

Los tests utilizan Jest con la siguiente configuración (`jest.config.cjs`):

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 85,
      functions: 85,
      lines: 85,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/__mocks__/**',
  ],
};
```

### Dependencias Necesarias

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "bcryptjs": "^2.4.3"
  }
}
```

## 📝 Convenciones de Nombres

### IDs de Test Cases

Formato: `TC-{MÓDULO}-{NÚMERO}`

Ejemplos:

- `TC-CLIENT-001`: Test del módulo Cliente, caso 001
- `TC-KITCHEN-015`: Test del módulo Cocina, caso 015
- `TC-AUTH-007`: Test de Autenticación, caso 007
- `TC-INTEGRATION-003`: Test de Integración, caso 003

### Nombres Descriptivos

```javascript
// ✅ Bueno
test('TC-CLIENT-001: El menú se carga en menos de 2.5 segundos', () => {});

// ❌ Malo
test('menu test', () => {});
```

## 🐛 Debugging Tests

### Ejecutar test específico con logs

```bash
npm test -- -t "TC-CLIENT-001" --verbose
```

### Ver output completo

```bash
npm test -- --no-coverage --verbose
```

### Modo debug con Node Inspector

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Luego abrir Chrome DevTools en `chrome://inspect`

## 📚 Documentación Relacionada

- **[TEST_PLAN.md](../../restaurant-backend/ArchivosMD/Documentacion/TEST_PLAN.md)** - Plan de pruebas completo
- **[TEST_CASES.md](../../restaurant-backend/ArchivosMD/Documentacion/TEST_CASES.md)** - Casos de prueba detallados
- **[REFINED_BACKLOG.md](../../restaurant-backend/ArchivosMD/Documentacion/REFINED_BACKLOG.md)** - Historias de usuario con criterios INVEST

## 🔄 CI/CD

Los tests se ejecutan automáticamente en cada:

- ✅ **Pull Request:** Suite completa de tests
- ✅ **Merge a main:** Tests + Coverage Report
- ✅ **Deploy a staging:** Tests + E2E
- ✅ **Deploy a production:** Tests + Smoke Tests

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## 🎓 Mejores Prácticas

### 1. Arrange-Act-Assert (AAA)

```javascript
test('example', () => {
  // Arrange: Preparar datos y estado
  const user = { name: 'Juan', role: 'admin' };

  // Act: Ejecutar acción
  const hasAccess = checkPermission(user, 'create_user');

  // Assert: Verificar resultado
  expect(hasAccess).toBe(true);
});
```

### 2. Usar mocks para dependencias externas

```javascript
jest.mock('firebase/auth');
jest.mock('../../services/api');
```

### 3. Limpiar después de cada test

```javascript
afterEach(() => {
  jest.clearAllMocks();
  // Limpiar datos de prueba
});
```

### 4. Tests independientes

Cada test debe poder ejecutarse solo, sin depender de otros tests.

### 5. Nombres descriptivos

Los nombres de test deben explicar QUÉ se está probando y cuál es el RESULTADO esperado.

## 📞 Soporte

Para problemas con los tests:

1. Revisar logs con `npm test -- --verbose`
2. Verificar configuración en `jest.config.cjs`
3. Consultar documentación de Jest: https://jestjs.io/docs/getting-started
4. Contactar al equipo de QA

---

**Última actualización:** 18 de diciembre de 2025  
**Autor:** GitHub Copilot  
**Versión:** 1.0
