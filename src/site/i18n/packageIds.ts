// Kept apart from packages.ts (big texts) so the router and App can validate a package URL without loading them.
export const PACKAGE_IDS = ['crm', 'website', 'booking', 'assistant', 'invoices', 'qr'] as const;
export type PackageId = (typeof PACKAGE_IDS)[number];
