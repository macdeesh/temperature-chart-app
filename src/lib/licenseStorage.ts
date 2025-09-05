const LICENSE_STORAGE_KEY = "VizTherm_license";

export function saveLicense(licenseKey: string): void {
  localStorage.setItem(LICENSE_STORAGE_KEY, licenseKey);
}

export function getSavedLicense(): string | null {
  return localStorage.getItem(LICENSE_STORAGE_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(LICENSE_STORAGE_KEY);
}