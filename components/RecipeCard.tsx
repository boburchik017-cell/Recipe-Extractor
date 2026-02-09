
import React, { useState } from 'react';
import type { Recipe } from '../types';
import { FacebookIcon } from './icons/FacebookIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { CopyIcon } from './icons/CopyIcon';
import { HeartIcon } from './icons/HeartIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { SendIcon } from './icons/SendIcon';
import { playClickSound } from '../services/soundService';


interface RecipeCardProps {
  recipe: Recipe;
  videoUrl: string;
  onNewSearch: () => void;
  onLike: (recipeName: string) => void;
  onSaveToggle: (recipeName: string) => void;
  onAddComment: (recipeName: string, comment: string) => void;
  t: {
    prepTime: string;
    cookTime: string;
    servings: string;
    ingredients: string;
    instructions: string;
    shareRecipeTitle: string;
    copyLinkButton: string;
    copiedButton: string;
    newSearchButton: string;
    likes: string;
    saveRecipe: string;
    unsaveRecipe: string;
    commentsTitle: string;
    addCommentPlaceholder: string;
    postCommentButton: string;
  }
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, videoUrl, onNewSearch, onLike, onSaveToggle, onAddComment, t }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [newComment, setNewComment] = useState("");

  const shareText = `Check out this recipe for ${recipe.recipeName}! Found via the Video Recipe Extractor. Original video: ${videoUrl}`;

  const handleCopy = () => {
    playClickSound();
    navigator.clipboard.writeText(videoUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(recipe.recipeName, newComment.trim());
      setNewComment("");
    }
  };

  return (
    <div className="glass-effect rounded-xl shadow-lg p-6 sm:p-8 animate-fade-in-up w-full">
       <button 
          onClick={onNewSearch}
          className="w-full mb-6 px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg shadow-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 dark:focus:ring-offset-gray-900 transition-all"
        >
          {t.newSearchButton}
        </button>

      {recipe.imageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden shadow-lg aspect-w-16 aspect-h-9">
          <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover" />
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{recipe.recipeName}</h2>
      <p className="text-gray-600 dark:text-white mb-6">{recipe.description}</p>
      
      <div className="flex items-center gap-6 mb-8 border-y border-gray-200/50 dark:border-gray-700/50 py-4">
        <button onClick={() => onLike(recipe.recipeName)} className="flex items-center gap-2 text-gray-600 dark:text-white hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
          <HeartIcon isLiked={recipe.isLiked} className={`h-6 w-6 transition-all duration-300 ${recipe.isLiked ? 'text-rose-500' : 'text-gray-400 dark:text-white'}`}/>
          <span className={`font-semibold transition-colors duration-300 ${recipe.isLiked ? 'text-rose-600 dark:text-rose-400' : 'dark:text-white'}`}>
            {recipe.likes} {t.likes}
          </span>
        </button>
        <button onClick={() => onSaveToggle(recipe.recipeName)} className="flex items-center gap-2 text-gray-600 dark:text-white hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
          <BookmarkIcon isSaved={recipe.isSaved} className={`h-6 w-6 transition-all duration-300 ${recipe.isSaved ? 'text-rose-500' : 'dark:text-white'}`} />
          <span className={`font-semibold transition-colors duration-300 ${recipe.isSaved ? 'text-rose-600 dark:text-rose-400' : 'dark:text-white'}`}>
            {recipe.isSaved ? t.unsaveRecipe : t.saveRecipe}
          </span>
        </button>
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-center">
        <div className="bg-rose-50/70 dark:bg-rose-950/70 p-3 rounded-lg border dark:border-rose-900/50">
          <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{t.prepTime}</p>
          <p className="font-bold text-gray-800 dark:text-white">{recipe.prepTime}</p>
        </div>
        <div className="bg-rose-50/70 dark:bg-rose-950/70 p-3 rounded-lg border dark:border-rose-900/50">
          <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{t.cookTime}</p>
          <p className="font-bold text-gray-800 dark:text-white">{recipe.cookTime}</p>
        </div>
        <div className="bg-rose-50/70 dark:bg-rose-950/70 p-3 rounded-lg col-span-2 sm:col-span-1 border dark:border-rose-900/50">
          <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{t.servings}</p>
          <p className="font-bold text-gray-800 dark:text-white">{recipe.servings}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b-2 border-rose-500 pb-2 mb-4">{t.ingredients}</h3>
          <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-white">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="dark:text-white">{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b-2 border-rose-500 pb-2 mb-4">{t.instructions}</h3>
          <ol className="space-y-4 text-gray-700 dark:text-white">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-3 flex-shrink-0 bg-rose-500 text-white rounded-full h-6 w-6 text-sm font-bold flex items-center justify-center">{index + 1}</span>
                <span className="dark:text-white">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t.commentsTitle} ({recipe.comments.length})</h3>
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {recipe.comments.map((comment, index) => (
            <div key={index} className="bg-gray-50/50 dark:bg-gray-800/80 p-3 rounded-lg border dark:border-gray-700/50">
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{comment.author}</p>
              <p className="text-gray-700 dark:text-white">{comment.text}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t.addCommentPlaceholder}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 dark:text-white"
          />
          <button type="submit" className="p-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors" aria-label={t.postCommentButton}>
            <SendIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      {videoUrl && (
        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-4">{t.shareRecipeTitle}</h3>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <a onClick={playClickSound} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}&quote=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1877F2] rounded-lg hover:bg-opacity-90 transition-colors" aria-label="Share on Facebook"><FacebookIcon className="h-5 w-5" /><span>Facebook</span></a>
            <a onClick={playClickSound} href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1DA1F2] rounded-lg hover:bg-opacity-90 transition-colors" aria-label="Share on Twitter"><TwitterIcon className="h-5 w-5" /><span>Twitter</span></a>
            <a onClick={playClickSound} href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#25D366] rounded-lg hover:bg-opacity-90 transition-colors" aria-label="Share on WhatsApp"><WhatsAppIcon className="h-5 w-5" /><span>WhatsApp</span></a>
            <button onClick={handleCopy} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isCopied ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'}`} aria-label="Copy video link"><CopyIcon className="h-5 w-5" /><span>{isCopied ? t.copiedButton : t.copyLinkButton}</span></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
