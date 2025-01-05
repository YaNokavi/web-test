async function fetchData(
  url,
  method = "GET",
  body = null,
  expectResponse = true
) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null, // Преобразуем тело в JSON, если оно есть
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      alert("Сервер не отвечает");
      throw new Error(`Ошибка: ${response.status}`);
    }

    return expectResponse ? await response.json() : null;
  } catch (error) {
    // if (error == "TypeError: Load failed") {
    //   alert("Сервер не отвечает");
    // }
    console.error("Ошибка при выполнении запроса:", error);
    throw error; // Пробрасываем ошибку дальше
  }
}

export default fetchData;
