import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSalesAnalytics } from '../../hooks/useSalesAnalytics';
import FilterToolbar from '../../components/analytics/FilterToolbar';
import StatCard from '../../components/analytics/StatCard';
import LineChart from '../../components/analytics/LineChart';
import BarChart from '../../components/analytics/BarChart';
import DataTable from '../../components/analytics/DataTable';

/**
 * Vista principal: Dashboard de Analíticas de Ventas
 * Implementa arquitectura modular con separación de responsabilidades
 */
function SalesAnalyticsDashboard() {
  const { t } = useTranslation();
  const { data, loading, error, filters, updateFilters, refetch, exportToCSV } = useSalesAnalytics();
  const [exportLoading, setExportLoading] = useState(false);

  /**
   * Handler para exportar CSV
   */
  const handleExport = async () => {
    setExportLoading(true);
    try {
      await exportToCSV();
      // Notificación de éxito (puedes integrar con tu sistema de notificaciones)
      alert(t('analytics.exportSuccess', 'CSV exportado exitosamente'));
    } catch (err) {
      alert(t('analytics.exportError', 'Error al exportar: ') + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  /**
   * Transformar datos de series para gráfico de líneas
   */
  const getLineChartData = () => {
    if (!data?.series || data.series.length === 0) return [];
    
    return data.series.map(s => ({
      value: s.totalOrders,
      label: s.period
    }));
  };

  /**
   * Transformar datos de productos para gráfico de barras
   */
  const getBarChartData = () => {
    if (!data?.topNProducts) return [];
    return data.topNProducts.slice(0, 5).map(p => ({
      name: p.name,
      quantity: p.quantity
    }));
  };

  /**
   * Preparar datos para tabla combinando series y productos
   */
  const getTableData = () => {
    if (!data?.series || !data?.productsSold) return [];
    
    const tableRows = [];
    data.series.forEach(seriesItem => {
      data.productsSold.forEach(product => {
        tableRows.push({
          period: seriesItem.period,
          totalOrders: seriesItem.totalOrders,
          totalRevenue: seriesItem.totalRevenue,
          productId: product.productId,
          productName: product.name,
          quantity: product.quantity,
          avgPrepTime: seriesItem.avgPrepTime
        });
      });
    });
    
    return tableRows;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <div className="flex h-full w-full">

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="mx-auto max-w-7xl">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 items-center">
              <div className="flex flex-col gap-2">
                <p className="text-[#111813] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                  {t('analytics.title', 'Dashboard de Analíticas')}
                </p>
                <p className="text-[#63886f] dark:text-gray-400 text-base font-normal leading-normal">
                  {t('analytics.subtitle', 'Reportes, métricas y exportaciones para la toma de decisiones.')}
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-lg h-10 px-4 bg-primary/20 dark:bg-primary/30 text-[#111813] dark:text-white text-sm font-bold leading-normal tracking-[0.015em]">
                {t('analytics.roleLabel', 'Manager / Admin')}
              </span>
            </div>

            {/* Filter Toolbar */}
            <FilterToolbar
              filters={filters}
              onFilterChange={updateFilters}
              onQuery={refetch}
              onExport={handleExport}
              loading={loading || exportLoading}
            />

            {/* Error State */}
            {error && (
              <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-red-500 dark:text-red-400">error</span>
                  <div>
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400">{t('analytics.errorTitle', 'Error al cargar datos')}</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && !data && (
              <div className="mt-8 flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-gray-500 dark:text-gray-400">{t('analytics.loading', 'Cargando analíticas...')}</p>
                </div>
              </div>
            )}

            {/* Data Content */}
            {!loading && !error && data && (
              <>
                {/* Stats Cards */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title={t('analytics.totalOrders', 'Total de órdenes')}
                    value={data.summary?.totalOrders || 0}
                    change={data.summary?.totalOrdersChange ?? null}
                    icon="shopping_cart"
                    format="number"
                  />
                  <StatCard
                    title={t('analytics.totalIncome', 'Ingresos totales')}
                    value={data.summary?.totalRevenue || 0}
                    change={data.summary?.totalRevenueChange ?? null}
                    icon="payments"
                    format="currency"
                  />
                  <StatCard
                    title={t('analytics.productsSold', 'Productos vendidos')}
                    value={data.productsSold?.reduce((sum, p) => sum + p.quantity, 0) || 0}
                    change={data.summary?.totalProductsSoldChange ?? null}
                    icon="inventory_2"
                    format="number"
                  />
                  <StatCard
                    title={t('analytics.topProduct', 'Producto destacado')}
                    value={data.topNProducts?.[0]?.name || 'N/A'}
                    change={null}
                    icon="star"
                    format="text"
                  />
                </div>

                {/* Charts */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <LineChart
                    data={getLineChartData()}
                    title={t('analytics.ordersPerPeriod', 'Órdenes por período')}
                    subtitle={t('analytics.last30Days', 'Últimos 30 días')}
                    value={data.summary?.totalOrders}
                    change={12.5}
                  />
                  <BarChart
                    data={getBarChartData()}
                    title={t('analytics.topProductsSold', 'Top productos vendidos')}
                    value={data.productsSold?.reduce((sum, p) => sum + p.quantity, 0) || 0}
                    change={8.2}
                  />
                </div>

                {/* Data Table */}
                <DataTable data={getTableData()} />
              </>
            )}

            {/* No Data State */}
            {!loading && !error && !data && (
              <div className="mt-8 p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">analytics</span>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t('analytics.noDataTitle', 'No hay datos disponibles')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('analytics.noDataSubtitle', 'Selecciona un rango de fechas y presiona "Consultar métricas"')}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SalesAnalyticsDashboard;
