async function fetchData(
  url,
  // userId,
  method = "GET",
  body = null,
  expectResponse = true // Новый параметр
) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        //"User-ID": userId, // Добавляем userId в заголовки
      },
      body: body ? JSON.stringify(body) : null, // Преобразуем тело в JSON, если оно есть
    };

    const response = await fetch(url, options);

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
