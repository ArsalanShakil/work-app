export class RetriesExceededError extends Error {
  constructor(message = 'Retries Exceeded') {
    super(message);
    this.name = 'RetriesExceededError';
  }
}

export async function waitForIt(
  valueRetriever,
  maxRetries = 3,
  baseIntervalMs = 10,
  currentRetry = 0
) {
  return new Promise(async (resolve, reject) => {
    let value;
    try {
      value = await valueRetriever();
    } catch (err) {
      reject(err);

      return;
    }

    if (value) {
      resolve(value);

      return;
    }

    if (currentRetry >= maxRetries) {
      reject(new RetriesExceededError());

      return;
    }

    setTimeout(() => {
      waitForIt(valueRetriever, maxRetries, baseIntervalMs, currentRetry + 1)
        .then(valueFromRetry => {
          resolve(valueFromRetry);
        })
        .catch(reject);
    }, baseIntervalMs);
  });
}
