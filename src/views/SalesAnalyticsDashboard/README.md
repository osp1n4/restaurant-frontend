# Dashboard de Analíticas de Ventas

Módulo completo de analíticas para el sistema de restaurante, implementado con arquitectura modular y buenas prácticas de React.

## 📁 Estructura de Archivos

```
src/
├── views/
│   └── SalesAnalyticsDashboard/
│       └── index.jsx                  # Vista principal del dashboard
├── components/
│   └── analytics/
│       ├── StatCard.jsx               # Tarjeta de métrica individual
│       ├── LineChart.jsx              # Gráfico de líneas SVG
│       ├── BarChart.jsx               # Gráfico de barras vertical
│       ├── DataTable.jsx              # Tabla con sorting y paginación
│       ├── FilterToolbar.jsx          # Barra de filtros y exportación
│       └── Sidebar.jsx                # Navegación lateral
├── hooks/
│   └── useSalesAnalytics.js           # Custom hook para estado y lógica
├── services/
│   ├── api.js                         # Funciones getAnalytics y exportAnalyticsCSV
│   └── analyticsService.js            # Servicio dedicado de analytics
└── styles/
    └── analytics.css                  # Estilos específicos del módulo
```

## 🎨 Paleta de Colores

- **Primary**: `#19e65e` (verde) - Acciones principales, estados activos
- **Background Light**: `#f8f6f6` - Fondo en modo claro
- **Background Dark**: `#221610` - Fondo en modo oscuro
- **Text**: `#181311` (claro) / `#f8f6f6` (oscuro)

## 🚀 Características Implementadas

### 1. **Vista Principal** (`SalesAnalyticsDashboard`)
- Layout con Sidebar + contenido principal
- Estados de carga, error y sin datos
- Composición de todos los componentes del dashboard
- Transformación de datos para gráficos y tabla

### 2. **Componentes Reutilizables**
- **StatCard**: Muestra métricas con formato (currency, number, time, text)
- **LineChart**: Gráfico SVG con gradient area fill
- **BarChart**: Gráfico de barras con escalado dinámico
- **DataTable**: Tabla con sorting bidireccional y paginación (10/20/50 filas)
- **FilterToolbar**: Filtros de fecha, agrupación y botones de acción
- **Sidebar**: Navegación con iconos Material y estado activo

### 3. **Lógica de Estado** (`useSalesAnalytics`)
- Gestión de filtros (from, to, groupBy, top)
- Llamadas automáticas al backend
- Manejo de loading y errores
- Refetch manual y exportación CSV

### 4. **Servicios API**
- `getAnalytics(filters)`: Obtiene datos agregados
- `exportAnalyticsCSV(params)`: Descarga archivo CSV
- Manejo de respuestas 204 (sin datos)
- Error handling con mensajes descriptivos

## 📊 Endpoints Backend

### GET `/admin/analytics`
**Parámetros**:
- `from` (YYYY-MM-DD): Fecha inicial
- `to` (YYYY-MM-DD): Fecha final
- `groupBy` (day|week|month|year): Agrupación
- `top` (number, opcional): Top N productos

**Respuesta**:
```json
{
  "range": { "from": "...", "to": "...", "groupBy": "..." },
  "summary": {
    "totalOrders": 13,
    "totalRevenue": 324000,
    "avgPrepTime": null
  },
  "series": [
    { "period": "2025-11", "totalOrders": 13, "totalRevenue": 324000, "avgPrepTime": null }
  ],
  "productsSold": [...],
  "topNProducts": [...]
}
```

### POST `/admin/analytics/export`
**Body**:
```json
{
  "from": "2025-01-01",
  "to": "2025-12-31",
  "groupBy": "month",
  "top": 5,
  "columns": ["period", "totalOrders", "totalRevenue", "productName", "quantity"]
}
```

**Respuesta**: Archivo CSV descargable

## 🎯 Acceso a la Vista

**Ruta**: `/dashboard/analytics`

**Navegación**:
```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/dashboard/analytics');
```

## 🛠️ Principios de Arquitectura

### SOLID Aplicado a Frontend

1. **Single Responsibility**: Cada componente tiene una única responsabilidad
   - StatCard: Mostrar una métrica
   - LineChart: Renderizar gráfico de líneas
   - useSalesAnalytics: Gestionar estado de analytics

2. **Open/Closed**: Componentes extensibles sin modificación
   - StatCard acepta prop `format` para diferentes tipos de valores
   - DataTable acepta cualquier estructura de datos vía props

3. **Liskov Substitution**: Componentes intercambiables
   - LineChart y BarChart comparten interfaz similar
   - Pueden reemplazarse sin romper el dashboard

4. **Interface Segregation**: Props específicas por componente
   - FilterToolbar solo recibe props de filtros y acciones
   - No depende de datos completos del dashboard

5. **Dependency Inversion**: Componentes dependen de abstracciones
   - Dashboard usa `useSalesAnalytics` hook (abstracción)
   - No hace fetch directo, usa `analyticsService`

## 📝 Uso del Custom Hook

```jsx
import { useSalesAnalytics } from '../hooks/useSalesAnalytics';

function MyComponent() {
  const { 
    data,           // Datos de analytics
    loading,        // Estado de carga
    error,          // Mensaje de error
    filters,        // Filtros actuales
    updateFilters,  // Actualizar filtros
    refetch,        // Recargar datos
    exportToCSV     // Exportar a CSV
  } = useSalesAnalytics();

  // Cambiar filtro
  updateFilters({ groupBy: 'day' });

  // Exportar datos
  await exportToCSV();
}
```

## 🎨 Componentes con PropTypes

Todos los componentes incluyen validación de props:

```jsx
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  change: PropTypes.number,
  isPositive: PropTypes.bool,
  icon: PropTypes.string,
  format: PropTypes.oneOf(['number', 'currency', 'time', 'text'])
};
```

## 🧪 Testing (Próximos pasos)

- Unit tests para componentes individuales
- Integration tests para flujo completo
- E2E tests con Playwright/Cypress
- Test de accesibilidad (a11y)

## 🔐 Seguridad

- **RBAC**: Backend valida roles manager/admin (temporalmente deshabilitado para testing)
- **Validación**: Parámetros obligatorios validados en backend
- **Límites**: Máximo 12 meses por consulta
- **CORS**: Configurado en API Gateway

## 📈 Rendimiento

- Lazy loading de datos (solo carga al montar o refetch manual)
- Debounce en filtros (evita llamadas excesivas)
- Paginación en tabla (reduce renderizado)
- SVG para gráficos (mejor performance que Canvas)

## 🌐 Internacionalización

Actualmente en español:
- Mensajes de error
- Labels de UI
- Formato de moneda: `es-CO` (pesos colombianos)

## 📱 Responsive Design

- **Mobile**: 1 columna en stats cards, stack de gráficos
- **Tablet**: 2 columnas en stats cards
- **Desktop**: 5 columnas en stats cards, gráficos lado a lado

## 🌙 Dark Mode

Soporte completo con clases Tailwind `dark:`:
- Backgrounds adaptativos
- Texto con contraste adecuado
- Bordes y sombras ajustados

## 🐛 Troubleshooting

### Error: "Cannot read property 'series' of null"
**Solución**: Verifica que el backend esté corriendo y devuelva datos válidos

### CSV no descarga
**Solución**: Verifica CORS en API Gateway y que el endpoint POST /admin/analytics/export esté activo

### Gráficos no se muestran
**Solución**: Verifica que `data.series` y `data.topNProducts` tengan elementos

## 📚 Referencias

- [React Best Practices](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Material Symbols](https://fonts.google.com/icons)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Desarrollado con**: React 19.2.0, Vite 7.2.2, Tailwind CSS 3.4.18
**Backend**: Node.js, Express, MongoDB
**Arquitectura**: Microservicios con API Gateway
