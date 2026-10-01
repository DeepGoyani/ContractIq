import { createOpenAI } from '@ai-sdk/openai';

// Allow overriding the baseURL and API key for compatible providers (e.g. together, groq, etc)
const apiKey = process.env.AI_API_KEY || '';
const baseURL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';

export const aiProvider = createOpenAI({
  apiKey,
  baseURL,
});

export const getModel = () => {
  const modelName = process.env.AI_MODEL || 'gpt-4o-mini';
  return aiProvider(modelName);
};
