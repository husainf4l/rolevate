export function getCompanySizeCategory(numberOfEmployees?: number | null): string {
  if (!numberOfEmployees) return 'UNKNOWN';
  
  if (numberOfEmployees <= 10) return 'STARTUP';
  if (numberOfEmployees <= 50) return 'SMALL';
  if (numberOfEmployees <= 200) return 'MEDIUM';
  if (numberOfEmployees <= 1000) return 'LARGE';
  return 'ENTERPRISE';
}

export function getCompanySizeRange(numberOfEmployees?: number | null): string {
  if (!numberOfEmployees) return 'Unknown';
  
  if (numberOfEmployees <= 10) return '1-10 employees';
  if (numberOfEmployees <= 50) return '11-50 employees';
  if (numberOfEmployees <= 200) return '51-200 employees';
  if (numberOfEmployees <= 1000) return '201-1000 employees';
  return '1000+ employees';
}
