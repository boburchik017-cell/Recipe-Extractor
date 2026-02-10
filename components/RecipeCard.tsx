
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

  // Professional white-label share text
  const shareText = `ChefSnap found this amazing recipe for ${recipe.recipeName}! check it out: ${videoUrl}`;

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
    <div className="glass-effect rounded-2xl shadow-xl p-6 sm:p-10 animate-fade-in-up w-full border border-gray-100 dark:border-gray-800">
       <button 
          onClick={onNewSearch}
          className="w-full mb-8 px-6 py-4 bg-rose-600 text-white font-bold rounded-xl shadow-lg hover:bg-rose-700 hover:shadow-rose-500/20 transform hover:-translate-y-0.5 transition-all"
        >
          {t.newSearchButton}
        </button>

      {recipe.imageUrl && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl aspect-video relative group">
          <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      )}

      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">{recipe.recipeName}</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">{recipe.description}</p>
      
      <div className="flex items-center gap-8 mb-8 border-y border-gray-100 dark:border-gray-800 py-5">
        <button onClick={() => onLike(recipe.recipeName)} className="flex items-center gap-2 group">
          <HeartIcon isLiked={recipe.isLiked} className={`h-7 w-7 transition-all duration-300 transform group-hover:scale-110 ${recipe.isLiked ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500'}`}/>
          <span className={`text-lg font-bold transition-colors ${recipe.isLiked ? 'text-rose-600' : 'text-gray-600 dark:text-gray-400'}`}>
            {recipe.likes} {t.likes}
          </span>
        </button>
        <button onClick={() => onSaveToggle(recipe.recipeName)} className="flex items-center gap-2 group">
          <BookmarkIcon isSaved={recipe.isSaved} className={`h-7 w-7 transition-all duration-300 transform group-hover:scale-110 ${recipe.isSaved ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500'}`} />
          <span className={`text-lg font-bold transition-colors ${recipe.isSaved ? 'text-rose-600' : 'text-gray-600 dark:text-gray-400'}`}>
            {recipe.isSaved ? t.unsaveRecipe : t.saveRecipe}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100/50 dark:border-rose-900/20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1">{t.prepTime}</p>
          <p className="text-xl font-extrabold text-gray-900 dark:text-white">{recipe.prepTime}</p>
        </div>
        <div className="bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100/50 dark:border-rose-900/20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1">{t.cookTime}</p>
          <p className="text-xl font-extrabold text-gray-900 dark:text-white">{recipe.cookTime}</p>
        </div>
        <div className="bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-2xl border border-rose-100/50 dark:border-rose-900/20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1">{t.servings}</p>
          <p className="text-xl font-extrabold text-gray-900 dark:text-white">{recipe.servings}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-rose-500 rounded-full"></span>
            {t.ingredients}
          </h3>
          <ul className="space-y-4">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full flex-shrink-0"></div>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-rose-500 rounded-full"></span>
            {t.instructions}
          </h3>
          <div className="space-y-8">
            {recipe.instructions.map((step, index) => (
              <div key={index} className="flex gap-5">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-500 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-rose-500/30">
                  {index + 1}
                </span>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.commentsTitle}</h3>
        <div className="space-y-4 mb-8">
          {recipe.comments.map((comment, index) => (
            <div key={index} className="bg-gray-50/50 dark:bg-gray-900/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/50">
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-gray-900 dark:text-white">{comment.author}</p>
                <span className="text-xs text-gray-400">Personal Note</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{comment.text}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t.addCommentPlaceholder}
            className="flex-grow px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all dark:text-white"
          />
          <button type="submit" className="p-3.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all active:scale-95">
            <SendIcon className="h-6 w-6" />
          </button>
        </form>
      </div>

      {videoUrl && (
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 tracking-wide uppercase">{t.shareRecipeTitle}</h3>
          <div className="flex justify-center items-center gap-5 flex-wrap">
            <a onClick={playClickSound} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}&quote=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#1877F2] text-white rounded-full hover:scale-110 transition-transform shadow-lg"><FacebookIcon className="h-6 w-6" /></a>
            <a onClick={playClickSound} href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#000000] text-white rounded-full hover:scale-110 transition-transform shadow-lg"><TwitterIcon className="h-6 w-6" /></a>
            <a onClick={playClickSound} href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#25D366] text-white rounded-full hover:scale-110 transition-transform shadow-lg"><WhatsAppIcon className="h-6 w-6" /></a>
            <button onClick={handleCopy} className={`p-3 rounded-full hover:scale-110 transition-transform shadow-lg ${isCopied ? 'bg-green-600' : 'bg-gray-700'} text-white`} title={t.copyLinkButton}><CopyIcon className="h-6 w-6" /></button>
          </div>
          {isCopied && <p className="text-green-600 text-sm font-bold mt-2 animate-bounce">{t.copiedButton}</p>}
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
