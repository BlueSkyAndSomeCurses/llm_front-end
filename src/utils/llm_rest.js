import axios from "axios";

export async function getLLMResponse(message) {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
            "/api/chat",
            {message, model: localStorage.getItem("selectedModel")},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("response from llm", response.data);
        return response.data.response;
    } catch (error) {
        console.error("Error getting LLM response:", error);
        throw error;
    }
}
