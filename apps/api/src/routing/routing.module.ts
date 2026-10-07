import { Module } from '@nestjs/common';
import { HaversineRoutingProvider } from './haversine-routing.provider';
import { ROUTING_PROVIDER } from './routing.provider';

@Module({
  providers: [HaversineRoutingProvider, { provide: ROUTING_PROVIDER, useExisting: HaversineRoutingProvider }],
  exports: [ROUTING_PROVIDER],
})
export class RoutingModule {}
