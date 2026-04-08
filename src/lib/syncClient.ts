let skipSaveUntil = 0;

export function suppressSave(ms = 1000) {
  skipSaveUntil = Date.now() + ms;
}

export function shouldSkipSave(): boolean {
  return Date.now() < skipSaveUntil;
}
