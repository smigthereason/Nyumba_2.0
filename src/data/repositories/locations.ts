import { counties as mockCounties, defaultCounty } from '../mock/locations';
import { County } from '../types';

export async function getCounties(): Promise<County[]> {
  return mockCounties;
}

export async function getCountyByName(name: string): Promise<County | null> {
  return mockCounties.find((c) => c.name === name) ?? null;
}

export function getDefaultCountyName(): string {
  return defaultCounty;
}

export function getEstatesForCounty(countyName: string): string[] {
  return mockCounties.find((c) => c.name === countyName)?.estates ?? [];
}
