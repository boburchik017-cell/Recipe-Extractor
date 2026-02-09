
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe, RecipeIdea } from '../types';

// Per guidelines, create a new instance for each API call to ensure the latest API key is used.
const getAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey });
}

interface InlineDataPart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export async function fileToGenerativePart(file: File): Promise<InlineDataPart> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING, description: "The name of the recipe." },
    description: { type: Type.STRING, description: "A short, enticing description of the dish." },
    prepTime: { type: Type.STRING, description: "Estimated preparation time (e.g., '15 minutes')." },
    cookTime: { type: Type.STRING, description: "Estimated cooking time (e.g., '25 minutes')." },
    servings: { type: Type.STRING, description: "How many servings the recipe makes (e.g., '4 servings')." },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "An ingredient with its quantity (e.g., '1 cup all-purpose flour')." },
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "A single step in the cooking instructions." },
    },
  },
  required: ["recipeName", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions"],
};

const recipeIdeasSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The catchy name of the recipe idea." },
            description: { type: Type.STRING, description: "A brief, one-sentence enticing description of the recipe idea." },
        },
        required: ["name", "description"],
    }
};

const getLanguageName = (langCode: string) => {
    const languageMap = {
        en: 'English', es: 'Spanish', fr: 'French', uz: 'Uzbek', ru: 'Russian',
        de: 'German', it: 'Italian', pt: 'Portuguese', ja: 'Japanese', zh: 'Simplified Chinese',
        ko: 'Korean', hi: 'Hindi', ar: 'Arabic', tr: 'Turkish', nl: 'Dutch'
    };
    return languageMap[langCode as keyof typeof languageMap] || 'English';
}

const generateRecipeImage = async (recipeName: string): Promise<string | undefined> => {
    try {
        const ai = getAI();
        const prompt = `Gourmet food photography of ${recipeName}, styled for a premium cooking magazine. Natural lighting, vibrant colors, and professional plating.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return undefined;
    } catch (error) {
        console.error("Failed to generate recipe image:", error);
        return undefined;
    }
};


export const generateRecipeIdeas = async (category: string, language: string): Promise<RecipeIdea[]> => {
    const ai = getAI();
    const targetLanguage = getLanguageName(language);
    const prompt = `
        You are a recipe assistant. Generate a list of 8 popular and creative recipe ideas for the category "${category}".
        For each idea, provide a catchy name and a brief, enticing one-sentence description.
        IMPORTANT: The entire response, including names and descriptions, MUST be in ${targetLanguage}.
        Structure your response in the specified JSON format.
    `;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeIdeasSchema,
        },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Received an empty response from the AI.");
    try {
        return JSON.parse(jsonText) as RecipeIdea[];
    } catch (error) {
        console.error("Failed to parse JSON for recipe ideas:", jsonText);
        throw new Error("The AI returned an invalid list format.");
    }
}

export const searchRecipes = async (query: string, language: string): Promise<RecipeIdea[]> => {
    const ai = getAI();
    const targetLanguage = getLanguageName(language);
    const prompt = `
        You are a recipe search assistant. Find 8 relevant and creative recipe ideas based on the user's search query: "${query}".
        For each idea, provide a catchy name and a brief, enticing one-sentence description.
        IMPORTANT: The entire response, including names and descriptions, MUST be in ${targetLanguage}.
        Structure your response in the specified JSON format.
    `;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeIdeasSchema,
        },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Received an empty response from the AI.");
    try {
        return JSON.parse(jsonText) as RecipeIdea[];
    } catch (error) {
        console.error("Failed to parse JSON for recipe search:", jsonText);
        throw new Error("The AI returned an invalid list format.");
    }
};

export const generateRecipeFromName = async (recipeName: string, language: string): Promise<Omit<Recipe, 'likes' | 'isSaved' | 'comments'>> => {
    const ai = getAI();
    const targetLanguage = getLanguageName(language);
    const prompt = `
        You are a world-class culinary expert. Generate a complete, detailed, and easy-to-follow recipe for "${recipeName}".
        
        The recipe should have a standard serving size (e.g., 4-6 servings) unless the name implies a different quantity. Ensure the "servings" field in the JSON output reflects this.
        
        IMPORTANT: The entire recipe, including the recipe name, description, ingredients, and instructions, MUST be in ${targetLanguage}.
        Structure your response in the specified JSON format.
    `;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
        },
    });
    const jsonText = response.text;
    if (!jsonText) throw new Error("Received an empty response from the AI.");
    
    let recipe: Omit<Recipe, 'likes' | 'isSaved' | 'comments'>;
    try {
        recipe = JSON.parse(jsonText);
    } catch (error) {
        console.error("Failed to parse JSON for recipe details:", jsonText);
        throw new Error("The AI returned an invalid recipe format.");
    }

    const imageUrl = await generateRecipeImage(recipe.recipeName);
    recipe.imageUrl = imageUrl;
    return recipe;
};

export const generateRecipeFromVideo = async (
  videoUrl: string, 
  language: string, 
  imagePart: InlineDataPart | null,
  extraDetails: string
): Promise<Omit<Recipe, 'likes' | 'isSaved' | 'comments'>> => {
  
  const ai = getAI();
  const targetLanguage = getLanguageName(language);

  let prompt = `
    You are a world-class culinary expert who can figure out a recipe from a video URL.
    Your primary goal is to generate a detailed, easy-to-follow recipe.
    Base your recipe on the video's title, description, and any additional context provided.

    Video URL: ${videoUrl}
  `;
  
  if (imagePart) {
      prompt += `\nAn image has been provided as crucial context. Analyze it carefully to identify ingredients, the final dish, and cooking style. It is likely a screenshot from the video and should be prioritized.`;
  }

  if (extraDetails) {
    prompt += `\nAdditional User Details: "${extraDetails}"`;
  }

  prompt += `
    Please provide a complete recipe. If the information is vague, use your expertise to create the most plausible recipe.
    
    The recipe should have a standard serving size (e.g., 4-6 servings) based on the video's context. Ensure the "servings" field in the JSON output reflects this.

    IMPORTANT: The entire recipe MUST be in ${targetLanguage}.
    Structure your response in the specified JSON format.
  `;

  const contents = imagePart ? { parts: [{ text: prompt }, imagePart] } : { parts: [{ text: prompt }] };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
    },
  });

  const jsonText = response.text;
  if (!jsonText) {
    throw new Error("Received an empty response from the AI.");
  }
  
  let recipe: Omit<Recipe, 'likes' | 'isSaved' | 'comments'>;
  try {
    recipe = JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse JSON response:", jsonText);
    throw new Error("The AI returned an invalid recipe format. Please try again.");
  }
  
  const imageUrl = await generateRecipeImage(recipe.recipeName);
  recipe.imageUrl = imageUrl;
  return recipe;
};
