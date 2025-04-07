export async function getLLMResponse(message, onUpdateCallback) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });
        
        if (response.headers.get('content-type')?.includes('text/event-stream')) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            let wordCount = 0;
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                
                const events = chunk.split('\n\n');
                for (const event of events) {
                    if (event.startsWith('data: ')) {
                        const data = event.substring(6).trim();
                        if (!data || data === '[DONE]') continue;
                        
                        try {
                            if (data.startsWith('{') && data.endsWith('}')) {
                                const parsed = JSON.parse(data);
                                if (parsed && parsed.content) {
                                    fullText += parsed.content;
                                    
                                    const words = fullText.split(/\s+/);
                                    if (words.length > wordCount) {
                                        wordCount = words.length;
                                        const visibleText = words.join(' ');
                                        
                                        if (onUpdateCallback) {
                                            onUpdateCallback(visibleText, fullText);
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e, 'Raw data:', data);
                        }
                    }
                }
            }
            
            return fullText;
        } else {
            const data = await response.json();
            return data.response || "Sorry, I couldn't generate a response.";
        }
    } catch (error) {
        console.error("Error getting LLM response:", error);
        return "An error occurred while generating a response.";
    }
}