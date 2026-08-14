const CHAT_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'meta/llama-3.1-8b-instruct';

// Sends a single-turn chat completion request to NVIDIA NIM and returns the
// assistant's raw text reply.
export const chatComplete = async (messages, { maxTokens = 300, temperature = 0 } = {}) => {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
};
