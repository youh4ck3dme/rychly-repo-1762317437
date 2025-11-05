import React from 'react';
import { EnhancedChatbotIcon } from './EnhancedChatbotIcon';

export const IconDemo: React.FC = () => {
  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Vylepšená Chatbot Ikona - Demo
      </h1>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Porovnání - původní vs. nová */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">Porovnání ikon</h2>
          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Původní</h3>
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg width="32" height="32" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="30" fill="url(#goldGlow)" stroke="#FFD700" strokeWidth="1.5"/>
                </svg>
              </div>
              <p className="text-sm text-gray-400">Základní kruh</p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Vylepšená (300%+)</h3>
              <EnhancedChatbotIcon size={64} className="mx-auto mb-2" />
              <p className="text-sm text-gray-400">AI + Beauty kombinace</p>
            </div>
          </div>
        </section>

        {/* Různé velikosti */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">Různé velikosti</h2>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <EnhancedChatbotIcon size={32} />
              <p className="text-sm text-gray-400 mt-2">32px</p>
            </div>
            <div className="text-center">
              <EnhancedChatbotIcon size={48} />
              <p className="text-sm text-gray-400 mt-2">48px</p>
            </div>
            <div className="text-center">
              <EnhancedChatbotIcon size={64} />
              <p className="text-sm text-gray-400 mt-2">64px</p>
            </div>
            <div className="text-center">
              <EnhancedChatbotIcon size={96} />
              <p className="text-sm text-gray-400 mt-2">96px</p>
            </div>
          </div>
        </section>

        {/* Animace demo */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">Animace efekty</h2>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Statická</h3>
              <EnhancedChatbotIcon size={64} animated={false} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Animovaná</h3>
              <EnhancedChatbotIcon size={64} animated={true} />
            </div>
          </div>
        </section>

        {/* Vlastnosti ikony */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">Vlastnosti nové ikony</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-yellow-400">✨ Vizuální vylepšení</h3>
              <ul className="space-y-2 text-sm">
                <li>• Glassmorphism efekt s průhledností</li>
                <li>• Holografické gradienty (zlatá → oranžová → měděná)</li>
                <li>• 3D stíny a hloubka</li>
                <li>• Pulsující animace</li>
                <li>• Rotující gradient overlay</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 text-blue-400">🤖 AI & Beauty prvky</h3>
              <ul className="space-y-2 text-sm">
                <li>• Chat bublina jako hlavní symbol</li>
                <li>• Nůžky jako beauty prvek</li>
                <li>• AI oko s odleskem</li>
                <li>• Dekorativní hvězdičky</li>
                <li>• Kombinace tech + elegance</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};