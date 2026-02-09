
import React from 'react';
import type { Recipe } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChefHatIcon } from './icons/ChefHatIcon';

interface SavedRecipesListProps {
  savedRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onBack: () => void;
  t: {
    savedRecipesTitle: string;
    backButton: string;
    noSavedRecipes: string;
  };
}

const SavedRecipesList: React.FC<SavedRecipesListProps> = ({ savedRecipes, onSelectRecipe, onBack, t }) => {
  return (
    <div className="w-full animate-fade-in-up">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors mr-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="dark:text-white">{t.backButton}</span>
        </button>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {t.savedRecipesTitle}
        </h2>
      </div>

      {savedRecipes.length === 0 ? (
        <div className="text-center py-16 glass-effect rounded-xl border dark:border-gray-700">
           <ChefHatIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
           <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{t.noSavedRecipes}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {savedRecipes.map((recipe) => (
            <button
              key={recipe.recipeName}
              onClick={() => onSelectRecipe(recipe)}
              className="w-full text-left rounded-2xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl glass-effect overflow-hidden group border dark:border-gray-700"
            >
              {recipe.imageUrl && (
                <div className="overflow-hidden">
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.recipeName} 
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{recipe.recipeName}</h3>
                <p className="text-base text-gray-600 dark:text-white mt-2 line-clamp-3">{recipe.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedRecipesList;
