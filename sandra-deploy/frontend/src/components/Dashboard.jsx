import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Phone, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  Calendar,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCalls: 0,
    activeCalls: 0,
    completedCalls: 0,
    failedCalls: 0,
    totalAgents: 0,
    activeAgents: 0,
    avgCallDuration: 0,
    successRate: 0,
    totalRevenue: 0,
    costPerCall: 0
  });

  const [recentCalls, setRecentCalls] = useState([]);
  const [agents, setAgents] = useState([]);
  const [analytics, setAnalytics] = useState({
    callsByHour: [],
    callsByDay: [],
    callsByStatus: []
  });

  const [filters, setFilters] = useState({
    dateRange: 'today',
    status: 'all',
    agent: 'all',
    searchTerm: ''
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh cada 30s
    return () => clearInterval(interval);
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Cargar estadísticas
      const statsResponse = await fetch('/api/dashboard/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Cargar llamadas recientes
      const callsResponse = await fetch('/api/dashboard/recent-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...filters, limit: 10 })
      });
      const callsData = await callsResponse.json();
      setRecentCalls(callsData);

      // Cargar agentes
      const agentsResponse = await fetch('/api/dashboard/agents');
      const agentsData = await agentsResponse.json();
      setAgents(agentsData);

      // Cargar analytics
      const analyticsResponse = await fetch('/api/dashboard/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await fetch('/api/dashboard/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...filters, format })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% vs anterior
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const CallRow = ({ call }) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    const statusIcons = {
      completed: CheckCircle,
      active: Activity,
      failed: AlertCircle,
      pending: Clock
    };

    const StatusIcon = statusIcons[call.status];

    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <StatusIcon className="w-5 h-5 mr-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {call.id.substring(0, 8)}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{call.customerName}</div>
          <div className="text-sm text-gray-500">{call.phoneNumber}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[call.status]}`}>
            {call.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {call.duration ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` : '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {call.agentName}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(call.createdAt).toLocaleString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button 
            onClick={() => window.location.href = `/calls/${call.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Ver detalles
          </button>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Última actualización: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rango de Fecha
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="completed">Completadas</option>
              <option value="active">Activas</option>
              <option value="failed">Fallidas</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agente
            </label>
            <select
              value={filters.agent}
              onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="ID, teléfono, nombre..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={Phone}
          title="Total Llamadas"
          value={stats.totalCalls.toLocaleString()}
          change={12.5}
          color="bg-blue-500"
        />
        <StatCard
          icon={Activity}
          title="Llamadas Activas"
          value={stats.activeCalls}
          color="bg-green-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Tasa de Éxito"
          value={`${stats.successRate}%`}
          change={5.2}
          color="bg-purple-500"
        />
        <StatCard
          icon={DollarSign}
          title="Costo Promedio"
          value={`$${stats.costPerCall.toFixed(2)}`}
          change={-3.1}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Llamadas por Hora */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Llamadas por Hora</h2>
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <div className="h-64">
            {analytics.callsByHour.length > 0 ? (
              <div className="flex items-end justify-between h-full space-x-2">
                {analytics.callsByHour.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-indigo-500 rounded-t-lg hover:bg-indigo-600 transition-colors cursor-pointer"
                      style={{ height: `${(item.count / Math.max(...analytics.callsByHour.map(i => i.count))) * 100}%` }}
                      title={`${item.hour}:00 - ${item.count} llamadas`}
                    />
                    <span className="text-xs text-gray-500 mt-2">{item.hour}h</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>

        {/* Distribución por Estado */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Estado de Llamadas</h2>
            <PieChart className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analytics.callsByStatus.map((item, index) => {
              const colors = {
                completed: 'bg-green-500',
                active: 'bg-blue-500',
                failed: 'bg-red-500',
                pending: 'bg-yellow-500'
              };
              const percentage = (item.count / stats.totalCalls * 100).toFixed(1);
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[item.status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agentes Activos */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Agentes Activos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${agent.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="font-medium text-gray-900">{agent.name}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Llamadas:</span>
                  <span className="font-medium">{agent.totalCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span>Éxito:</span>
                  <span className="font-medium">{agent.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración Prom:</span>
                  <span className="font-medium">{agent.avgDuration}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Llamadas Recientes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Llamadas Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCalls.map(call => (
                <CallRow key={call.id} call={call} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;