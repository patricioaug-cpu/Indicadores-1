import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Move, Tv } from 'lucide-react';

export interface PipWindowData {
  id: string;
  title: string;
  videoUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface FloatingPipWindowProps {
  key?: string;
  windowData: PipWindowData;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdate: (id: string, updates: Partial<PipWindowData>) => void;
  maxZIndex: number;
}

export default function FloatingPipWindow({
  windowData,
  onClose,
  onFocus,
  onUpdate,
  maxZIndex,
}: FloatingPipWindowProps) {
  const { id, title, videoUrl, x, y, width, height, zIndex } = windowData;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaxState, setPreMaxState] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // References to keep track of mouse offsets
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, winW: 0, winH: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Focus on mouse down / touch start
  const handleFocus = () => {
    onFocus(id);
  };

  // Drag Handlers
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    handleFocus();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      winX: x,
      winY: y,
    };

    // Prevent default scrolling on touch devices
    if ('touches' in e) {
      e.stopPropagation();
    }
  };

  // Resize Handlers
  const handleResizeStart = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (isMaximized) return;
    handleFocus();
    e.stopPropagation();
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      winW: width,
      winH: height,
    };
  };

  // Global mouse move and mouse up listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - dragStartRef.current.mouseX;
        const deltaY = clientY - dragStartRef.current.mouseY;
        
        // Calculate next coordinates and constrain inside screen boundaries
        let nextX = dragStartRef.current.winX + deltaX;
        let nextY = dragStartRef.current.winY + deltaY;

        // Keep the window fully inside screen boundaries so no borders are cut off
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const maxAllowedX = Math.max(0, screenWidth - width);
        const maxAllowedY = Math.max(0, screenHeight - height);

        nextX = Math.max(0, Math.min(maxAllowedX, nextX));
        nextY = Math.max(0, Math.min(maxAllowedY, nextY));

        onUpdate(id, { x: nextX, y: nextY });
      }

      if (isResizing) {
        const deltaX = clientX - resizeStartRef.current.mouseX;
        const deltaY = clientY - resizeStartRef.current.mouseY;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const minWidth = 320;
        const minHeight = 220;

        // Keep resizing boundaries within screen bounds
        const maxWidth = Math.max(minWidth, screenWidth - x);
        const maxHeight = Math.max(minHeight, screenHeight - y);

        const nextWidth = Math.max(minWidth, Math.min(maxWidth, resizeStartRef.current.winW + deltaX));
        const nextHeight = Math.max(minHeight, Math.min(maxHeight, resizeStartRef.current.winH + deltaY));

        onUpdate(id, { width: nextWidth, height: nextHeight });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
      if (isResizing) setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isResizing, x, y, width, height]);

  // Toggle Maximize
  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore previous state
      if (preMaxState) {
        onUpdate(id, {
          x: preMaxState.x,
          y: preMaxState.y,
          width: preMaxState.width,
          height: preMaxState.height,
        });
      }
      setIsMaximized(false);
    } else {
      // Save state and maximize
      setPreMaxState({ x, y, width, height });
      onUpdate(id, {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight - 10, // slightly less to fit
      });
      setIsMaximized(true);
    }
    handleFocus();
  };

  // Adjust window sizes if window resizes
  useEffect(() => {
    if (isMaximized) {
      onUpdate(id, {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, [isMaximized]);

  return (
    <div
      ref={windowRef}
      onMouseDown={handleFocus}
      onTouchStart={handleFocus}
      style={{
        position: 'fixed',
        left: isMaximized ? '0px' : `${x}px`,
        top: isMaximized ? '0px' : `${y}px`,
        width: isMaximized ? '100vw' : `${width}px`,
        height: isMaximized ? '100vh' : `${height}px`,
        zIndex: zIndex,
        // When maximized, cover everything. Otherwise standard absolute coords.
      }}
      className={`
        ${isMaximized ? 'rounded-none border-none' : 'rounded-2xl border'}
        bg-white dark:bg-slate-900 
        border-slate-200 dark:border-slate-800 
        shadow-2xl flex flex-col overflow-hidden 
        transition-shadow duration-300
        ${isDragging ? 'shadow-black/25 select-none' : ''}
        pointer-events-auto
      `}
      id={`floating-pip-window-${id}`}
    >
      {/* 1. Header/Drag Bar */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={`
          flex items-center justify-between px-4 py-2.5 
          bg-slate-50 dark:bg-slate-950/80 
          border-b border-slate-100 dark:border-slate-850
          ${isMaximized ? 'cursor-default' : 'cursor-move'}
          select-none shrink-0
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-red-500/10 text-red-500 p-1 rounded-md shrink-0">
            <Tv className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate select-none">
            {title}
          </span>
          {/* Pulsing indicator */}
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </div>

        {/* Windows Actions */}
        <div className="flex items-center gap-1.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          {/* Maximize Toggle */}
          <button
            onClick={toggleMaximize}
            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 transition-colors cursor-pointer"
            title={isMaximized ? 'Restaurar Tamanho' : 'Maximizar'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close Window */}
          <button
            onClick={() => onClose(id)}
            className="p-1 rounded-md bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer"
            title="Fechar Janela"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Video Player Frame Container */}
      <div className="flex-grow bg-black relative">
        {/* Transparent drag/resize block overlay */}
        {(isDragging || isResizing) && (
          <div className="absolute inset-0 bg-transparent z-10" />
        )}
        
        <iframe
          src={videoUrl}
          title="CNN LIVE Embed Player"
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* 3. Resize Grip (Only if not maximized) */}
      {!isMaximized && (
        <button
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end p-0.5 z-20 group"
          title="Arraste para Redimensionar"
        >
          <svg
            className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-indigo-505 dark:group-hover:text-indigo-400 transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          >
            <line x1="22" y1="10" x2="10" y2="22" />
            <line x1="22" y1="16" x2="16" y2="22" />
          </svg>
        </button>
      )}
    </div>
  );
}
