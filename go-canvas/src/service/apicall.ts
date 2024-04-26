const API_URL = "http://127.0.0.1:8000/";
const DUMMY_API_CALL = "https://dummyjson.com/auth/";

export const handleApiCall = async (
  endPoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  token: any,
  payload: any = null
) => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      body: payload ? JSON.stringify(payload) : null,
    };

    const response = await fetch(`${DUMMY_API_CALL}${endPoint}`, options);

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
  } catch (error: any) {
    throw new Error(`Something went wrong! ${error.message}`);
  }
};
