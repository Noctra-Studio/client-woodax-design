import domainList from "disposable-email-domains/index.json";

const disposableDomains = new Set<string>(domainList);

export function isDisposableDomain(domain: string): boolean {
  const labels = domain.toLowerCase().split(".").filter(Boolean);
  if (labels.length < 2) return false;
  for (let index = 0; index <= labels.length - 2; index += 1) {
    if (disposableDomains.has(labels.slice(index).join("."))) return true;
  }
  return false;
}

export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return false;
  return isDisposableDomain(email.slice(at + 1));
}
