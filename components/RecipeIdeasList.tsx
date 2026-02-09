
import React from 'react';
import type { RecipeIdea } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { playClickSound } from '../services/soundService';

interface RecipeIdeasListProps {
  ideas: RecipeIdea[];
  title: React.ReactNode;
  onSelectIdea: (name: string) => void;
  onBack: () => void;
  backButtonText: string;
}

const RecipeIdeasList: React.FC<RecipeIdeasListProps> = ({ ideas, title, onSelectIdea, onBack, backButtonText }) => {
  return (
    <div className="w-full animate-fade-in-up">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors mr-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="dark:text-white">{backButtonText}</span>
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {ideas.map((idea, index) => (
          <button
            key={index}
            onClick={() => onSelectIdea(idea.name)}
            className="w-full text-left p-5 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl glass-effect border dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{idea.name}</h3>
            <p className="text-sm text-gray-600 dark:text-white mt-1">{idea.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecipeIdeasList;
