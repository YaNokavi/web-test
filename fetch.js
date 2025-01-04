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
    // console.log(response.json())
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

    return expectResponse ? await response.json() : null;
    //return await response.json(); // Возвращаем распарсенные данные
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    throw error; // Пробрасываем ошибку дальше
  }
}

export default fetchData;
