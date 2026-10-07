import { Injectable } from '@nestjs/common';
import type { RoutingProvider, TravelTimeRequest, TravelTimeResult } from './routing.provider';

const EARTH_RADIUS_METRES = 6_371_000;
const DEVELOPMENT_SPEED_METRES_PER_SECOND = 6.94; // 25 km/h

@Injectable()
export class HaversineRoutingProvider implements RoutingProvider {
  public async estimateTravelTime(input: TravelTimeRequest): Promise<TravelTimeResult> {
    const radians = (degrees: number) => (degrees * Math.PI) / 180;
    const latitudeDelta = radians(input.destination.latitude - input.origin.latitude);
    const longitudeDelta = radians(input.destination.longitude - input.origin.longitude);
    const a =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(radians(input.origin.latitude)) *
        Math.cos(radians(input.destination.latitude)) *
        Math.sin(longitudeDelta / 2) ** 2;
    const distanceMetres = 2 * EARTH_RADIUS_METRES * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return {
      distanceMetres: Math.round(distanceMetres),
      durationSeconds: Math.ceil(distanceMetres / DEVELOPMENT_SPEED_METRES_PER_SECOND),
      trafficAware: false,
    };
  }
}
