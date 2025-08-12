'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaDiscord, FaEnvelope, FaCopy, FaCheck, FaPaperPlane, FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  user: string;
}

interface ContactCardProps {
  type: string;
  value: string;
  icon: React.ComponentType<any>;
}

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Tetromino {
  type: TetrominoType;
  shape: boolean[][];
  x: number;
  y: number;
  color: string;
}

// Optional Video Background Component
const VideoBackground = () => {
  const [hasVideo, setHasVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if video exists - replace with your actual video path
    const videoPath = '/videos/Eyeloading-bg.mp4'; // Change this to your video path
    
    const video = document.createElement('video');
    video.src = videoPath;
    
    video.onloadeddata = () => {
      setHasVideo(true);
      setIsLoading(false);
    };
    
    video.onerror = () => {
      setHasVideo(false);
      setIsLoading(false);
    };

    return () => {
      video.src = '';
    };
  }, []);

  if (!hasVideo || isLoading) return null;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute top-0 left-0 w-full h-full object-cover ${
          theme === 'dark' ? 'opacity-20' : 'opacity-10'
        }`}
      >
        <source src="/videos/Eyeloading-bg.mp4" type="video/mp4" />
      </video>
      <div className={`absolute inset-0 ${
        theme === 'dark' ? 'bg-black/70' : 'bg-white/70'
      }`} />
    </div>
  );
};

// Optional Music Player Component
const MusicPlayer = ({ shouldPlay }: { shouldPlay: boolean }) => {
  const [hasAudio, setHasAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!audioRef.current) {
      const audioPath = '/crypto-dreams.mp3';
      const audio = new Audio(audioPath);
      audio.volume = volume;
      audio.loop = true;
      audioRef.current = audio;
      
      if (shouldPlay) {
        audio.play().catch(err => console.log('Audio play failed:', err));
        setIsPlaying(true);
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [shouldPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  if (!hasAudio) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${
      theme === 'dark' ? 'bg-black/90' : 'bg-white/90'
    } border-2 ${
      theme === 'dark' ? 'border-white' : 'border-black'
    } p-4 rounded-lg backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className={`p-2 ${
            theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'
          } transition-colors`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        
        <button
          onClick={toggleMute}
          className={`p-2 ${
            theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'
          } transition-colors`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24"
          disabled={isMuted}
        />
      </div>
      <div className={`text-xs mt-2 font-mono ${
        theme === 'dark' ? 'text-white/60' : 'text-black/60'
      }`}>
        BACKGROUND MUSIC
      </div>
    </div>
  );
};

// Enhanced Complex Animated SVG with Theme Support
const ComplexAnimatedSVG = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <svg className={`w-full h-full ${isDark ? 'opacity-30' : 'opacity-20'}`} viewBox="0 0 1400 800">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ 
              stopColor: isDark ? '#00ffff' : '#0066ff', 
              stopOpacity: 0.8 
            }}>
              <animate attributeName="stop-opacity" values="0.8;0.3;0.8" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ 
              stopColor: isDark ? '#ff00ff' : '#ff0066', 
              stopOpacity: 0.3 
            }}>
              <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Complex Geometric Pattern 1 */}
        <g transform="translate(200, 200)">
          <rect 
            x="-50" 
            y="-50" 
            width="100" 
            height="100" 
            fill="url(#gradient1)" 
            filter="url(#glow)"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="20s"
              repeatCount="indefinite"
            />
          </rect>
          <circle 
            cx="0" 
            cy="0" 
            r="30" 
            fill="none" 
            stroke={isDark ? '#ffffff' : '#000000'} 
            strokeWidth="2" 
            opacity="0.5"
          >
            <animate attributeName="r" values="30;60;30" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Complex Geometric Pattern 2 */}
        <g transform="translate(600, 400)">
          <polygon 
            points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" 
            fill="url(#gradient1)" 
            filter="url(#glow)"
            opacity="0.6"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="-360"
              dur="15s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <circle
            key={i}
            cx={100 + (i * 80)}
            cy={100 + (i * 30)}
            r="3"
            fill={isDark ? '#ffffff' : '#000000'}
            opacity="0.3"
          >
            <animate 
              attributeName="cy" 
              values={`${100 + (i * 30)};${150 + (i * 30)};${100 + (i * 30)}`} 
              dur={`${3 + i * 0.5}s`} 
              repeatCount="indefinite" 
            />
            <animate 
              attributeName="opacity" 
              values="0.3;0.8;0.3" 
              dur={`${2 + i * 0.3}s`} 
              repeatCount="indefinite" 
            />
          </circle>
        ))}

        {/* Wave Pattern */}
        <path
          d="M0,400 Q350,300 700,400 T1400,400"
          stroke={isDark ? '#00ffff' : '#0066ff'}
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        >
          <animate 
            attributeName="d" 
            values="M0,400 Q350,300 700,400 T1400,400;M0,400 Q350,500 700,400 T1400,400;M0,400 Q350,300 700,400 T1400,400"
            dur="8s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

// Enhanced Tetris Game with Theme Support
const TetrisGame = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const dropTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [lines, setLines] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const boardRef = useRef<(string | null)[][]>(Array(20).fill(null).map(() => Array(10).fill(null)));
  const currentPieceRef = useRef<Tetromino | null>(null);
  const nextPieceRef = useRef<Tetromino | null>(null);

  const tetrominoes: Record<TetrominoType, { shape: boolean[][], color: string }> = {
    'I': { shape: [[true, true, true, true]], color: '#00ffff' },
    'O': { shape: [[true, true], [true, true]], color: '#ffff00' },
    'T': { shape: [[false, true, false], [true, true, true]], color: '#800080' },
    'S': { shape: [[false, true, true], [true, true, false]], color: '#00ff00' },
    'Z': { shape: [[true, true, false], [false, true, true]], color: '#ff0000' },
    'J': { shape: [[true, false, false], [true, true, true]], color: '#0000ff' },
    'L': { shape: [[false, false, true], [true, true, true]], color: '#ffa500' }
  };

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedHighScore = parseInt(localStorage.getItem('tetrisHighScore') || '0');
    setHighScore(savedHighScore);
  }, []);

  const createRandomPiece = useCallback((): Tetromino => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const type = types[Math.floor(Math.random() * types.length)];
    const template = tetrominoes[type];

    return {
      type,
      shape: template.shape.map(row => [...row]),
      x: Math.floor((10 - template.shape[0].length) / 2),
      y: 0,
      color: template.color
    };
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const blockSize = isMobile ? 20 : 25;
    const boardWidth = 10 * blockSize;
    const boardHeight = 20 * blockSize;

    // Clear canvas with theme-appropriate background
    ctx.fillStyle = isDark ? '#000000' : '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board grid with theme colors
    ctx.strokeStyle = isDark ? '#333333' : '#cccccc';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 10; x++) {
      ctx.beginPath();
      ctx.moveTo(x * blockSize, 0);
      ctx.lineTo(x * blockSize, boardHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= 20; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * blockSize);
      ctx.lineTo(boardWidth, y * blockSize);
      ctx.stroke();
    }

    // Draw placed blocks
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        if (boardRef.current[y][x]) {
          ctx.fillStyle = boardRef.current[y][x]!;
          ctx.fillRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, blockSize - 2);

          // Add highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, 3);
        }
      }
    }

    // Draw current piece
    if (currentPieceRef.current) {
      const piece = currentPieceRef.current;
      ctx.fillStyle = piece.color;

      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const drawX = (piece.x + x) * blockSize + 1;
            const drawY = (piece.y + y) * blockSize + 1;
            ctx.fillRect(drawX, drawY, blockSize - 2, blockSize - 2);

            // Add highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(drawX, drawY, blockSize - 2, 3);
            ctx.fillStyle = piece.color;
          }
        }
      }
    }
  }, [isMobile, isDark]);

  const isValidPosition = useCallback((piece: Tetromino, newX: number, newY: number, newShape?: boolean[][]): boolean => {
    const shape = newShape || piece.shape;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;

          if (boardX < 0 || boardX >= 10 || boardY >= 20) return false;
          if (boardY >= 0 && boardRef.current[boardY][boardX]) return false;
        }
      }
    }
    return true;
  }, []);

  const rotatePiece = useCallback((piece: Tetromino): boolean[][] => {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    return rotated;
  }, []);

  const clearLines = useCallback(() => {
    let linesCleared = 0;
    const newBoard = [...boardRef.current];

    for (let y = 19; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== null)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(10).fill(null));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      boardRef.current = newBoard;
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + (linesCleared * 100 * level));
      setLevel(Math.floor((lines + linesCleared) / 10) + 1);
    }
  }, [level, lines]);

  const placePiece = useCallback(() => {
    if (!currentPieceRef.current) return;

    const piece = currentPieceRef.current;
    const newBoard = [...boardRef.current];

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }

    boardRef.current = newBoard;
    clearLines();

    if (piece.y <= 0) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('tetrisHighScore', score.toString());
      }
      return;
    }

    currentPieceRef.current = nextPieceRef.current;
    nextPieceRef.current = createRandomPiece();
  }, [clearLines, createRandomPiece, highScore, score]);

  const dropPiece = useCallback(() => {
    if (!currentPieceRef.current || gameOver || isPaused) return;

    const piece = currentPieceRef.current;

    if (isValidPosition(piece, piece.x, piece.y + 1)) {
      currentPieceRef.current = { ...piece, y: piece.y + 1 };
    } else {
      placePiece();
    }
  }, [gameOver, isPaused, isValidPosition, placePiece]);

  const movePiece = useCallback((direction: 'left' | 'right' | 'down' | 'rotate') => {
    if (!currentPieceRef.current || gameOver || isPaused) return;

    const piece = currentPieceRef.current;

    switch (direction) {
      case 'left':
        if (isValidPosition(piece, piece.x - 1, piece.y)) {
          currentPieceRef.current = { ...piece, x: piece.x - 1 };
        }
        break;
      case 'right':
        if (isValidPosition(piece, piece.x + 1, piece.y)) {
          currentPieceRef.current = { ...piece, x: piece.x + 1 };
        }
        break;
      case 'down':
        dropPiece();
        break;
      case 'rotate':
        const rotatedShape = rotatePiece(piece);
        if (isValidPosition(piece, piece.x, piece.y, rotatedShape)) {
          currentPieceRef.current = { ...piece, shape: rotatedShape };
        }
        break;
    }
  }, [dropPiece, gameOver, isPaused, isValidPosition, rotatePiece]);

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        drawGame();
      }, 16);

      dropTimerRef.current = setInterval(() => {
        dropPiece();
      }, Math.max(50, 500 - (level * 50)));
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (dropTimerRef.current) clearInterval(dropTimerRef.current);
    };
  }, [gameStarted, gameOver, isPaused, drawGame, dropPiece, level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const blockSize = isMobile ? 20 : 25;
      canvas.width = 10 * blockSize;
      canvas.height = 20 * blockSize;
      drawGame();
    }
  }, [drawGame, isMobile]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;

      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          e.preventDefault();
          movePiece('left');
          break;
        case 'd':
        case 'arrowright':
          e.preventDefault();
          movePiece('right');
          break;
        case 's':
        case 'arrowdown':
          e.preventDefault();
          movePiece('down');
          break;
        case 'w':
        case 'arrowup':
        case ' ':
          e.preventDefault();
          movePiece('rotate');
          break;
        case 'p':
          e.preventDefault();
          setIsPaused(!isPaused);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, isPaused, movePiece]);

  const startGame = () => {
    boardRef.current = Array(20).fill(null).map(() => Array(10).fill(null));
    currentPieceRef.current = createRandomPiece();
    nextPieceRef.current = createRandomPiece();
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`${isDark ? 'bg-black border-white' : 'bg-white border-black'} border-4 p-8`}>
        <div className="flex justify-between items-center mb-6 font-mono text-xl font-bold">
          <div className={isDark ? 'text-white' : 'text-black'}>T E T R I S</div>
          <div className={`flex gap-6 text-base ${isDark ? 'text-white' : 'text-black'}`}>
            <div>SCORE: {score.toString().padStart(6, '0')}</div>
            <div>LEVEL: {level.toString().padStart(2, '0')}</div>
            <div>LINES: {lines.toString().padStart(3, '0')}</div>
            <div>BEST: {highScore.toString().padStart(6, '0')}</div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className={`relative border-4 ${isDark ? 'border-white bg-black' : 'border-black bg-white'}`}>
            <canvas 
              ref={canvasRef}
              className="block"
            />

            {!gameStarted && (
              <div className={`absolute inset-0 ${isDark ? 'bg-black/95' : 'bg-white/95'} flex flex-col items-center justify-center`}>
                <div className={`text-4xl font-mono mb-6 font-bold ${isDark ? 'text-white' : 'text-black'}`}>TETRIS</div>
                <button
                  onClick={startGame}
                  className={`px-8 py-4 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} font-mono text-lg font-bold transition-colors`}
                >
                  START GAME
                </button>
                <div className={`mt-4 text-sm font-mono ${isDark ? 'text-white/60' : 'text-black/60'} text-center`}>
                  {isMobile ? 'USE BUTTONS BELOW' : 'WASD / ARROWS TO PLAY • SPACE/W TO ROTATE • P TO PAUSE'}
                </div>
              </div>
            )}

            {gameOver && (
              <div className={`absolute inset-0 ${isDark ? 'bg-black/95' : 'bg-white/95'} flex flex-col items-center justify-center`}>
                <div className={`text-3xl font-mono mb-3 font-bold ${isDark ? 'text-white' : 'text-black'}`}>GAME OVER</div>
                <div className={`text-lg font-mono mb-2 ${isDark ? 'text-white' : 'text-black'}`}>FINAL SCORE: {score}</div>
                <div className={`text-sm font-mono mb-6 ${isDark ? 'text-white/60' : 'text-black/60'}`}>LINES CLEARED: {lines}</div>
                <button
                  onClick={resetGame}
                  className={`px-8 py-4 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} font-mono text-lg font-bold transition-colors`}
                >
                  PLAY AGAIN
                </button>
              </div>
            )}

            {isPaused && gameStarted && !gameOver && (
              <div className={`absolute inset-0 ${isDark ? 'bg-black/95' : 'bg-white/95'} flex flex-col items-center justify-center`}>
                <div className={`text-3xl font-mono mb-6 font-bold ${isDark ? 'text-white' : 'text-black'}`}>PAUSED</div>
                <button
                  onClick={() => setIsPaused(false)}
                  className={`px-8 py-4 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} font-mono text-lg font-bold transition-colors`}
                >
                  RESUME
                </button>
              </div>
            )}
          </div>
        </div>

        {isMobile && gameStarted && !gameOver && (
          <div className="mt-6 flex justify-center">
            <div className="grid grid-cols-4 gap-3 max-w-64">
              <button 
                onClick={() => movePiece('left')}
                className={`${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} p-4 font-mono text-lg font-bold transition-colors`}
              >
                ←
              </button>
              <button 
                onClick={() => movePiece('rotate')}
                className={`${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} p-4 font-mono text-lg font-bold transition-colors`}
              >
                ↻
              </button>
              <button 
                onClick={() => movePiece('right')}
                className={`${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} p-4 font-mono text-lg font-bold transition-colors`}
              >
                →
              </button>
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className={`${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} p-4 font-mono text-lg font-bold transition-colors`}
              >
                {isPaused ? '▶' : '⏸'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Contact Card with Theme Support
const ContactCard: React.FC<ContactCardProps> = ({ type, value, icon: Icon }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      className={`${isDark ? 'bg-black border-white hover:bg-white hover:text-black' : 'bg-white border-black hover:bg-black hover:text-white'} border-4 p-8 cursor-pointer transition-all duration-200 group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Icon className="text-4xl group-hover:scale-110 transition-transform duration-200" />
          <div>
            <div className="text-sm font-mono font-bold opacity-60 mb-2">{type}</div>
            <div className="text-2xl font-mono font-bold">{value}</div>
          </div>
        </div>
        <div className="text-3xl">
          {copied ? <FaCheck className="text-green-600" /> : <FaCopy className="group-hover:scale-110 transition-transform duration-200" />}
        </div>
      </div>
    </div>
  );
};

// Enhanced Live Chat with Theme Support
const LiveChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [username] = useState<string>(`user_${Math.random().toString(36).substring(2, 6)}`);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.log('No API available - using local mode');
    }
  };

  const sendMessage = async (message: Message): Promise<boolean> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      if (res.ok) {
        fetchMessages();
        return true;
      }
    } catch (error) {
      console.log('API not available - adding locally');
      setMessages(prev => [...prev, message]);
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      user: username
    };

    const success = await sendMessage(message);
    if (success) {
      setNewMessage('');
    }
    setIsLoading(false);

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`${isDark ? 'bg-black border-white' : 'bg-white border-black'} border-4`}>
      <div className={`${isDark ? 'border-white' : 'border-black'} border-b-4 p-6`}>
        <div className="flex justify-between items-center">
          <div className={`font-mono text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>DROP A MESSAGE HERE</div>
          <div className={`font-mono text-base ${isDark ? 'text-white/80' : 'text-black/80'}`}>say hi or whatever</div>
        </div>
        <div className={`font-mono text-sm ${isDark ? 'text-white/80' : 'text-black/80'} mt-2`}>
          chatting as: {username}
        </div>
      </div>

      <div className={`h-64 overflow-y-auto p-6 space-y-3 ${isDark ? 'bg-black' : 'bg-white'}`}>
        {messages.length === 0 ? (
          <div className={`${isDark ? 'text-white/40' : 'text-black/40'} font-mono text-base text-center py-8`}>
            NO MESSAGES YET...<br/>
            <span className="text-sm">BE THE FIRST TO SAY SOMETHING</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="font-mono text-sm">
              <span className={`${isDark ? 'text-white/40' : 'text-black/40'}`}>[{msg.timestamp}]</span>{' '}
              <span className={`font-bold ${msg.user === username ? 'text-blue-500' : (isDark ? 'text-white' : 'text-black')}`}>
                {msg.user}:
              </span>{' '}
              <span className={`${isDark ? 'text-white/90' : 'text-black/90'} text-base`}>{msg.text}</span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <div className={`${isDark ? 'border-white' : 'border-black'} border-t-4 p-6`}>
        <div className="flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="type something nice... or not, i don't judge"
            className={`flex-1 ${isDark ? 'bg-black border-white text-white placeholder-white/40 focus:bg-white/5' : 'bg-white border-black text-black placeholder-black/40 focus:bg-black/5'} border-2 px-4 py-3 font-mono text-base focus:outline-none transition-colors`}
            maxLength={200}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !newMessage.trim()}
            className={`${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} px-6 py-3 font-mono text-base font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {isLoading ? (
              <span>SENDING...</span>
            ) : (
              <>
                <FaPaperPlane />
                SEND
              </>
            )}
          </button>
        </div>
        <div className={`mt-3 text-xs font-mono ${isDark ? 'text-white/30' : 'text-black/30'}`}>
          {newMessage.length}/200 CHARACTERS
        </div>
      </div>
    </div>
  );
};

// Main Contact Page Component
export default function ContactPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleEnterClick = () => {
    setHasInteracted(true);
    // Try to play both hidden audio and MusicPlayer audio
    const bgAudio = document.getElementById('bgMusic') as HTMLAudioElement;
    if (bgAudio) {
      bgAudio.volume = 0.3;
      bgAudio.play().catch(err => console.log('Play failed:', err));
    }
  };

  const contacts = [
    { type: 'DISCORD', value: '@me_straight', icon: FaDiscord },
    { type: 'EMAIL', value: 'gk5598507@gmail.com', icon: FaEnvelope }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} font-mono transition-colors duration-300`}>
      {/* Hidden backup audio element */}
      <audio
        id="bgMusic"
        src="/crypto-dreams.mp3"
        loop
        style={{ display: 'none' }}
      />

      {/* Click to Enter Overlay */}
      {!hasInteracted && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center cursor-pointer backdrop-blur-sm"
          onClick={handleEnterClick}
        >
          <div className="text-center animate-pulse">
            <h2 className="text-4xl font-bold text-white mb-4">CLICK TO ENTER</h2>
            <p className="text-white/60">Enable sound and animations</p>
          </div>
        </div>
      )}
      
      {/* Optional Video Background */}
      <VideoBackground />
      
      {/* Complex Animated SVG */}
      <ComplexAnimatedSVG />
      
      {/* Optional Music Player with shouldPlay prop */}
      <MusicPlayer shouldPlay={hasInteracted} />
      
      {/* Content with navbar spacing */}
      <div className="pt-24 pb-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className={`text-7xl md:text-9xl font-black mb-6 leading-none ${isDark ? 'text-white' : 'text-black'}`}>
              Talk to me :3
            </h1>
            <h2 className={`text-3xl md:text-5xl font-bold mb-8 ${isDark ? 'text-white/80' : 'text-black/80'}`}>
              wanna work together? let's make something sick
            </h2>
            <p className={`text-lg font-mono leading-relaxed max-w-2xl ${isDark ? 'text-white/70' : 'text-black/70'}`}>
              yo! im a collage student and this my hobby- i'm down to work on cool projects that actually matter<br/>
              whether it's web dev, backend, hosting, UI/Ux, or just your wild ideas<br/>
              i'll bring the energy and make it worth your time fr + its gonna be cheap for you and i will get some moni too :3
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {contacts.map((contact) => (
              <ContactCard key={contact.type} {...contact} />
            ))}
          </div>

          {/* Chat Section */}
          <div className="mb-12">
            <LiveChat />
          </div>

          {/* Tetris Game Bar at Bottom */}
          <div className="w-full">
            <TetrisGame />
          </div>
        </div>
      </div>
    </div>
  );
}