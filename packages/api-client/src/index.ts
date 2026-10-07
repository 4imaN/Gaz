import type { ApiError } from '@fuel-queue/shared-types';

export class FuelQueueApiClient {
  public constructor(private readonly baseUrl: string) {}

  public async health(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/health/live`);
    if (!response.ok) {
      throw (await response.json()) as ApiError;
    }
    return response.json();
  }
}
