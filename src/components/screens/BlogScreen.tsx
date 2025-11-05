


import React, { useState } from 'react';
import { blogPosts } from '../../data/blog';
import type { BlogPost } from '../../types';
import { motion } from 'framer-motion';
import { useTranslation } from '../../lib/i18n.tsx';
import { BackArrowIcon } from '../ui/BackArrowIcon';
import { Instagram } from 'lucide-react';

// FIX: Wrapped BlogCard in React.memo and defined props with an interface. This helps TypeScript correctly identify it as a React component, resolving an error where the special 'key' prop was not being handled correctly during list rendering.
interface BlogCardProps {
    post: BlogPost;
    onClick: () => void;
}

const BlogCard = React.memo(({ post, onClick }: BlogCardProps) => (
    <motion.div
        layoutId={`blog-card-${post.id}`}
        onClick={onClick}
        className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
        <div className="relative w-full aspect-[4/3] overflow-hidden">
            <motion.img 
                layoutId={`blog-image-${post.id}`}
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
            />
        </div>
        <div className="p-4">
            <motion.h3 layoutId={`blog-title-${post.id}`} className="font-bold text-md leading-tight">{post.title}</motion.h3>
            <motion.p layoutId={`blog-date-${post.id}`} className="text-xs text-gray-400 mt-2">{post.date}</motion.p>
        </div>
    </motion.div>
));

// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
const BlogDetail = React.memo(({ post, onBack }: { post: BlogPost; onBack: () => void }) => {
    const { t } = useTranslation();
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-grow"
        >
             <div className="flex-grow">
                <div className="relative w-full h-64 lg:h-96">
                    <motion.img 
                        layoutId={`blog-image-${post.id}`}
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                     <button
                        onClick={onBack}
                        className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/80 transition-colors"
                        aria-label={t('blog.back')}
                    >
                        <BackArrowIcon />
                    </button>
                </div>
                <div className="p-6 pb-12 lg:px-12">
                    <motion.h1 layoutId={`blog-title-${post.id}`} className="text-3xl lg:text-4xl font-bold tracking-wide">{post.title}</motion.h1>
                    <motion.p layoutId={`blog-date-${post.id}`} className="text-sm text-gray-400 mt-2 mb-4">{post.date}</motion.p>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-invert max-w-none text-gray-300"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
             </div>
        </motion.div>
    );
});

const instagramPhotos = [
  '/assets/images/instagram-1.webp',
  '/assets/images/instagram-2.webp',
  '/assets/images/instagram-3.webp',
  '/assets/images/instagram-4.webp',
  '/assets/images/instagram-5.webp',
  '/assets/images/instagram-6.webp',
];

// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler.
const InstagramFeed = React.memo(() => {
  const { t } = useTranslation();
  return (
    <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <h3 className="text-xl font-bold text-center text-yellow-300 mb-4 tracking-wide">{t('blog.instagram.title')}</h3>
        <div className="grid grid-cols-3 gap-1">
            {instagramPhotos.map((photo, index) => (
                <a 
                    key={index} 
                    href="https://www.instagram.com/papi_hair_design/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square overflow-hidden rounded-md group"
                >
                    <img 
                        src={photo} 
                        alt={`Instagram post ${index + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                    />
                </a>
            ))}
        </div>
         <a 
            href="https://www.instagram.com/papi_hair_design/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4 bg-white text-black font-bold py-3 px-6 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
        >
          <Instagram size={20} />
          <span>{t('blog.instagram.follow')}</span>
        </a>
    </div>
  );
});


// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
export const BlogScreen = React.memo(() => {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const { t } = useTranslation();

    if (selectedPost) {
        return <BlogDetail post={selectedPost} onBack={() => setSelectedPost(null)} />;
    }

    return (
        <div className="flex flex-col flex-grow bg-black text-white">
            <main className="flex-grow flex flex-col p-4">
                <h1 className="text-3xl font-bold text-center mb-6 tracking-wide">{t('blog.title')}</h1>
                <InstagramFeed />
                {blogPosts.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-gray-900 rounded-lg mt-6">
                        <h2 className="text-xl font-bold text-yellow-300">{t('blog.empty.title')}</h2>
                        <p className="text-gray-400 mt-2 text-balance">{t('blog.empty.text')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
                        {blogPosts.map(post => (
                            <BlogCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
});