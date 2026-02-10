
import React, { useState, useCallback, useEffect } from 'react';
import { generateRecipeFromVideo, fileToGenerativePart, generateRecipeIdeas, generateRecipeFromName, searchRecipes } from './services/geminiService';
import { playClickSound, playSuccessSound, playErrorSound } from './services/soundService';
import type { Recipe, User, RecipeIdea, Comment } from './types';
import RecipeCard from './components/RecipeCard';
import RecipeIdeasList from './components/RecipeIdeasList';
import SavedRecipesList from './components/SavedRecipesList';
import Loader from './components/Loader';
import Background3D from './components/Background3D';
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
  
  const langKey = (user?.language || signUpForm.language) as keyof typeof locales;
  const t = locales[langKey] || locales.en;

  const loadingMessages = [
    t.generatingButton,
    "Analyzing culinary sequences...",
    "Extracting ingredient metadata...",
    "Defining step-by-step logic...",
    "Generating professional plating visuals...",
    "Finalizing ChefSnap recipe...",
  ];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    playClickSound();
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('recipeUser');
      if (storedUser) setUser(JSON.parse(storedUser));
      const storedRecipes = localStorage.getItem('allRecipes');
      if (storedRecipes) setAllRecipes(JSON.parse(storedRecipes));
    } catch (e) {
      localStorage.clear();
    }
  }, []);

  useEffect(() => {
    if (Object.keys(allRecipes).length > 0) {
      localStorage.setItem('allRecipes', JSON.stringify(allRecipes));
    }
  }, [allRecipes]);

  const updateAndSetActiveRecipe = (newRecipe: Omit<Recipe, 'likes' | 'isSaved' | 'comments' | 'isLiked'>) => {
    const existing = allRecipes[newRecipe.recipeName];
    const full: Recipe = {
      ...newRecipe,
      likes: existing?.likes || 0,
      isLiked: existing?.isLiked || false,
      isSaved: existing?.isSaved || false,
      comments: existing?.comments || [],
    };
    setAllRecipes(prev => ({ ...prev, [full.recipeName]: full }));
    setActiveRecipe(full);
  };
  
  const handleLike = (recipeName: string) => {
    playClickSound();
    setAllRecipes(prev => {
      const r = prev[recipeName];
      if (!r) return prev;
      const nextLiked = !r.isLiked;
      const updated = { ...r, isLiked: nextLiked, likes: nextLiked ? r.likes + 1 : Math.max(0, r.likes - 1) };
      if (activeRecipe?.recipeName === recipeName) setActiveRecipe(updated);
      return { ...prev, [recipeName]: updated };
    });
  };

  const handleSaveToggle = (recipeName: string) => {
    playClickSound();
    setAllRecipes(prev => {
      const r = prev[recipeName];
      if (!r) return prev;
      const updated = { ...r, isSaved: !r.isSaved };
      if (activeRecipe?.recipeName === recipeName) setActiveRecipe(updated);
      return { ...prev, [recipeName]: updated };
    });
  };

  const handleAddComment = (recipeName: string, text: string) => {
    if (!user) return;
    playClickSound();
    const comm: Comment = { author: user.name, text, timestamp: new Date().toISOString() };
    setAllRecipes(prev => {
      const r = prev[recipeName];
      if (!r) return prev;
      const updated = { ...r, comments: [...r.comments, comm] };
      if (activeRecipe?.recipeName === recipeName) setActiveRecipe(updated);
      return { ...prev, [recipeName]: updated };
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
    try {
      let imagePart = null;
      if (imageFile) imagePart = await fileToGenerativePart(imageFile);
      const res = await generateRecipeFromVideo(videoUrl, user.language, imagePart, extraDetails);
      updateAndSetActiveRecipe(res);
      setView('recipe');
      playSuccessSound();
    } catch (err) {
      setError(t.errorGenerate);
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  }, [videoUrl, user, t, imageFile, extraDetails]);

  const handleBrowseCategory = useCallback(async (cat: string) => {
    playClickSound();
    if (!user) return;
    setIsLoading(true);
    setError(null);
    setActiveCategory(cat);
    try {
      const ideas = await generateRecipeIdeas(cat, user.language);
      setRecipeIdeas(ideas);
      setView('ideas');
    } catch (err) {
      setError(t.errorGenerate);
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  const handleSearchTrigger = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playClickSound();
    if (!user || !searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchRecipes(searchQuery, user.language);
      setSearchResults(results);
      setView('search');
    } catch (err) {
      setError(t.errorGenerate);
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  }, [user, t, searchQuery]);

  const handleSelectIdea = useCallback(async (name: string) => {
    playClickSound();
    if (!user) return;
    if (allRecipes[name]) { setActiveRecipe(allRecipes[name]); setView('recipe'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const res = await generateRecipeFromName(name, user.language);
      updateAndSetActiveRecipe(res);
      setView('recipe');
      playSuccessSound();
    } catch (err) {
      setError(t.errorGenerate);
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  }, [user, t, allRecipes]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
        <Background3D />
        <div className="w-full max-w-md relative z-10">
          <header className="text-center mb-10">
            <ChefHatIcon className="h-16 w-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{t.signUpTitle}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t.signUpSubtitle}</p>
          </header>
          <form onSubmit={handleSignUp} className="glass-effect p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{t.nameLabel}</label>
                <input type="text" value={signUpForm.name} onChange={(e) => setSignUpForm({...signUpForm, name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all dark:text-white" placeholder={t.namePlaceholder} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{t.emailLabel}</label>
                <input type="email" value={signUpForm.email} onChange={(e) => setSignUpForm({...signUpForm, email: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all dark:text-white" placeholder={t.emailPlaceholder} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{t.languageLabel}</label>
                <select value={signUpForm.language} onChange={(e) => setSignUpForm({...signUpForm, language: e.target.value as any})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all dark:text-white">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="uz">O'zbekcha</option>
                  <option value="ru">Русский</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                  <option value="ko">한국어</option>
                  <option value="tr">Türkçe</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl shadow-lg hover:bg-rose-700 transition-all active:scale-[0.98]">{t.getStartedButton}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <Background3D />
      <main className="w-full max-w-4xl space-y-8 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center">
            <Loader />
            <p className="mt-8 text-2xl font-bold text-gray-900 dark:text-white animate-pulse">
              {loadingMessages[loadingMessageIndex]}
            </p>
          </div>
        ) : view === 'recipe' && activeRecipe ? (
          <RecipeCard recipe={activeRecipe} videoUrl={videoUrl} onNewSearch={resetToExtractor} onLike={handleLike} onSaveToggle={handleSaveToggle} onAddComment={handleAddComment} t={t} />
        ) : view === 'saved' ? (
          <SavedRecipesList savedRecipes={(Object.values(allRecipes) as Recipe[]).filter(r => r.isSaved)} onSelectRecipe={(r) => { setActiveRecipe(r); setView('recipe'); }} onBack={() => setView('extractor')} t={t} />
        ) : (view === 'ideas' || view === 'search') ? (
          <RecipeIdeasList ideas={view === 'ideas' ? recipeIdeas! : searchResults!} title={view === 'ideas' ? `${t.recipeIdeasTitle} ${activeCategory}` : `${t.searchResultsTitle} "${searchQuery}"`} onSelectIdea={handleSelectIdea} onBack={() => setView('extractor')} backButtonText={t.backButton} />
        ) : (
          <>
            <header className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 animate-fade-in w-full">
              <div className="flex items-center gap-4">
                <ChefHatIcon className="h-10 w-10 text-rose-500" />
                <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">ChefSnap</h1>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setView('saved')} className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-gray-800 hover:border-rose-500 transition-colors" title={t.savedRecipesButton}>
                  <BookmarkIcon isSaved={false} className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={toggleTheme} className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-gray-800 hover:border-rose-500 transition-colors">
                  {theme === 'dark' ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-rose-600" />}
                </button>
                <button onClick={handleLogout} className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-gray-800 hover:border-rose-500 transition-colors">
                  <LogoutIcon className="h-5 w-5 text-rose-500" />
                </button>
              </div>
            </header>
            
            <section className="text-center space-y-4 mb-12 animate-fade-in-up">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">{t.subtitle}</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t.disclaimer}</p>
            </section>

            {/* URL Extractor Card */}
            <div className="glass-effect p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder={t.urlPlaceholder} className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-rose-500 transition-all dark:text-white" />
                </div>
                <button onClick={handleGenerateFromUrl} disabled={!videoUrl.trim()} className="px-8 py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-lg hover:bg-rose-700 disabled:opacity-50 transition-all active:scale-95">{t.generateButton}</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{t.uploadScreenshotLabel}</h3>
                  <label className="flex flex-col items-center justify-center h-40 bg-gray-50 dark:bg-slate-950 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer hover:border-rose-400 transition-colors">
                    {imagePreview ? <img src={imagePreview} className="h-full w-full object-cover rounded-2xl" /> : <UploadIcon className="h-8 w-8 text-gray-400" />}
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Personalize Your Result</h3>
                  <textarea value={extraDetails} onChange={(e) => setExtraDetails(e.target.value)} placeholder={t.extraDetailsPlaceholder} className="w-full h-40 px-4 py-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-rose-500 transition-all dark:text-white resize-none" />
                </div>
              </div>
            </div>

            {/* NEW: Global Recipe Search Card */}
            <div className="glass-effect p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 animate-fade-in-up">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t.globalSearchTitle}</h3>
              <form onSubmit={handleSearchTrigger} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder={t.globalSearchPlaceholder} 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-rose-500 transition-all dark:text-white" 
                  />
                </div>
                <button type="submit" disabled={!searchQuery.trim()} className="px-8 py-4 bg-gray-900 dark:bg-rose-900/40 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 dark:hover:bg-rose-900/60 disabled:opacity-50 transition-all active:scale-95">{t.searchButton}</button>
              </form>
            </div>

            <section className="pt-8 space-y-6 animate-fade-in-up">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.recipeCategoriesTitle}</h3>
              <div className="flex gap-3 flex-wrap">
                {['Cakes', 'Salads', 'Pasta', 'Desserts'].map(cat => (
                  <button key={cat} onClick={() => handleBrowseCategory(cat)} className="px-6 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:border-rose-500 hover:text-rose-600 transition-all shadow-sm">{t[`category${cat}` as keyof typeof t]}</button>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
