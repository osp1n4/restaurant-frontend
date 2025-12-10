

# Copilot Instructions for Unit Testing

## Testing Overview
- **Framework:** Jest
- **Test Types:** Unit and integration tests
- **Test Locations:**
  - General: `src/__tests__/`
  - Users module: `src/modules/users/__tests__/`

## Key Patterns
- **Test Structure:**
  - Each test file targets a single component, hook, or service
  - Use descriptive `describe` and `it/test` blocks
  - Mocks for API calls and context are in `src/tests/handlers.js` and `src/tests/server.js`
- **Component Testing:**
  - Use React Testing Library for rendering and interaction
  - Example: `OrderStatus.unit.test.jsx` tests UI and state transitions
- **Integration Testing:**
  - Example: `OrderStatus.integration.test.jsx` covers flows with backend/API mocks
- **User Module:**
  - User CRUD and form logic tested in `src/modules/users/__tests__/`
  - Use mock data and encrypted passwords for user creation

## Developer Workflow
- **Run all tests:**
  - `npm test`
- **Test coverage:**
  - Coverage report generated in `coverage/` after running tests
- **Debugging:**
  - Use `console.log` or Jest's `--watch` mode for iterative debugging

## Project-Specific Conventions
- **Mocks:** API and context mocks are colocated for easy reuse
- **Test Data:** Use realistic data structures matching production usage
- **Password Handling:** Use encrypted passwords in user tests (see `src/utils/passwordEncryption.js`)
- **Error Handling:** Assert user-facing error messages and modals

## Testing Principles: FIRST
- **Fast:** Los tests deben ejecutarse rápidamente para permitir ciclos de desarrollo ágiles.
- **Isolated:** Cada test debe ser independiente, sin depender de otros tests o del estado global.
- **Repeatable:** Los tests deben arrojar el mismo resultado cada vez, sin importar el entorno.
- **Self-validating:** Los tests deben tener aserciones claras y automáticas; no requieren inspección manual.
- **Timely:** Los tests deben escribirse junto con el código, no después.

## Ejemplo de test aplicando FIRST
```js
// src/__tests__/OrderStatus.unit.test.jsx
import { render, screen } from '@testing-library/react';
import OrderStatus from '../components/OrderStatus';

describe('OrderStatus', () => {
  it('muestra el estado correcto', () => {
    render(<OrderStatus status="ready" />);
    expect(screen.getByText(/Listo/i)).toBeInTheDocument(); // Self-validating
  });

  it('no depende de otros tests', () => {
    render(<OrderStatus status="pending" />);
    expect(screen.getByText(/Pendiente/i)).toBeInTheDocument(); // Isolated
  });
});
```
- **Fast:** Ejecuta en milisegundos.
- **Isolated:** Cada test renderiza su propio componente.
- **Repeatable:** Siempre produce el mismo resultado con los mismos props.
- **Self-validating:** Usa aserciones automáticas.
- **Timely:** Se escribe junto con el componente.

## Test Driven Development (TDD)
- Escribe primero los tests antes de implementar la funcionalidad.
- Usa los tests para definir el comportamiento esperado y guiar el desarrollo.
- Refactoriza el código solo cuando los tests estén en verde.
- Ejemplo de flujo TDD:
  1. Escribe un test que falle por la ausencia de la funcionalidad.
  2. Implementa el código mínimo para que el test pase.
  3. Refactoriza manteniendo los tests en verde.

### Ejemplo TDD
```js
// src/__tests__/OrderStatus.unit.test.jsx
it('muestra "Listo" cuando el estado es ready', () => {
  render(<OrderStatus status="ready" />);
  expect(screen.getByText(/Listo/i)).toBeInTheDocument();
});
// (Primero este test falla, luego se implementa la lógica en OrderStatus.jsx)
```

## Cobertura de Tests
- La cobertura mínima requerida es **98%** en líneas, funciones y ramas.
- Verifica la cobertura ejecutando:
  - `npm test -- --coverage`
- El reporte se genera en la carpeta `coverage/`.
- Revisa el archivo `coverage/lcov-report/index.html` para detalles visuales.
- Si la cobertura baja de 98%, agrega tests adicionales antes de aprobar cambios.

## Integración Continua (CI) y Cobertura
- Configura el pipeline de CI para ejecutar `npm test -- --coverage` en cada push y pull request.
- Falla el pipeline si la cobertura baja de 98%.
- Ejemplo de configuración (GitHub Actions):
```yaml
# .github/workflows/test-coverage.yml
name: Test Coverage
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 'lts/*'
      - run: npm install
      - run: npm test -- --coverage
      - name: Check coverage
        run: |
          COVERAGE=$(node -e "console.log(require('./coverage/coverage-summary.json').total.lines.pct)")
          if (( $(echo "$COVERAGE < 98" | bc -l) )); then exit 1; fi
```

## Ejemplo para cubrir ramas difíciles
```js
// src/__tests__/OrderStatus.unit.test.jsx
it('muestra error si el estado es desconocido', () => {
  render(<OrderStatus status="unknown" />);
  expect(screen.getByText(/Estado inválido/i)).toBeInTheDocument();
});
```
- Cubre casos de error y ramas condicionales para alcanzar el 98%.

## Example Files
- `src/__tests__/OrderStatus.unit.test.jsx`
- `src/__tests__/OrderStatus.integration.test.jsx`
- `src/modules/users/__tests__/`
- `src/tests/handlers.js`, `src/tests/server.js`

---

_If any section is unclear or missing, please provide feedback for improvement._
