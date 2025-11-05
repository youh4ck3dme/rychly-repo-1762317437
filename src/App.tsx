
import React, { useState, useCallback } from 'react';
    import { WelcomeScreen } from './components/screens/WelcomeScreen';
    import { ImageUploadScreen } from './components/screens/ImageUploadScreen';
    import { AnalysisScreen } from './components/screens/AnalysisScreen';
    import { ResultsScreen } from './components/screens/ResultsScreen';
    import { ExploreScreen } from './components/screens/ExploreScreen';
    import { ServicesScreen } from './components/screens/ServicesScreen';
    import { AboutScreen } from './components/screens/AboutScreen';
    import type { Screen, HairAnalysisResult, ConsultationStyle, Tab, HairstylePreference, ChatMessage } from './types';
    import { AnimatePresence, motion } from 'framer-motion';
    import { AppHeader } from './components/ui/AppHeader';
    import { AppFooter } from './components/ui/AppFooter';
    import { Chatbot } from './components/ui/Chatbot';
    import { PapiChatIcon } from './components/ui/PapiChatIcon';
    import { createChatSession, type ChatSession } from './services/geminiService';
    import { useTranslation } from './lib/i18n.tsx';
    
    
    // FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
    const AppContent = React.memo((): React.ReactElement => {
      const [screen, setScreen] = useState<Screen>('welcome');
      const [activeTab, setActiveTab] = useState<Tab>('home');
      const [userImage, setUserImage] = useState<string | null>(null);
      const [analysisResult, setAnalysisResult] = useState<HairAnalysisResult | null>(null);
      const [error, setError] = useState<string | null>(null);
      const [consultationStyle, setConsultationStyle] = useState<ConsultationStyle>('classic');
      const [hairstylePreference, setHairstylePreference] = useState<HairstylePreference>('keep');
      const [activeServices, setActiveServices] = useState<string[]>([]);
      
      // Chatbot state
      const [isChatOpen, setIsChatOpen] = useState(false);
      const [chatSession, setChatSession] = useState<ChatSession | null>(null);
      const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
      const [isChatLoading, setIsChatLoading] = useState(false);
      const { t } = useTranslation();
    
    
      const handleStart = useCallback(() => {
        setScreen('upload');
      }, []);
    
      const handleImageReady = useCallback((imageDataUrl: string) => {
        setUserImage(imageDataUrl);
        setScreen('analysis');
      }, []);
      
      const handleAnalysisComplete = useCallback((result: HairAnalysisResult) => {
        setAnalysisResult(result);
        if (result.suggestions && result.suggestions.length > 0) {
          setActiveServices(result.suggestions[0].services);
        }
        setScreen('results');
      }, []);
    
      const handleAnalysisError = useCallback((errorMessage: string) => {
        setError(errorMessage);
        setScreen('upload'); // Go back to upload screen on error
      }, []);
      
      const handleRestart = useCallback(() => {
        setUserImage(null);
        setAnalysisResult(null);
        setError(null);
        setActiveServices([]);
        setScreen('welcome');
        setActiveTab('home');
        setConsultationStyle('classic');
        setHairstylePreference('keep');
        // Reset chat
        setIsChatOpen(false);
        setChatSession(null);
        setChatMessages([]);
      }, []);
      
      const initializeChat = useCallback(async () => {
        const newChatSession = createChatSession();
        setIsChatLoading(true);
    
        let initialText = t('chatbot.initialMessage');
    
        if (analysisResult) {
            const contextPrompt = `My personalized hair analysis is complete. Here is the summary for your reference. Please start our conversation by greeting me and mentioning one or two of my recommended looks to show you are aware of my results. My results are: Current Hair is ${analysisResult.currentHair.color}, ${analysisResult.currentHair.type}, and ${analysisResult.currentHair.condition}. My suggestions are ${analysisResult.suggestions.map(s => s.name).join(', ')}.`;
            try {
                // FIX: The response from send is a string directly.
                const response = await newChatSession.send(contextPrompt);
                initialText = response || t('chatbot.error');
            } catch (e) {
                console.error("Failed to initialize chat with context:", e);
                // Fallback to generic greeting on error
            }
        }
    
        const initialMessage: ChatMessage = { role: 'model', text: initialText };
        setChatMessages([initialMessage]);
        setChatSession(newChatSession);
        setIsChatLoading(false);
        return newChatSession;
      }, [analysisResult, t]);
    
      const handleOpenChat = useCallback(async () => {
        if (!chatSession) {
            await initializeChat();
        }
        setIsChatOpen(true);
      }, [chatSession, initializeChat]);
    
      const handleSendMessage = useCallback(async (message: string) => {
        let currentChatSession = chatSession;
        if (!currentChatSession) {
             currentChatSession = await initializeChat();
             if (!currentChatSession) return; // Guard if initialization fails
        }
    
        const userMessage: ChatMessage = { role: 'user', text: message };
        setChatMessages(prev => [...prev, userMessage]);
        setIsChatLoading(true);
    
        try {
             const response = await currentChatSession.send(message);
             const modelMessage: ChatMessage = { role: 'model', text: response || t('chatbot.error') };
            setChatMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: t('chatbot.error') };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
      }, [chatSession, initializeChat, t]);
    
    
      const renderConsultationScreen = () => {
        switch (screen) {
          case 'welcome':
            return <WelcomeScreen onStart={handleStart} />;
          case 'upload':
            return <ImageUploadScreen onImageReady={handleImageReady} error={error} selectedStyle={consultationStyle} onStyleChange={setConsultationStyle} selectedHairstyle={hairstylePreference} onHairstyleChange={setHairstylePreference} />;
          case 'analysis':
            if (!userImage) {
               handleRestart();
               return null;
            }
            return <AnalysisScreen userImage={userImage} onAnalysisComplete={handleAnalysisComplete} onAnalysisError={handleAnalysisError} consultationStyle={consultationStyle} hairstylePreference={hairstylePreference} />;
          case 'results':
            if (!userImage || !analysisResult) {
               handleRestart();
               return null;
            }
            return <ResultsScreen userImage={userImage} result={analysisResult} onRestart={handleRestart} setActiveServices={setActiveServices} onTabChange={setActiveTab} />;
          default:
            return <WelcomeScreen onStart={handleStart} />;
        }
      };
    
      const renderActiveTab = () => {
        switch (activeTab) {
          case 'home':
            return renderConsultationScreen();
          case 'explore':
            return <ExploreScreen />;
          case 'services':
            return <ServicesScreen activeServices={activeServices} />;
          case 'about':
            return <AboutScreen onTabChange={setActiveTab} />;
          default:
            return renderConsultationScreen();
        }
      };
    
      const showFab = screen === 'results' || (activeTab !== 'home');
    
      return (
        <div className="w-full min-h-screen h-screen bg-brand-background lg:bg-transparent font-sans flex flex-col max-w-md lg:max-w-5xl xl:max-w-7xl mx-auto relative shadow-2xl shadow-yellow-400/10 lg:bg-black/80 lg:backdrop-blur-sm lg:border-x lg:border-gray-800">
          <div className="flex-grow flex flex-col overflow-y-auto">
              <AppHeader onRestart={handleRestart} activeTab={activeTab} onTabChange={setActiveTab} />
              <main className="flex-grow flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                    key={activeTab === 'home' ? screen : activeTab}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="flex-grow flex flex-col"
                    >
                    {renderActiveTab()}
                    </motion.div>
                </AnimatePresence>
              </main>
          </div>
          <AppFooter activeTab={activeTab} onTabChange={setActiveTab} />
    
          <AnimatePresence>
            {showFab && !isChatOpen && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  onClick={handleOpenChat}
                  className="absolute bottom-20 right-5 lg:bottom-8 lg:right-8 z-30 w-16 h-16 rounded-full bg-black border border-[#FFD700]/30 flex items-center justify-center animate-pulse-glow"
                  aria-label={t('app.openChat')}
                >
                  <PapiChatIcon className="w-9 h-9" />
                </motion.button>
            )}
          </AnimatePresence>
    
          <Chatbot
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
          />
        </div>
      );
    });
    
    const App = (): React.ReactElement => (
      <AppContent />
    );
    
    
    export default App;