
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe, RecipeIdea } from '../types';

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
    description: { type: Type.STRING, description: "A professional and enticing description." },
    prepTime: { type: Type.STRING, description: "e.g., '10 mins'" },
    cookTime: { type: Type.STRING, description: "e.g., '20 mins'" },
    servings: { type: Type.STRING, description: "e.g., '2 servings'" },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "Ingredient with quantity." },
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "Clear cooking step." },
    },
  },
  required: ["recipeName", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions"],
};

const recipeIdeasSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
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
        const prompt = `Professional food photography of ${recipeName}, high-end restaurant style, shallow depth of field, natural soft light, appetizing textures.`;
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
        return undefined;
    }
};


export const generateRecipeIdeas = async (category: string, language: string): Promise<RecipeIdea[]> => {
    const ai = getAI();
    const targetLanguage = getLanguageName(language);
    const prompt = `
        You are ChefSnap's content curator. List 8 creative and currently trending recipe ideas for "${category}".
        Output in ${targetLanguage}.
    `;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeIdeasSchema,
        },
    });

    try {
        return JSON.parse(response.text) as RecipeIdea[];
    } catch (error) {
        throw new Error("Invalid format received.");
    }
}

export const searchRecipes = async (query: string, language: string): Promise<RecipeIdea[]> => {
    const ai = getAI();
    const targetLanguage = getLanguageName(language);
    const prompt = `
        Search ChefSnap's library for 8 recipes matching: "${query}".
        Output in ${targetLanguage}.
    `;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeIdeasSchema,
        },
    });

    try {
        return JSON.parse(response.text) as RecipeIdea[];
    } catch (error) {
        throw new Error("Invalid format received.");
    }
};

export const generateRecipeFromName = async (recipeName: string, language: string): Promise<Omit<Recipe, 'likes' | 'isSaved' | 'comments'>> => {
    const ai = getAI();
    const targetLanguage = getLanguageName(language);
    const prompt = `
        Generate a professional ChefSnap recipe for "${recipeName}".
        Must be clear, detailed, and formatted for high-quality printing.
        Output in ${targetLanguage}.
    `;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
        },
    });
    
    let recipe = JSON.parse(response.text);
    recipe.imageUrl = await generateRecipeImage(recipe.recipeName);
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
    Analyze this cooking video link: ${videoUrl}.
    Extract the full professional recipe as ChefSnap's lead culinary analyst.
  `;
  
  if (imagePart) {
      prompt += `\nPrioritize the visual cues in the attached screenshot for ingredient identification.`;
  }

  if (extraDetails) {
    prompt += `\nCustom adjustments requested: "${extraDetails}"`;
  }

  prompt += `\nOutput the final professional recipe in ${targetLanguage}.`;

  const contents = imagePart ? { parts: [{ text: prompt }, imagePart] } : { parts: [{ text: prompt }] };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
    },
  });

  let recipe = JSON.parse(response.text);
  recipe.imageUrl = await generateRecipeImage(recipe.recipeName);
  return recipe;
};
