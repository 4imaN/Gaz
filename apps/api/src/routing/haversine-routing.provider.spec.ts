import { HaversineRoutingProvider } from './haversine-routing.provider';

describe('HaversineRoutingProvider', () => {
  it('returns zero travel time for identical coordinates', async () => {
    const provider = new HaversineRoutingProvider();
    await expect(provider.estimateTravelTime({ origin: { latitude: 9, longitude: 38 }, destination: { latitude: 9, longitude: 38 } }))
      .resolves.toMatchObject({ distanceMetres: 0, durationSeconds: 0, trafficAware: false });
  });
});
