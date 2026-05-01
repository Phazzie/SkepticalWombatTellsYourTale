export type HealthCheckStatus = 'ok' | 'error';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  checks: {
    database: HealthCheckStatus;
    dependencies: HealthCheckStatus;
  };
  timestamp: string;
}
