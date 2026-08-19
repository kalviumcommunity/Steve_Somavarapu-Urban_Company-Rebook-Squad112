/**
 * Parallel Fetch Utility (Foundation for Day 5 Rebooking Flow - FR-003)
 * 
 * Executes a dictionary of named async fetchers concurrently using Promise.allSettled.
 * Prevents partial failures from aborting the entire batch, returning resolved values
 * and captured errors segregated by task key.
 * 
 * @param {Record<string, (() => Promise<any>) | Promise<any>>} fetchersMap - Map of named async tasks.
 * @returns {Promise<{ results: Record<string, any>, errors: Record<string, any>, hasErrors: boolean }>}
 */
async function parallelFetch(fetchersMap) {
  if (!fetchersMap || typeof fetchersMap !== "object") {
    return { results: {}, errors: {}, hasErrors: false };
  }

  const entries = Object.entries(fetchersMap);
  if (entries.length === 0) {
    return { results: {}, errors: {}, hasErrors: false };
  }

  const keys = entries.map(([key]) => key);
  const taskPromises = entries.map(([, fetcher]) => {
    if (typeof fetcher === "function") {
      try {
        return Promise.resolve(fetcher());
      } catch (syncError) {
        return Promise.reject(syncError);
      }
    }
    return Promise.resolve(fetcher);
  });

  const settled = await Promise.allSettled(taskPromises);

  const results = {};
  const errors = {};
  let hasErrors = false;

  settled.forEach((outcome, index) => {
    const key = keys[index];
    if (outcome.status === "fulfilled") {
      results[key] = outcome.value;
    } else {
      hasErrors = true;
      errors[key] = outcome.reason;
    }
  });

  return {
    results,
    errors,
    hasErrors,
  };
}

module.exports = {
  parallelFetch,
};
