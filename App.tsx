/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from '@google/genai';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { analyzeImage } from './services/geminiService';
import { AppState, BetChoice, GameResult, ImageFile } from './types';

// =================================================================
// Asset URLs (Using placeholders)
// =================================================================
const NEYMAR_IMAGE_URL = 'https://i.ibb.co/6yVwz4p/neymar-psg-trans.png';
const MESSI_IMAGE_URL = 'https://i.ibb.co/P9tLfrj/messi-barca-trans.png';

// =================================================================
// Helper & Utility Components
// =================================================================

const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({ file, base64 });
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const LoadingIndicator: React.FC<{ text: string }> = ({ text }) => (
  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
    <div className="w-16 h-16 border-4 border-t-transparent border-yellow-400 rounded-full animate-spin"></div>
    <p className="mt-4 text-white text-lg font-semibold">{text}</p>
  </div>
);

const ResultPopup: React.FC<{ result: GameResult; onReset: () => void }> = ({ result, onReset }) => {
  const isWin = result === GameResult.WIN;
  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-center p-4">
      <h2 className={`text-7xl font-black mb-4 ${isWin ? 'text-green-400' : 'text-red-500'}`}>
        {isWin ? 'YOU WIN!' : 'YOU LOSE!'}
      </h2>
      <button
        onClick={onReset}
        className="mt-6 px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg text-xl hover:bg-yellow-400 transition-transform hover:scale-105"
      >
        Play Again
      </button>
    </div>
  );
};

// =================================================================
// UI Components
// =================================================================

const Header: React.FC = () => (
  <header className="w-full p-2 absolute top-0 left-0 z-10">
    <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
      <div className="jackpot-bar">
        <span className="jackpot-text">JACKPOT</span>
      </div>
      <div className="text-xs text-gray-400 breadcrumbs">
        <span>1XGAMES</span> / <span>ألعاب أخرى</span> / <span>GOAL!</span>
      </div>
    </div>
  </header>
);

const PlayerCard: React.FC<{ imageUrl: string; side: 'left' | 'right' }> = ({ imageUrl, side }) => (
  <div className={`absolute bottom-0 h-[85%] w-[45%] md:w-[35%] flex items-end justify-center ${side === 'left' ? 'left-0' : 'right-0'}`}>
    <img src={imageUrl} alt="Player" className="max-w-full max-h-full object-contain" />
  </div>
);

const BetSelector: React.FC<{
  selectedAmount: number;
  onSelect: (amount: number) => void;
  disabled: boolean;
}> = ({ selectedAmount, onSelect, disabled }) => {
  const amounts = [0.1, 1, 2, 5, 10, 50, 100];
  return (
    <div className="flex items-center justify-center bg-purple-900/50 p-1 rounded-md mt-4">
      <button
        onClick={() => onSelect(selectedAmount / 2)}
        disabled={disabled}
        className="px-4 py-1.5 text-lg font-bold bg-red-600 rounded-md hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        X
      </button>
      {amounts.map((amount) => (
        <button
          key={amount}
          onClick={() => onSelect(amount)}
          disabled={disabled}
          className={`flex-1 px-2 py-1.5 text-sm font-semibold rounded-md mx-0.5 transition-colors
            ${selectedAmount === amount ? 'bg-yellow-500 text-black' : 'bg-purple-800/60 text-white'}
            ${!disabled ? 'hover:bg-purple-700' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {amount}
        </button>
      ))}
      <input
        type="number"
        value={selectedAmount}
        onChange={(e) => onSelect(Number(e.target.value))}
        disabled={disabled}
        className="w-20 text-center bg-white text-black font-bold p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-400"
      />
    </div>
  );
};

// =================================================================
// Main App Component
// =================================================================

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [betChoice, setBetChoice] = useState<BetChoice | null>(null);
  const [betAmount, setBetAmount] = useState<number>(5);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAppState(AppState.ANALYZING);
    setError(null);
    setGameResult(null);

    try {
      const imgFile = await fileToImageFile(file);
      setImageFile(imgFile);
      const result = await analyzeImage(imgFile.base64);

      if (result === 'VALID') {
        setAppState(AppState.READY);
      } else {
        setError("Invalid image. Please upload a valid game screen.");
        setAppState(AppState.ERROR);
      }
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${message}`);
      setAppState(AppState.ERROR);
    }
  };

  const handlePlaceBet = () => {
    if (!betChoice) return;
    setAppState(AppState.PLAYING);
    // Simulate game result
    setTimeout(() => {
      const aiChoice: BetChoice = Math.random() > 0.5 ? BetChoice.GOAL : BetChoice.NO_GOAL;
      const result = aiChoice === betChoice ? GameResult.WIN : GameResult.LOSE;
      setGameResult(result);
      setAppState(AppState.RESULT);
    }, 2000);
  };

  const resetGame = () => {
    setAppState(AppState.IDLE);
    setImageFile(null);
    setError(null);
    setBetChoice(null);
    setBetAmount(5);
    setGameResult(null);
    if(imageInputRef.current) {
        imageInputRef.current.value = "";
    }
  };

  const isBettingDisabled = appState !== AppState.READY;
  const canPlaceBet = appState === AppState.READY && betChoice !== null;

  const memoizedHeader = useMemo(() => <Header />, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-brand-dark-blue font-cairo">
      {memoizedHeader}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-lines-pattern opacity-10"></div>

      <main className="relative w-full h-full flex items-center justify-center z-0">
        <PlayerCard imageUrl={NEYMAR_IMAGE_URL} side="left" />
        <PlayerCard imageUrl={MESSI_IMAGE_URL} side="right" />

        <div className="w-full md:w-1/2 max-w-lg flex flex-col items-center justify-center text-white p-4 z-10">
          {/* GOAL Title */}
          <div className="relative text-center mb-4">
            <h1 className="text-8xl md:text-9xl font-teko font-bold text-yellow-400 tracking-widest goal-text">GOAL!</h1>
            <p className="text-sm font-semibold -mt-2 text-gray-300">كيفية اللعب</p>
            <div className="absolute inset-0 goal-graphic opacity-30"></div>
          </div>

          <p className="font-semibold text-lg mb-2">اختر نتيجة!</p>

          {/* Betting Choices */}
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={() => setBetChoice(BetChoice.GOAL)}
              disabled={isBettingDisabled}
              className={`bet-choice-button bg-green-gradient ${betChoice === BetChoice.GOAL ? 'selected' : ''}`}
            >
              <div className="bet-choice-circle"></div>
              <span>هدف</span>
            </button>
            <button
              onClick={() => setBetChoice(BetChoice.NO_GOAL)}
              disabled={isBettingDisabled}
              className={`bet-choice-button bg-red-gradient ${betChoice === BetChoice.NO_GOAL ? 'selected' : ''}`}
            >
              <span>لا هدف</span>
              <div className="bet-choice-circle"></div>
            </button>
          </div>

          <BetSelector selectedAmount={betAmount} onSelect={setBetAmount} disabled={isBettingDisabled} />

          {/* Action Button */}
          {appState === AppState.IDLE || appState === AppState.ERROR ? (
            <div className="text-center mt-6">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="place-bet-button bg-green-700 hover:bg-green-600"
              >
                Analyze Match Image
              </button>
              <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
            </div>
          ) : (
            <button
              onClick={handlePlaceBet}
              disabled={!canPlaceBet}
              className="place-bet-button mt-6 bg-olive-gradient disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              وضع الرهان
            </button>
          )}
        </div>
      </main>

      {(appState === AppState.ANALYZING || appState === AppState.PLAYING) && (
        <LoadingIndicator text={appState === AppState.ANALYZING ? 'Analyzing Image...' : 'Placing Bet...'} />
      )}
      {appState === AppState.RESULT && gameResult && (
        <ResultPopup result={gameResult} onReset={resetGame} />
      )}
    </div>
  );
};

export default App;
