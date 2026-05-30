const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzAwMDMzNzMyY3NlckBnbWFpbC5jb20iLCJleHAiOjE3ODAxMjM0NDEsImlhdCI6MTc4MDEyMjU0MSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjJkMDY2NWYzLTQzY2MtNGNiOS1iYzJhLWMzYmFkYzhhNzMwMyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InBhbGd1ZGkgcHVuaXRoIHNhaSIsInN1YiI6IjMxNjAzMmQzLTM3MmItNDYwOC05MmE0LTUyOGUyNmY5ODE0ZSJ9LCJlbWFpbCI6IjIzMDAwMzM3MzJjc2VyQGdtYWlsLmNvbSIsIm5hbWUiOiJwYWxndWRpIHB1bml0aCBzYWkiLCJyb2xsTm8iOiIyMzAwMDMzNzMyIiwiYWNjZXNzQ29kZSI6IkF2ckFBSyIsImNsaWVudElEIjoiMzE2MDMyZDMtMzcyYi00NjA4LTkyYTQtNTI4ZTI2Zjk4MTRlIiwiY2xpZW50U2VjcmV0IjoiR3lkSHZnSGh2ZEJzclh6USJ9.Q2ceO6za5OS9emZITsHhj8TuGm1Zh7YQDXCtQTnz9n0";

export async function Log(stack, level, pkg, message) {
  try {
    const response = await fetch(
      "http://4.224.186.213/evaluation-service/logs",
      {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          stack,
          level,
          package: pkg,
          message,
        }),
      }
    );

    const data = await response.json();
    console.log("Log Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Logging failed:", error);
  }
}