import { prismaClient } from "./db";

export class DatabaseMonitor {
  private static instance: DatabaseMonitor;
  private connectionCount = 0;
  private queryCount = 0;
  private slowQueries: Array<{ query: string; duration: number; timestamp: Date }> = [];

  static getInstance() {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor();
    }
    return DatabaseMonitor.instance;
  }

  async checkConnection() {
    try {
      const start = Date.now();
      await prismaClient.$queryRaw`SELECT 1`;
      const duration = Date.now() - start;
      
      if (duration > 1000) { // Log slow queries
        this.slowQueries.push({
          query: 'Health Check',
          duration,
          timestamp: new Date()
        });
      }
      
      return { healthy: true, responseTime: duration };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { healthy: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  getStats() {
    return {
      connectionCount: this.connectionCount,
      queryCount: this.queryCount,
      slowQueries: this.slowQueries.slice(-10) // Last 10 slow queries
    };
  }

  incrementQuery() {
    this.queryCount++;
  }

  clearSlowQueries() {
    this.slowQueries = [];
  }
}