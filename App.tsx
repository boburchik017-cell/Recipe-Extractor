
import React, { useState, useCallback, useEffect } from 'react';
import { generateRecipeFromVideo, fileToGenerativePart, generateRecipeIdeas, generateRecipeFromName, searchRecipes } from './services/geminiService';
import { playClickSound, playSuccessSound, playErrorSound } from './services/soundService';
import type { Recipe, User, RecipeIdea, Comment } from './types';
import RecipeCard from './components/RecipeCard';
import RecipeIdeasList from './components/RecipeIdeasList';
import SavedRecipesList from './components/SavedRecipesList';
import Loader from './components/Loader';
import { ChefHatIcon } from './components/icons/ChefHatIcon';
import { LinkIcon } from './components/icons/LinkIcon';
import { UserIcon } from './components/icons/UserIcon';
import { MailIcon } from './components/icons/MailIcon';
import { GlobeIcon } from './components/icons/GlobeIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { SearchIcon } from './components/icons/SearchIcon';
import { BookmarkIcon } from './components/icons/BookmarkIcon';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { locales } from './i18n/locales';

type View = 'extractor' | 'ideas' | 'recipe' | 'search' | 'saved';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', language: 'en' as User['language'] });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const [view, setView] = useState<View>('extractor');
  
  const [allRecipes, setAllRecipes] = useState<Record<string, Recipe>>({});
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const [videoUrl, setVideoUrl] = useState<string>('');
  const [recipeIdeas, setRecipeIdeas] = useState<RecipeIdea[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecipeIdea[] | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extraDetails, setExtraDetails] = useState<string>('');
  
  const t = locales[user?.language || signUpForm.language];

  const loadingMessages = [
    t.generatingButton,
    "Chopping digital onions...",
    "Preheating AI ovens...",
    "Whisking the instructions...",
    "Plating your recipe...",
    "Deglazing the context...",
    "Simmering ingredients..."
  ];

  // Theme Logic
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    playClickSound();
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Rotate loading messages
  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleApiError = (err: unknown) => {
    console.error(err);
    setError(t.errorGenerate);
    playErrorSound();
  };

  // Load user and recipes from localStorage on initial render
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('recipeUser');
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedRecipes = localStorage.getItem('allRecipes');
      if (storedRecipes) setAllRecipes(JSON.parse(storedRecipes));
    } catch (e) {
      console.error("Failed to parse from localStorage", e);
      localStorage.clear();
    }
  }, []);

  // Persist allRecipes to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(allRecipes).length > 0) {
      localStorage.setItem('allRecipes', JSON.stringify(allRecipes));
    }
  }, [allRecipes]);

  const updateAndSetActiveRecipe = (newRecipe: Omit<Recipe, 'likes' | 'isSaved' | 'comments' | 'isLiked'>) => {
    const existingRecipe = allRecipes[newRecipe.recipeName];
    const fullRecipe: Recipe = {
      ...newRecipe,
      likes: existingRecipe?.likes || 0,
      isLiked: existingRecipe?.isLiked || false,
      isSaved: existingRecipe?.isSaved || false,
      comments: existingRecipe?.comments || [],
    };
    setAllRecipes(prev => ({ ...prev, [fullRecipe.recipeName]: fullRecipe }));
    setActiveRecipe(fullRecipe);
  };
  
  const handleLike = (recipeName: string) => {
    playClickSound();
    setAllRecipes(prev => {
      const recipe = prev[recipeName];
      const nextIsLiked = !recipe.isLiked;
      const updatedRecipe = { 
        ...recipe, 
        isLiked: nextIsLiked,
        likes: nextIsLiked ? 1 : 0 
      };
      setActiveRecipe(updatedRecipe);
      return { ...prev, [recipeName]: updatedRecipe };
    });
  };

  const handleSaveToggle = (recipeName: string) => {
    playClickSound();
    setAllRecipes(prev => {
      const updatedRecipe = { ...prev[recipeName], isSaved: !prev[recipeName].isSaved };
      setActiveRecipe(updatedRecipe);
      return { ...prev, [recipeName]: updatedRecipe };
    });
  };

  const handleAddComment = (recipeName: string, commentText: string) => {
    if (!user) return;
    playClickSound();
    const newComment: Comment = {
      author: user.name,
      text: commentText,
      timestamp: new Date().toISOString(),
    };
    setAllRecipes(prev => {
      const updatedRecipe = { ...prev[recipeName], comments: [...prev[recipeName].comments, newComment] };
      setActiveRecipe(updatedRecipe);
      return { ...prev, [recipeName]: updatedRecipe };
    });
  };

  const resetToExtractor = () => {
    setView('extractor');
    setActiveRecipe(null);
    setRecipeIdeas(null);
    setVideoUrl('');
    setError(null);
    setImageFile(null);
    setImagePreview(null);
    setExtraDetails('');
    setActiveCategory(null);
    setSearchQuery('');
    setSearchResults(null);
    setIsLoading(false);
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (signUpForm.name && signUpForm.email) {
      const newUser: User = { ...signUpForm };
      localStorage.setItem('recipeUser', JSON.stringify(newUser));
      setUser(newUser);
    }
  };
  
  const handleLogout = () => {
    playClickSound();
    localStorage.removeItem('recipeUser');
    setUser(null);
    resetToExtractor();
  };

  const handleGenerateFromUrl = useCallback(async () => {
    playClickSound();
    if (!user || !videoUrl.trim()) return;
    try { new URL(videoUrl); } catch (_) { setError(t.errorInvalidUrl); playErrorSound(); return; }

    setIsLoading(true);
    setError(null);
    setActiveRecipe(null);
    try {
      let imagePart = null;
      if (imageFile) imagePart = await fileToGenerativePart(imageFile);
      const generatedRecipe = await generateRecipeFromVideo(videoUrl, user.language, imagePart, extraDetails);
      updateAndSetActiveRecipe(generatedRecipe);
      setView('recipe');
      playSuccessSound();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [videoUrl, user, t, imageFile, extraDetails]);

  const handleBrowseCategory = useCallback(async (category: string) => {
    playClickSound();
    if (!user) return;
    setIsLoading(true);
    setError(null);
    setRecipeIdeas(null);
    setActiveCategory(category);
    try {
      const ideas = await generateRecipeIdeas(category, user.language);
      setRecipeIdeas(ideas);
      setView('ideas');
    } catch (err) {
      handleApiError(err);
      setView('extractor');
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (!user || !searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    try {
      const results = await searchRecipes(searchQuery, user.language);
      setSearchResults(results);
      setView('search');
    } catch (err) {
      handleApiError(err);
      setView('extractor');
    } finally {
      setIsLoading(false);
    }
  }, [user, t, searchQuery]);

  const handleSelectIdea = useCallback(async (ideaName: string) => {
    playClickSound();
    if (!user) return;
    if (allRecipes[ideaName]) { setActiveRecipe(allRecipes[ideaName]); setView('recipe'); return; }

    setIsLoading(true);
    setError(null);
    setActiveRecipe(null);
    try {
      const recipeDetails = await generateRecipeFromName(ideaName, user.language);
      updateAndSetActiveRecipe(recipeDetails);
      setView('recipe');
      playSuccessSound();
    } catch (err) {
      handleApiError(err);
      setView('ideas');
    } finally {
      setIsLoading(false);
    }
  }, [user, t, allRecipes]);


  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => { setVideoUrl(e.target.value); if (error) setError(null); };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };
  const handleRemoveImage = () => { playClickSound(); setImageFile(null); if (imagePreview) URL.revokeObjectURL(imagePreview); setImagePreview(null); };
  useEffect(() => { return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }; }, [imagePreview]);

  if (!user) {
    return (
      <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4">
        <button onClick={toggleTheme} className="absolute top-6 right-6 p-2 rounded-full glass-effect hover:bg-white dark:hover:bg-slate-800 transition-all shadow-md">
          {theme === 'dark' ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-indigo-600" />}
        </button>
        <div className="w-full max-w-md mx-auto">
          <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-2">
              <ChefHatIcon className="h-12 w-12 text-rose-500" />
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t.signUpTitle}
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-slate-200">
              {t.signUpSubtitle}
            </p>
          </header>
          <form onSubmit={handleSignUp} className="glass-effect p-8 rounded-xl shadow-lg space-y-6">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-white mb-1" htmlFor="name">{t.nameLabel}</label><div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="name" type="text" value={signUpForm.name} onChange={(e) => setSignUpForm({...signUpForm, name: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 dark:text-white" placeholder={t.namePlaceholder} required /></div></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-white mb-1" htmlFor="email">{t.emailLabel}</label><div className="relative"><MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="email" type="email" value={signUpForm.email} onChange={(e) => setSignUpForm({...signUpForm, email: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 dark:text-white" placeholder={t.emailPlaceholder} required /></div></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-white mb-1" htmlFor="language">{t.languageLabel}</label><div className="relative"><GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><select id="language" value={signUpForm.language} onChange={(e) => setSignUpForm({...signUpForm, language: e.target.value as User['language']})} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 appearance-none text-gray-900 dark:text-white"><option value="en">English</option><option value="es">Español</option><option value="fr">Français</option><option value="uz">Oʻzbekcha</option><option value="ru">Русский</option><option value="de">Deutsch</option><option value="it">Italiano</option><option value="pt">Português</option><option value="ja">日本語</option><option value="zh">中文 (简体)</option><option value="ko">한국어</option><option value="hi">हिन्दी</option><option value="ar">العربية</option><option value="tr">Türkçe</option><option value="nl">Nederlands</option></select></div></div>
            <button type="submit" className="w-full px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg shadow-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all">{t.getStartedButton}</button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center flex-grow mt-8 min-h-[50vh] animate-fade-in">
          <Loader />
          <div className="h-8 flex items-center justify-center overflow-hidden">
             <p className="text-xl font-medium text-gray-700 dark:text-white animate-pulse text-center transition-all duration-500">
               {loadingMessages[loadingMessageIndex]}
             </p>
          </div>
        </div>
      );
    }
    if (view === 'saved') { const savedRecipes = Object.values(allRecipes).filter((r: Recipe) => r.isSaved); return <SavedRecipesList savedRecipes={savedRecipes} onSelectRecipe={(recipe) => { playClickSound(); setActiveRecipe(recipe); setView('recipe'); }} onBack={() => { playClickSound(); setView('extractor'); }} t={{ savedRecipesTitle: t.savedRecipesTitle, backButton: t.backButton, noSavedRecipes: t.noSavedRecipes }}/>; }
    if ((view === 'ideas' && recipeIdeas) || (view === 'search' && searchResults)) { const data = view === 'ideas' ? recipeIdeas : searchResults; const title = view === 'ideas' ? <>{t.recipeIdeasTitle} <span className="text-rose-500">{activeCategory}</span></> : <>{t.searchResultsTitle} <span className="text-rose-500">"{searchQuery}"</span></>; return <RecipeIdeasList ideas={data!} title={title} onSelectIdea={handleSelectIdea} onBack={() => { playClickSound(); setView('extractor'); }} backButtonText={t.backButton}/>; }
    if (view === 'recipe' && activeRecipe) { return <div className="mt-8 flex-grow w-full"><RecipeCard recipe={activeRecipe} videoUrl={videoUrl} onNewSearch={() => { playClickSound(); resetToExtractor(); }} onLike={handleLike} onSaveToggle={handleSaveToggle} onAddComment={handlePostComment} t={{prepTime:t.prepTime, cookTime:t.cookTime, servings:t.servings, ingredients:t.ingredients, instructions:t.instructions, shareRecipeTitle:t.shareRecipeTitle, copyLinkButton:t.copyLinkButton, copiedButton:t.copiedButton, newSearchButton:t.newSearchButton, likes:t.likes, saveRecipe:t.saveRecipe, unsaveRecipe:t.unsaveRecipe, commentsTitle:t.commentsTitle, addCommentPlaceholder:t.addCommentPlaceholder, postCommentButton:t.postCommentButton}}/></div>; }
    
    // Extractor View
    return (
      <><header className="text-center mb-8 animate-fade-in-down w-full">
        <div className="flex justify-between items-center w-full mb-4">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 dark:text-white">{t.welcomeMessage}, <span className="font-bold text-rose-600 dark:text-rose-400">{user.name}</span>!</span>
            <button onClick={() => { playClickSound(); setView('saved'); }} className="flex items-center gap-2 text-sm text-gray-600 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
              <BookmarkIcon isSaved={false} className="h-5 w-5" />
              <span className="dark:text-white">{t.savedRecipesButton}</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full glass-effect hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm" aria-label="Toggle Theme">
              {theme === 'dark' ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-indigo-600" />}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-600 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
              <LogoutIcon className="h-5 w-5" />
              <span className="dark:text-white">{t.signOutButton}</span>
            </button>
          </div>
        </div>
        <div className="flex justify-center items-center gap-4 mb-2">
          <ChefHatIcon className="h-12 w-12 text-rose-500" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t.title}
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-slate-200 max-w-xl mx-auto">
          {t.subtitle}
        </p>
        <div className="mt-6 animate-fade-in-up">
          <h3 className="text-center text-lg font-medium text-gray-700 dark:text-white mb-3">{t.recipeCategoriesTitle}</h3>
          <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
            {['Cakes', 'Salads', 'Pasta', 'Desserts'].map((category) => (
              <button key={category} onClick={() => handleBrowseCategory(category)} className="px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 bg-white/80 dark:bg-slate-800 text-gray-700 dark:text-white hover:bg-rose-100 dark:hover:bg-slate-700 shadow-sm border dark:border-slate-700">
                {t[`category${category}` as keyof typeof t]}
              </button>
            ))}
          </div>
        </div>
      </header>
        <form onSubmit={handleSearch} className="w-full my-6 animate-fade-in-up"><div className="relative"><SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-shadow duration-200 text-gray-900 dark:text-white"/></div></form>
        <div className="sticky top-4 z-10 p-4 rounded-xl shadow-lg animate-fade-in glass-effect space-y-4 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3"><div className="relative w-full"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" value={videoUrl} onChange={handleUrlChange} placeholder={t.urlPlaceholder} className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-shadow duration-200 text-gray-900 dark:text-white" disabled={isLoading}/></div><button onClick={handleGenerateFromUrl} disabled={isLoading || !videoUrl.trim()} className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg shadow-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:bg-gray-400 transition-all duration-200 flex items-center justify-center gap-2">{isLoading ? <Loader /> : t.generateButton}</button></div>
          <div className="space-y-3">
            <h3 className="font-semibold text-center text-gray-700 dark:text-white">{t.optionalDetailsTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-center w-full">{imagePreview ? <div className="relative w-full h-32"><img src={imagePreview} alt="Screenshot preview" className="w-full h-full object-cover rounded-lg border-2 border-gray-300 dark:border-slate-700"/><button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors" aria-label="Remove image"><TrashIcon className="h-4 w-4" /></button></div> : <label htmlFor="file-upload" onClick={playClickSound} className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-slate-700 border-dashed rounded-lg cursor-pointer bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-100/50 dark:hover:bg-slate-700/50 transition-colors"><div className="flex flex-col items-center justify-center pt-5 pb-6"><UploadIcon className="w-8 h-8 mb-2 text-gray-500 dark:text-slate-400" /><p className="text-sm text-gray-500 dark:text-white text-center">{t.uploadScreenshotLabel}</p></div><input id="file-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*" /></label>}</div>
              <textarea value={extraDetails} onChange={(e) => setExtraDetails(e.target.value)} placeholder={t.extraDetailsPlaceholder} className="w-full h-32 p-3 bg-white/80 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-shadow duration-200 resize-none text-gray-900 dark:text-white" disabled={isLoading}/>
            </div>
          </div>
          {error && <p className="text-red-500 text-center sm:text-left pt-2">{error}</p>}
        </div>
      </>
    );
  }

  const handlePostComment = (recipeName: string, text: string) => {
    handleAddComment(recipeName, text);
  }

  return (
    <div className="min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-4xl mx-auto flex flex-col flex-grow items-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
