import { calculateStationReport } from './report-metrics';

describe('calculateStationReport', () => {
  it('excludes cancelled and no-show entries from service aggregates', () => {
    expect(calculateStationReport([
      { waitingSeconds: 120, serviceSeconds: 300, litres: 20, cancelled: false, noShow: false },
      { waitingSeconds: 0, serviceSeconds: 0, litres: 0, cancelled: true, noShow: false },
      { waitingSeconds: 0, serviceSeconds: 0, litres: 0, cancelled: false, noShow: true },
    ])).toEqual({ vehiclesServed: 1, litresSold: 20, averageWaitSeconds: 120, averageServiceSeconds: 300, cancellations: 1, noShows: 1 });
  });
});
