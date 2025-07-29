async function fetchData(
  url,
  method = "GET",
  headers = {},
  body = null,
  expectResponse = true,
  maxAttempts = 3
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : null,
      };

      const urlDomain = "https://cryptunatest-anderm.amvera.io/v1/" + url;

      const response = await fetch(urlDomain, options);

      class HttpError extends Error {
        constructor(message, status) {
          super(message);
          this.name = "HttpError";
          this.status = status;
        }
      }

      if (!response.ok) {
        throw new HttpError(`Ошибка`, response.status);
      }

      return expectResponse ? await response.json() : response.status;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      if (error.status >= 400 && error.status < 500) {
        console.error("Ошибка при выполнении запроса:", error.status);
        throw error;
      } else {
        await new Promise((res) => setTimeout(res, 500 * attempt));
      }
    }
  }
}

export default fetchData;
