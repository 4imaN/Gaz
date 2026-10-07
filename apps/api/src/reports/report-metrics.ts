export interface CompletedService {
  waitingSeconds: number;
  serviceSeconds: number;
  litres: number;
  cancelled: boolean;
  noShow: boolean;
}

export interface StationReportMetrics {
  vehiclesServed: number;
  litresSold: number;
  averageWaitSeconds: number;
  averageServiceSeconds: number;
  cancellations: number;
  noShows: number;
}

export function calculateStationReport(services: CompletedService[]): StationReportMetrics {
  const served = services.filter((service) => !service.cancelled && !service.noShow);
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
  return {
    vehiclesServed: served.length,
    litresSold: sum(served.map((service) => service.litres)),
    averageWaitSeconds: served.length ? Math.round(sum(served.map((service) => service.waitingSeconds)) / served.length) : 0,
    averageServiceSeconds: served.length ? Math.round(sum(served.map((service) => service.serviceSeconds)) / served.length) : 0,
    cancellations: services.filter((service) => service.cancelled).length,
    noShows: services.filter((service) => service.noShow).length,
  };
}
