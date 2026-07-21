import { env } from '../config/env';

/** Thin wait helpers — no arbitrary sleeps except documented debounce buffer. */
export async function waitForDraftPersistBuffer(): Promise<void> {
  await new Promise((resolve) =>
    setTimeout(resolve, env.draftDebounceBufferMs),
  );
}
