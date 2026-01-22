import { useEffect, useState } from 'react';
import { useScreenState } from '@/hooks/usePlayer';
import { useText } from '@/hooks/useTexts';
import { getFileUrl } from '@/api/files';
import type { ScreenState, DisplayItem, TextDisplayItem } from '@/types/player';
import { cn } from '@/lib/utils';

// ========== MAIN COMPONENT ==========

export function ScreenDisplay() {
  const { data: screenState } = useScreenState(1000); // Poll every second

  const state = screenState ?? { mode: 'empty' as const };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <DisplayContent state={state} />
    </div>
  );
}

// ========== DISPLAY CONTENT ==========

function DisplayContent({ state }: { state: ScreenState }) {
  if (state.mode === 'empty') {
    return <EmptyDisplay />;
  }

  const item = state.mode === 'single' ? state.item : state.currentItem;

  switch (item.type) {
    case 'text':
      return <TextDisplay item={item} />;
    case 'image':
      return <ImageDisplay path={item.path} />;
    case 'video':
      return <VideoDisplay path={item.path} />;
    case 'audio':
      return <AudioDisplay path={item.path} />;
    case 'heading':
      return <HeadingDisplay content={item.content} />;
    case 'blank':
      return <EmptyDisplay />;
  }
}

// ========== EMPTY DISPLAY ==========

function EmptyDisplay() {
  return (
    <div className="w-full h-screen bg-black">
      {/* Completely black screen */}
    </div>
  );
}

// ========== TEXT DISPLAY ==========

function TextDisplay({ item }: { item: TextDisplayItem }) {
  // Extract text ID from reference
  const textId = item.textRef.split('__').pop() ?? '';
  const { data: textDoc, isLoading } = useText(textId);

  if (isLoading || !textDoc) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-xl">Ładowanie...</div>
      </div>
    );
  }

  const slide = textDoc.slides[item.slideIndex] ?? '';

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 to-black flex items-center justify-center p-8 md:p-16">
      <div className="max-w-5xl w-full">
        <div
          className={cn(
            'text-center whitespace-pre-wrap leading-relaxed',
            'text-3xl md:text-5xl lg:text-6xl font-bold',
            'text-white drop-shadow-lg'
          )}
        >
          {slide}
        </div>
      </div>
    </div>
  );
}

// ========== IMAGE DISPLAY ==========

function ImageDisplay({ path }: { path: string }) {
  const imageUrl = getFileUrl(path);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <img
        src={imageUrl}
        alt=""
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}

// ========== VIDEO DISPLAY ==========

function VideoDisplay({ path }: { path: string }) {
  const videoUrl = getFileUrl(path);
  const [key, setKey] = useState(path);

  // Reset video when path changes
  useEffect(() => {
    setKey(path);
  }, [path]);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <video
        key={key}
        src={videoUrl}
        autoPlay
        controls
        className="max-w-full max-h-full"
      />
    </div>
  );
}

// ========== AUDIO DISPLAY ==========

function AudioDisplay({ path }: { path: string }) {
  const audioUrl = getFileUrl(path);
  const [key, setKey] = useState(path);
  const filename = path.split('/').pop() ?? path;

  // Reset audio when path changes
  useEffect(() => {
    setKey(path);
  }, [path]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 to-black flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <p className="text-2xl font-medium text-white">{filename}</p>
      </div>
      <audio
        key={key}
        src={audioUrl}
        autoPlay
        controls
        className="w-full max-w-md"
      />
    </div>
  );
}

// ========== HEADING DISPLAY ==========

function HeadingDisplay({ content }: { content: string }) {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 to-black flex items-center justify-center p-8">
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white text-center drop-shadow-lg">
        {content}
      </h1>
    </div>
  );
}

