import { useState } from 'react';
import { RaffleProvider } from './components/RaffleContext';
import { TandaProvider } from './components/TandaContext';
import { SettingsProvider } from './components/SettingsContext';
import { Dashboard } from './components/Dashboard';
import { RaffleDetail } from './components/RaffleDetail';
import { TandaDetail } from './components/TandaDetail';
import { SettingsView } from './components/SettingsView';
import { ToastContainer } from './components/ToastContainer';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon } from 'lucide-react';

export default function App() {
  const [currentRaffleId, setCurrentRaffleId] = useState<string | null>(null);
  const [currentTandaId, setCurrentTandaId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const goHome = () => {
    setCurrentRaffleId(null);
    setCurrentTandaId(null);
    setIsSettingsOpen(false);
  };

  return (
    <>
    <SettingsProvider>
      <RaffleProvider>
        <TandaProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-x-hidden">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
              <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center relative">
                {(currentRaffleId || currentTandaId || isSettingsOpen) && (
                  <button 
                    onClick={goHome}
                    className="absolute left-4 flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                )}
                <h1 
                  className="text-xl font-black tracking-tight text-emerald-800 cursor-pointer flex items-center gap-2 mx-auto"
                  onClick={goHome}
                >
                  <span className="bg-emerald-500 p-1.5 rounded-lg text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
                  </span>
                  Rifas Pro
                </h1>
                
                {!isSettingsOpen && !currentRaffleId && !currentTandaId && (
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="absolute right-4 flex items-center justify-center p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                    title="Configuración"
                  >
                    <SettingsIcon size={24} />
                  </button>
                )}
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
              <AnimatePresence mode="wait">
                {isSettingsOpen ? (
                  <motion.div 
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <SettingsView />
                  </motion.div>
                ) : currentRaffleId ? (
                  <motion.div 
                    key="raffle-detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <RaffleDetail raffleId={currentRaffleId} />
                  </motion.div>
                ) : currentTandaId ? (
                  <motion.div 
                    key="tanda-detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <TandaDetail tandaId={currentTandaId} onClose={goHome} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <Dashboard onSelectRaffle={setCurrentRaffleId} onSelectTanda={setCurrentTandaId} />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </TandaProvider>
      </RaffleProvider>
    </SettingsProvider>
    <ToastContainer />
    </>
  );
}
