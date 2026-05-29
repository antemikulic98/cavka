/**
 * Resource Monitoring & Intrusion Detection
 * Detects crypto miners, reverse shells, and suspicious processes
 */

import { execSync } from 'child_process';

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
  type: 'memory' | 'cpu' | 'sustained_high_usage' | 'suspicious_process';
  severity: 'warning' | 'critical';
  message: string;
  metrics: ResourceMetrics;
}

// Known crypto miner and malware process names/patterns
const SUSPICIOUS_PROCESS_NAMES = [
  'xmrig', 'xmr-stak', 'minerd', 'minergate', 'cpuminer',
  'ccminer', 'cgminer', 'bfgminer', 'ethminer', 'nbminer',
  'kswapd0', 'kworkerds', 'solr', 'httpsd',
  '/tmp/', '/dev/shm/', '/var/tmp/',
  'nc -', 'ncat ', 'bash -i', '/bin/sh -i',
  'python -c', 'perl -e', 'ruby -e',
  'curl | sh', 'wget | sh', 'curl|sh', 'wget|sh',
  '/sbin/init splash', // the exact miner found in our incident
];

// Processes that are expected to run
const ALLOWED_PROCESSES = [
  'node', 'next-server', 'yarn', 'npm', 'sharp', 'ps',
];

class ResourceMonitor {
  private config: Required<MonitoringConfig>;
  private metrics: ResourceMetrics[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private maxMetricsHistory = 100;
  private alertsSent = new Set<string>();

  constructor(config: MonitoringConfig = {}) {
    this.config = {
      memoryThresholdMB: config.memoryThresholdMB || 512,
      cpuThresholdPercent: config.cpuThresholdPercent || 70,
      checkIntervalMs: config.checkIntervalMs || 60000,
      alertCallback: config.alertCallback || this.defaultAlertHandler,
    };
  }

  private getCurrentMetrics(): ResourceMetrics {
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

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
   * Scan running processes for crypto miners and suspicious activity
   */
  public scanProcesses(): { suspicious: boolean; findings: string[] } {
    const findings: string[] = [];

    try {
      const psOutput = execSync('ps aux 2>/dev/null || ps -ef 2>/dev/null', {
        timeout: 5000,
        encoding: 'utf-8',
      });

      const lines = psOutput.split('\n').filter(Boolean);

      for (const line of lines) {
        const lineLower = line.toLowerCase();

        // Check against known suspicious patterns
        for (const pattern of SUSPICIOUS_PROCESS_NAMES) {
          if (lineLower.includes(pattern.toLowerCase())) {
            findings.push(`Suspicious process detected: ${line.trim().substring(0, 200)}`);
          }
        }

        // Detect high-CPU processes that aren't ours
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 11) {
          const cpuPercent = parseFloat(parts[2]);
          const command = parts.slice(10).join(' ');
          const isAllowed = ALLOWED_PROCESSES.some(p => command.toLowerCase().includes(p));

          // Flag unknown processes using >5% CPU
          if (cpuPercent > 5 && !isAllowed && !command.includes('ps aux')) {
            findings.push(`High-CPU unknown process (${cpuPercent}% CPU): ${command.substring(0, 200)}`);
          }
        }
      }

      // Check for zombie processes (sign of exploitation)
      const zombies = lines.filter(l => l.includes('<defunct>'));
      if (zombies.length > 3) {
        findings.push(`${zombies.length} zombie processes detected (possible exploitation remnants)`);
      }

    } catch (err) {
      // ps command might not be available in all containers
    }

    return { suspicious: findings.length > 0, findings };
  }

  /**
   * Check for suspicious network connections
   */
  public scanConnections(): string[] {
    const findings: string[] = [];

    try {
      // Check for unusual outbound connections (mining pools, C2 servers)
      const netstat = execSync(
        'ss -tnp 2>/dev/null || netstat -tnp 2>/dev/null || echo ""',
        { timeout: 5000, encoding: 'utf-8' }
      );

      const lines = netstat.split('\n').filter(Boolean);
      // Mining pools typically use ports 3333, 4444, 5555, 8333, 14433, 14444
      const suspiciousPorts = ['3333', '4444', '5555', '8333', '14433', '14444', '45700'];

      for (const line of lines) {
        for (const port of suspiciousPorts) {
          if (line.includes(`:${port}`) && !line.includes('127.0.0.1')) {
            findings.push(`Suspicious outbound connection to mining port ${port}: ${line.trim().substring(0, 200)}`);
          }
        }
      }
    } catch (err) {
      // Network tools might not be available
    }

    return findings;
  }

  private checkThresholds(metrics: ResourceMetrics): void {
    if (metrics.memoryUsageMB > this.config.memoryThresholdMB) {
      this.config.alertCallback({
        type: 'memory',
        severity: metrics.memoryUsageMB > this.config.memoryThresholdMB * 1.5 ? 'critical' : 'warning',
        message: `High memory usage detected: ${metrics.memoryUsageMB}MB (threshold: ${this.config.memoryThresholdMB}MB)`,
        metrics,
      });
    }

    if (metrics.cpuUsage > this.config.cpuThresholdPercent) {
      this.config.alertCallback({
        type: 'cpu',
        severity: metrics.cpuUsage > this.config.cpuThresholdPercent * 1.2 ? 'critical' : 'warning',
        message: `High CPU usage detected: ${metrics.cpuUsage}% (threshold: ${this.config.cpuThresholdPercent}%)`,
        metrics,
      });
    }

    // Sustained high usage check (crypto mining indicator)
    if (this.metrics.length >= 5) {
      const recent = this.metrics.slice(-5);
      const avgCpu = recent.reduce((sum, m) => sum + m.cpuUsage, 0) / 5;
      const avgMemory = recent.reduce((sum, m) => sum + m.memoryUsageMB, 0) / 5;

      if (avgCpu > this.config.cpuThresholdPercent && avgMemory > this.config.memoryThresholdMB) {
        this.config.alertCallback({
          type: 'sustained_high_usage',
          severity: 'critical',
          message: `Sustained high resource usage over 5 minutes. Avg CPU: ${avgCpu.toFixed(1)}%, Avg Memory: ${avgMemory.toFixed(0)}MB. Possible crypto mining.`,
          metrics,
        });
      }
    }
  }

  /**
   * Run full security scan (processes + connections + resources)
   */
  public runSecurityScan(): {
    suspicious: boolean;
    processFindings: string[];
    connectionFindings: string[];
    metrics: ResourceMetrics;
  } {
    const processScan = this.scanProcesses();
    const connectionFindings = this.scanConnections();
    const metrics = this.getCurrentMetrics();

    const allFindings = [...processScan.findings, ...connectionFindings];

    if (allFindings.length > 0) {
      // Only alert once per unique finding to avoid spam
      const newFindings = allFindings.filter(f => {
        const key = f.substring(0, 50);
        if (this.alertsSent.has(key)) return false;
        this.alertsSent.add(key);
        return true;
      });

      if (newFindings.length > 0) {
        console.error('[SECURITY ALERT] Suspicious activity detected:');
        newFindings.forEach(f => console.error(`  - ${f}`));

        this.config.alertCallback({
          type: 'suspicious_process',
          severity: 'critical',
          message: `INTRUSION DETECTED: ${newFindings.join('; ')}`,
          metrics,
        });
      }
    }

    return {
      suspicious: allFindings.length > 0,
      processFindings: processScan.findings,
      connectionFindings,
      metrics,
    };
  }

  private defaultAlertHandler(alert: ResourceAlert): void {
    if (alert.severity === 'critical') {
      console.error(`[SECURITY] CRITICAL: ${alert.message}`);
    } else {
      console.warn(`[SECURITY] WARNING: ${alert.message}`);
    }
  }

  public startMonitoring(): void {
    if (this.monitoringInterval) return;

    console.log('[MONITOR] Starting resource monitoring + intrusion detection');

    // Initial security scan on startup
    const initialScan = this.runSecurityScan();
    if (initialScan.suspicious) {
      console.error('[MONITOR] ALERT: Suspicious activity found on startup!');
    }

    this.monitoringInterval = setInterval(() => {
      const metrics = this.getCurrentMetrics();
      this.metrics.push(metrics);

      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics.shift();
      }

      this.checkThresholds(metrics);

      // Run process scan every 5 minutes (every 5th interval at 60s)
      if (this.metrics.length % 5 === 0) {
        this.runSecurityScan();
      }
    }, this.config.checkIntervalMs);
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  public getMetricsHistory(): ResourceMetrics[] {
    return [...this.metrics];
  }

  public getAverageMetrics(minutes: number = 5): ResourceMetrics | null {
    if (this.metrics.length === 0) return null;

    const cutoffTime = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > cutoffTime);

    if (recentMetrics.length === 0) return null;

    return {
      timestamp: new Date(),
      memoryUsageMB: Math.round(recentMetrics.reduce((sum, m) => sum + m.memoryUsageMB, 0) / recentMetrics.length),
      memoryPercentage: Math.round(recentMetrics.reduce((sum, m) => sum + m.memoryPercentage, 0) / recentMetrics.length),
      cpuUsage: Math.round(recentMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / recentMetrics.length),
      processUptime: process.uptime(),
    };
  }
}

export const resourceMonitor = new ResourceMonitor({
  memoryThresholdMB: 512,
  cpuThresholdPercent: 70,
  checkIntervalMs: 60000,
});

if (process.env.NODE_ENV === 'production') {
  resourceMonitor.startMonitoring();
}

export { ResourceMonitor };
export type { ResourceMetrics, ResourceAlert, MonitoringConfig };
