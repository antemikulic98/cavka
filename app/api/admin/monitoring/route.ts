import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security';
import { resourceMonitor } from '@/lib/monitoring';

/**
 * GET /api/admin/monitoring
 * View current resource usage and metrics history
 */
export async function GET(request: NextRequest) {
  // Security: Require admin authentication
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const minutes = parseInt(searchParams.get('minutes') || '5');

    // Get current metrics
    const currentMetrics = process.memoryUsage();
    const memoryUsageMB = Math.round(currentMetrics.heapUsed / 1024 / 1024);
    const totalMemoryMB = Math.round(currentMetrics.heapTotal / 1024 / 1024);
    const memoryPercentage = Math.round((currentMetrics.heapUsed / currentMetrics.heapTotal) * 100);

    // Validate minutes param
    const clampedMinutes = Math.max(1, Math.min(minutes, 1440));

    // Get average metrics
    const avgMetrics = resourceMonitor.getAverageMetrics(clampedMinutes);

    // Get metrics history
    const history = resourceMonitor.getMetricsHistory();

    // Run security scan
    const securityScan = resourceMonitor.runSecurityScan();

    return NextResponse.json({
      success: true,
      current: {
        timestamp: new Date().toISOString(),
        memory: {
          usedMB: memoryUsageMB,
          totalMB: totalMemoryMB,
          percentage: memoryPercentage,
        },
        uptime: Math.round(process.uptime() / 60),
      },
      average: avgMetrics ? {
        memoryMB: avgMetrics.memoryUsageMB,
        memoryPercentage: avgMetrics.memoryPercentage,
        cpuPercentage: avgMetrics.cpuUsage,
        timeWindowMinutes: clampedMinutes,
      } : null,
      history: history.map(m => ({
        timestamp: m.timestamp.toISOString(),
        memoryMB: m.memoryUsageMB,
        memoryPercentage: m.memoryPercentage,
        cpuPercentage: m.cpuUsage,
      })),
      security: {
        status: securityScan.suspicious ? 'ALERT' : 'clean',
        processFindings: securityScan.processFindings,
        connectionFindings: securityScan.connectionFindings,
      },
      healthCheck: {
        status: securityScan.suspicious ? 'compromised'
          : (memoryUsageMB > 512 || (avgMetrics && avgMetrics.cpuUsage > 70)) ? 'warning'
          : 'healthy',
        warnings: [
          securityScan.suspicious && 'SUSPICIOUS PROCESSES DETECTED',
          memoryUsageMB > 512 && `High memory usage: ${memoryUsageMB}MB`,
          avgMetrics && avgMetrics.cpuUsage > 70 && `High CPU usage: ${avgMetrics.cpuUsage}%`,
        ].filter(Boolean),
      },
    });
  } catch (error) {
    console.error('Monitoring retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve monitoring data' },
      { status: 500 }
    );
  }
}
