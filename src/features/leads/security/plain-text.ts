const URL_IN_TEXT =
  /(?:[a-z][a-z0-9+.-]*:[^\s]+|www\.[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi;

/** Breaks auto-linking in mail clients without turning the text into an anchor. */
export function defangUrls(value: string): string {
  return value.replace(URL_IN_TEXT, (match) =>
    match.replace(/\./g, ".\u200b").replace(":", ":\u200b"),
  );
}
