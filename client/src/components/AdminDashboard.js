import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Admin Dashboard Component
 * 
 * Provides system monitoring and management capabilities
 * 
 * Features:
 * - System health overview
 * - User management
 * - Task monitoring
 * - Analytics
 * - Feature flag control
 */
function AdminDashboard() {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0 },
    tasks: { total: 0, completed: 0, failed: 0, pending: 0 },
    system: { uptime: 0, status: 'unknown' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [healthRes, metricsRes] = await Promise.all([
        axios.get('/api/health'),
        axios.get('/api/metrics/json').catch(() => ({ data: {} }))
      ]);

      setStats({
        users: {
          total: metricsRes.data.users_total || 0,
          active: metricsRes.data.users_active || 0
        },
        tasks: {
          total: metricsRes.data.tasks_total || 0,
          completed: metricsRes.data.tasks_completed || 0,
          failed: metricsRes.data.tasks_failed || 0,
          pending: metricsRes.data.tasks_pending || 0
        },
        system: {
          uptime: healthRes.data.uptime || 0,
          status: healthRes.data.status || 'unknown',
          database: healthRes.data.database || 'unknown'
        }
      });

      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <button onClick={fetchDashboardData} style={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        {['overview', 'users', 'tasks', 'system'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {})
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={styles.content}>
          <div style={styles.grid}>
            {/* System Status Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>System Status</h3>
              <div style={styles.cardContent}>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Status:</span>
                  <span style={{
                    ...styles.statValue,
                    color: stats.system.status === 'ok' ? '#10b981' : '#ef4444'
                  }}>
                    {stats.system.status === 'ok' ? '✅ Healthy' : '❌ Issues'}
                  </span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Database:</span>
                  <span style={{
                    ...styles.statValue,
                    color: stats.system.database === 'connected' ? '#10b981' : '#ef4444'
                  }}>
                    {stats.system.database === 'connected' ? '✅ Connected' : '❌ Disconnected'}
                  </span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Uptime:</span>
                  <span style={styles.statValue}>{formatUptime(stats.system.uptime)}</span>
                </div>
              </div>
            </div>

            {/* Users Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Users</h3>
              <div style={styles.cardContent}>
                <div style={styles.bigStat}>
                  <div style={styles.bigNumber}>{stats.users.total}</div>
                  <div style={styles.bigLabel}>Total Users</div>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Active:</span>
                  <span style={styles.statValue}>{stats.users.active}</span>
                </div>
              </div>
            </div>

            {/* Tasks Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Tasks</h3>
              <div style={styles.cardContent}>
                <div style={styles.bigStat}>
                  <div style={styles.bigNumber}>{stats.tasks.total}</div>
                  <div style={styles.bigLabel}>Total Tasks</div>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Completed:</span>
                  <span style={{...styles.statValue, color: '#10b981'}}>{stats.tasks.completed}</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Failed:</span>
                  <span style={{...styles.statValue, color: '#ef4444'}}>{stats.tasks.failed}</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Pending:</span>
                  <span style={{...styles.statValue, color: '#f59e0b'}}>{stats.tasks.pending}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Quick Actions</h3>
              <div style={styles.cardContent}>
                <button style={styles.actionButton}>View Logs</button>
                <button style={styles.actionButton}>Manage Users</button>
                <button style={styles.actionButton}>Feature Flags</button>
                <button style={styles.actionButton}>System Settings</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={styles.content}>
          <h2>User Management</h2>
          <p>User management features coming soon...</p>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div style={styles.content}>
          <h2>Task Monitoring</h2>
          <p>Task monitoring features coming soon...</p>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div style={styles.content}>
          <h2>System Settings</h2>
          <p>System configuration features coming soon...</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0
  },
  refreshButton: {
    padding: '10px 20px',
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #e5e7eb'
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s',
    marginBottom: '-2px'
  },
  activeTab: {
    color: '#3B82F6',
    borderBottom: '2px solid #3B82F6'
  },
  content: {
    marginTop: '20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 0,
    marginBottom: '16px'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '16px',
    color: '#1a1a1a',
    fontWeight: '600'
  },
  bigStat: {
    textAlign: 'center',
    padding: '12px 0'
  },
  bigNumber: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#3B82F6',
    lineHeight: 1
  },
  bigLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '8px'
  },
  actionButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.2s'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#6b7280'
  },
  error: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    border: '1px solid #fecaca'
  }
};

export default AdminDashboard;
