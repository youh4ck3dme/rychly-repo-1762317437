

import React, { useState, useMemo, useEffect } from 'react';
import { Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../lib/i18n.tsx';
import { hairColorTrends } from '../../data/trends';
import { hairstyleTrends } from '../../data/trends';
import type { HairColorTrend, HairstyleTrend } from '../../types';

interface TrendCardProps {
    trend: HairColorTrend | HairstyleTrend;
}

const TrendCard = React.memo(({ trend }: TrendCardProps) => {
    return (
        <motion.div 
            className="bg-gray-900 rounded-lg overflow-hidden group flex flex-col"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative w-full aspect-square bg-gray-800">
                <img 
                    src={trend.imageUrl} 
                    alt={trend.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-md leading-tight text-white">{trend.name}</h3>
                <p className="text-sm text-gray-400 mt-2 text-balance flex-grow">{trend.description}</p>
            </div>
        </motion.div>
    );
});

const TrendCardSkeleton = () => (
    <div className="bg-gray-900 rounded-lg overflow-hidden flex flex-col animate-pulse">
        <div className="w-full aspect-square bg-gray-800"></div>
        <div className="p-4 flex flex-col flex-grow">
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
            <div className="flex-grow mt-2 space-y-2">
                <div className="h-2 bg-gray-800 rounded w-full"></div>
                <div className="h-2 bg-gray-800 rounded w-full"></div>
                <div className="h-2 bg-gray-800 rounded w-5/6"></div>
            </div>
        </div>
    </div>
);


type StyleFilter = 'all' | 'Female' | 'Male';

export const ExploreScreen = React.memo(() => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'color' | 'style'>('color');
    const [styleFilter, setStyleFilter] = useState<StyleFilter>('all');
    const [isLoading, setIsLoading] = React.useState(true);

    const filteredHairstyleTrends = useMemo(() => {
        if (styleFilter === 'all') return hairstyleTrends;
        return hairstyleTrends.filter(trend => trend.gender === styleFilter);
    }, [styleFilter]);

    const trendsToShow = useMemo(() => {
        return activeTab === 'color' ? hairColorTrends : filteredHairstyleTrends;
    }, [activeTab, filteredHairstyleTrends]);

    useEffect(() => {
        setIsLoading(true);
        const imageUrls = trendsToShow.map(t => t.imageUrl);

        const preloadImages = (urls: string[]) => {
            const promises = urls.map(url => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = url;
                    img.onload = resolve;
                    img.onerror = resolve; // Always resolve to avoid getting stuck
                });
            });
            return Promise.all(promises);
        };

        const minDisplayTime = 400; // ms
        const loadStartTime = Date.now();

        preloadImages(imageUrls).finally(() => {
            const loadTime = Date.now() - loadStartTime;
            const remainingTime = minDisplayTime - loadTime;
            
            setTimeout(() => {
                setIsLoading(false);
            }, Math.max(0, remainingTime));
        });
    }, [trendsToShow]);

    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
                    {Array.from({ length: trendsToShow.length || 4 }).map((_, index) => (
                        <TrendCardSkeleton key={index} />
                    ))}
                </div>
            );
        }
        
        return (
             <motion.div
                key={activeTab + styleFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8"
            >
                <AnimatePresence>
                    {trendsToShow.map(trend => (
                        <TrendCard key={trend.name} trend={trend} />
                    ))}
                </AnimatePresence>
            </motion.div>
        )
    };
    
    const FilterButton = ({ filterType, label }: { filterType: StyleFilter, label: string }) => (
        <button
            onClick={() => setStyleFilter(filterType)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${styleFilter === filterType ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col flex-grow bg-black text-white">
            <main className="flex-grow flex flex-col p-4">
                <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0, 0, 0, 0)' }}>
                    {t('footer.explore')}
                </h1>
                <div className="text-center mb-6">
                    <Wand2 size={32} className="text-yellow-300 inline-block mb-2" />
                    <p className="text-gray-400 mt-1 text-balance">{t('explore.subtitle')}</p>
                </div>
                
                <div className="flex justify-center bg-gray-900 p-1 rounded-full mb-6 max-w-sm mx-auto w-full">
                    <button 
                        onClick={() => setActiveTab('color')}
                        className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'color' ? 'bg-white text-black' : 'text-gray-300'}`}
                    >
                        {t('explore.colorTrends')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('style')}
                        className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'style' ? 'bg-white text-black' : 'text-gray-300'}`}
                    >
                        {t('explore.styleTrends')}
                    </button>
                </div>
                
                <AnimatePresence>
                    {activeTab === 'style' && (
                         <motion.div 
                            className="flex justify-center items-center gap-2 mb-6"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                         >
                            <FilterButton filterType="all" label={t('explore.filter.all')} />
                            <FilterButton filterType="Female" label={t('explore.filter.female')} />
                            <FilterButton filterType="Male" label={t('explore.filter.male')} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {renderContent()}
            </main>
        </div>
    );
});