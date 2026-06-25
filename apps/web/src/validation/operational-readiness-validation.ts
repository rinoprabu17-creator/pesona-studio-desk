import { OperationalReadinessError } from "../operational-readiness-errors.ts";

export type OperationalReadinessFilters = {
  limit: number;
};

export function validateOperationalReadinessFilters(input: Record<string, string | null | undefined> = {}): OperationalReadinessFilters {
  const rawLimit = input.limit;
  if (rawLimit === null || rawLimit === undefined || rawLimit === "") {
    return { limit: 50 };
  }

  const limit = Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    throw new OperationalReadinessError(
      "operational_readiness_validation_failed",
      "Limit operational readiness harus angka 1 sampai 200.",
      400
    );
  }

  return { limit };
}
