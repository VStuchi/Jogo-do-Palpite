/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameSocket } from './hooks/useGameSocket.ts';
import { Header } from './components/Header.tsx';
import { HomeScreen } from './components/HomeScreen.tsx';
import { LobbyView } from './components/LobbyView.tsx';
import { QuestionView } from './components/QuestionView.tsx';
import { VotingView } from './components/VotingView.tsx';
import { RevealView } from './components/RevealView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { GameOverView } from './components/GameOverView.tsx';
import { RulesModal } from './components/RulesModal.tsx';
import { ServerSettingsModal } from './components/ServerSettingsModal.tsx';
import { LocalPartyGame } from './components/LocalPartyGame.tsx';

export default function App() {
  const {
    isConnected,
    isConnecting,
    isP2P,
    toggleP2P,
    backendUrl,
    setCustomBackendUrl,
    gameState,
    myPlayerId,
    roomCode,
    isHost,
    errorMessage,
    createRoom,
    joinRoom,
    addBot,
    removePlayer,
    updateSettings,
    startGame,
    submitGuess,
    submitVote,
    nextRound,
    playAgain,
    leaveRoom,
    clearError
  } = useGameSocket();

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      {/* Global Header */}
      <Header
        roomCode={roomCode}
        phase={gameState?.phase}
        playerCount={gameState?.players.length}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onLeave={roomCode ? leaveRoom : undefined}
        onOpenRules={() => setIsRulesModalOpen(true)}
        onOpenServerSettings={() => setIsServerModalOpen(true)}
        onToggleLocalGame={() => setIsLocalMode(!isLocalMode)}
        isLocalMode={isLocalMode}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center">
        {isLocalMode ? (
          <LocalPartyGame onBack={() => setIsLocalMode(false)} />
        ) : !gameState || !roomCode ? (
          <HomeScreen
            onCreateRoom={(hostName, avatar, color, hostPlays, settings) => {
              createRoom(hostName, avatar, color, hostPlays, settings);
            }}
            onJoinRoom={(code, name, avatar, color) => {
              joinRoom(code, name, avatar, color);
            }}
            onOpenRules={() => setIsRulesModalOpen(true)}
            onOpenLocalMode={() => setIsLocalMode(true)}
            onOpenServerSettings={() => setIsServerModalOpen(true)}
            isConnected={isConnected}
            errorMessage={errorMessage}
            onClearError={clearError}
          />
        ) : (
          <>
            {gameState.phase === 'LOBBY' && (
              <LobbyView
                gameState={gameState}
                myPlayerId={myPlayerId}
                isHost={isHost}
                onStartGame={(customQuestions) => startGame(customQuestions)}
                onAddBot={addBot}
                onRemovePlayer={removePlayer}
              />
            )}

            {gameState.phase === 'QUESTION' && (
              <QuestionView
                gameState={gameState}
                myPlayerId={myPlayerId}
                isHost={isHost}
                onSubmitGuess={submitGuess}
              />
            )}

            {gameState.phase === 'VOTING' && (
              <VotingView
                gameState={gameState}
                myPlayerId={myPlayerId}
                isHost={isHost}
                onSubmitVote={submitVote}
              />
            )}

            {gameState.phase === 'REVEAL' && (
              <RevealView
                gameState={gameState}
                myPlayerId={myPlayerId}
                isHost={isHost}
                onNextRound={nextRound}
              />
            )}

            {gameState.phase === 'LEADERBOARD' && (
              <LeaderboardView
                gameState={gameState}
                myPlayerId={myPlayerId}
                isHost={isHost}
                onNextRound={nextRound}
              />
            )}

            {gameState.phase === 'GAME_OVER' && (
              <GameOverView
                gameState={gameState}
                myPlayerId={myPlayerId}
                isHost={isHost}
                onPlayAgain={playAgain}
                onLeave={leaveRoom}
              />
            )}
          </>
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Server Settings Modal */}
      <ServerSettingsModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        isConnected={isConnected}
        isConnecting={isConnecting}
        isP2P={isP2P}
        onToggleP2P={toggleP2P}
        currentBackendUrl={backendUrl}
        onSaveBackendUrl={setCustomBackendUrl}
      />

      {/* Footer */}
      <footer className="py-4 border-t border-slate-900/80 text-center text-xs text-slate-500">
        <p>Chute Certo & O Pior Palpite • Jogo party multiplayer em tempo real</p>
      </footer>
    </div>
  );
}
