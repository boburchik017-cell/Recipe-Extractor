
export interface Comment {
  author: string;
  text: string;
  timestamp: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
}

export interface User {
  name: string;
  email: string;
  language: 'en' | 'es' | 'fr' | 'uz' | 'ru' | 'de' | 'it' | 'pt' | 'ja' | 'zh' | 'ko' | 'hi' | 'ar' | 'tr' | 'nl';
}

export interface RecipeIdea {
  name: string;
  description: string;
}
