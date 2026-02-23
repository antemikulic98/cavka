/**
 * Resource Monitoring Utilities
 * Helps detect unusual CPU/memory usage patterns that could indicate crypto mining
 */

interface ResourceMetrics {
  timestamp: Date;
  memoryUsageMB: number;
  memoryPercentage: number;
  cpuUsage: number;
  processUptime: number;
}

interface MonitoringConfig {
  memoryThresholdMB?: number;
  cpuThresholdPercent?: number;
  checkIntervalMs?: number;
  alertCallback?: (alert: ResourceAlert) => void;
}

interface ResourceAlert {
  type: 'memory' | 'cpu' | 'sustained_high_usage';
  severity: 'warning' | 'critical';
  message: string;
  metrics: ResourceMetrics;
}

class ResourceMonitor {
  private config: Required<MonitoringConfig>;
  private metrics: ResourceMetrics[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private maxMetricsHistory = 100;

  constructor(config: MonitoringConfig = {}) {
    this.config = {
      memoryThresholdMB: config.memoryThresholdMB || 512, // Alert if memory exceeds 512MB
      cpuThresholdPercent: config.cpuThresholdPercent || 70, // Alert if CPU exceeds 70%
      checkIntervalMs: config.checkIntervalMs || 60000, // Check every minute
      alertCallback: config.alertCallback || this.defaultAlertHandler,
    };
  }

  /**
   * Get current resource usage
   */
  private getCurrentMetrics(): ResourceMetrics {
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

    // Approximate CPU usage (simplified - use 'pidusage' package for accurate CPU monitoring)
    const cpuUsage = process.cpuUsage();
    const cpuPercentage = Math.round(
      ((cpuUsage.user + cpuUsage.system) / 1000000 / process.uptime()) * 100
    );

    return {
      timestamp: new Date(),
      memoryUsageMB,
      memoryPercentage,
      cpuUsage: cpuPercentage,
      processUptime: process.uptime(),
    };
  }

  /**
   * Check if current metrics exceed thresholds
   */
  private checkThresholds(metrics: ResourceMetrics): void {
    // Memory threshold check
    if (metrics.memoryUsageMB > this.config.memoryThresholdMB) {
      this.config.alertCallback({
        type: 'memory',
        severity: metrics.memoryUsageMB > this.config.memoryThresholdMB * 1.5 ? 'critical' : 'warning',
        message: `High memory usage detected: ${metrics.memoryUsageMB}MB (threshold: ${this.config.memoryThresholdMB}MB)`,
        metrics,
      });
    }

    // CPU threshold check
    if (metrics.cpuUsage > this.config.cpuThresholdPercent) {
      this.config.alertCallback({
        type: 'cpu',
        severity: metrics.cpuUsage > this.config.cpuThresholdPercent * 1.2 ? 'critical' : 'warning',
        message: `High CPU usage detected: ${metrics.cpuUsage}% (threshold: ${this.config.cpuThresholdPercent}%)`,
        metrics,
      });
    }

    // Check for sustained high usage (potential crypto mining indicator)
    if (this.metrics.length >= 5) {
      const recent = this.metrics.slice(-5);
      const avgCpu = recent.reduce((sum, m) => sum + m.cpuUsage, 0) / 5;
      const avgMemory = recent.reduce((sum, m) => sum + m.memoryUsageMB, 0) / 5;

      if (avgCpu > this.config.cpuThresholdPercent && avgMemory > this.config.memoryThresholdMB) {
        this.config.alertCallback({
          type: 'sustained_high_usage',
          severity: 'critical',
          message: `Sustained high resource usage detected over 5 minutes. Avg CPU: ${avgCpu.toFixed(1)}%, Avg Memory: ${avgMemory.toFixed(0)}MB. This could indicate crypto mining or memory leak.`,
          metrics,
        });
      }
    }
  }

  /**
   * Default alert handler - logs to console
   */
  private defaultAlertHandler(alert: ResourceAlert): void {
    const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';
    console.warn(`${emoji} [RESOURCE MONITOR] ${alert.severity.toUpperCase()}: ${alert.message}`);
    console.warn('Metrics:', {
      memory: `${alert.metrics.memoryUsageMB}MB (${alert.metrics.memoryPercentage}%)`,
      cpu: `${alert.metrics.cpuUsage}%`,
      uptime: `${Math.round(alert.metrics.processUptime / 60)}min`,
    });
  }

  /**
   * Start monitoring
   */
  public startMonitoring(): void {
    if (this.monitoringInterval) {
      console.warn('[RESOURCE MONITOR] Monitoring already started');
      return;
    }

    console.log(`[RESOURCE MONITOR] Starting resource monitoring (interval: ${this.config.checkIntervalMs}ms)`);
    console.log(`[RESOURCE MONITOR] Thresholds - Memory: ${this.config.memoryThresholdMB}MB, CPU: ${this.config.cpuThresholdPercent}%`);

    // Initial check
    const initialMetrics = this.getCurrentMetrics();
    this.metrics.push(initialMetrics);
    console.log('[RESOURCE MONITOR] Initial metrics:', {
      memory: `${initialMetrics.memoryUsageMB}MB (${initialMetrics.memoryPercentage}%)`,
      cpu: `${initialMetrics.cpuUsage}%`,
    });

    this.monitoringInterval = setInterval(() => {
      const metrics = this.getCurrentMetrics();
      this.metrics.push(metrics);

      // Keep only recent history
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics.shift();
      }

      this.checkThresholds(metrics);
    }, this.config.checkIntervalMs);
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[RESOURCE MONITOR] Monitoring stopped');
    }
  }

  /**
   * Get metrics history
   */
  public getMetricsHistory(): ResourceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get average metrics over last N minutes
   */
  public getAverageMetrics(minutes: number = 5): ResourceMetrics | null {
    if (this.metrics.length === 0) return null;

    const cutoffTime = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > cutoffTime);

    if (recentMetrics.length === 0) return null;

    const avg = {
      timestamp: new Date(),
      memoryUsageMB: Math.round(recentMetrics.reduce((sum, m) => sum + m.memoryUsageMB, 0) / recentMetrics.length),
      memoryPercentage: Math.round(recentMetrics.reduce((sum, m) => sum + m.memoryPercentage, 0) / recentMetrics.length),
      cpuUsage: Math.round(recentMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / recentMetrics.length),
      processUptime: process.uptime(),
    };

    return avg;
  }
}

// Export singleton instance
export const resourceMonitor = new ResourceMonitor({
  memoryThresholdMB: 512,
  cpuThresholdPercent: 70,
  checkIntervalMs: 60000, // Check every minute
});

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  resourceMonitor.startMonitoring();
}

export { ResourceMonitor };
export type { ResourceMetrics, ResourceAlert, MonitoringConfig };
