export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface TravelTimeRequest {
  origin: Coordinates;
  destination: Coordinates;
}

export interface TravelTimeResult {
  durationSeconds: number;
  distanceMetres: number;
  trafficAware: boolean;
}

export interface RoutingProvider {
  estimateTravelTime(input: TravelTimeRequest): Promise<TravelTimeResult>;
}

export const ROUTING_PROVIDER = Symbol('ROUTING_PROVIDER');
