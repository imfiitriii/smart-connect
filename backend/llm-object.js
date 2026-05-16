const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

async function llm(key, prompt) {
    const googleLlm = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: key,
    });

    const response = await googleLlm.invoke(prompt);

    return response.content;
}

module.exports = llm;