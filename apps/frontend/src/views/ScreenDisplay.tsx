import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useScreenState } from '@/hooks/usePlayer';
import { useSettings } from '@/hooks/useSettings';
import { getFileUrl } from '@/api/files';
import { DEFAULT_SETTINGS } from '@/types/settings';
import type { ScreenState, TextDisplayItem } from '@/types/player';

// ========== MAIN COMPONENT ==========

export function ScreenDisplay() {
  // Updates via WebSocket notifications only, no polling
  const { data: screenState } = useScreenState();
  const { data: settings } = useSettings();

  const state = screenState ?? { mode: 'empty' as const };
  const displaySettings = settings?.display ?? DEFAULT_SETTINGS.display;

  // Jeśli stan jest pusty lub zawartość jest ukryta, pokaż czarny ekran
  const isHidden = state.mode === 'empty' || !state.visible;

  return (
    <div 
      className="min-h-screen text-white flex items-center justify-center"
      style={{ backgroundColor: displaySettings.backgroundColor }}
    >
      {isHidden ? <BlackScreen displaySettings={displaySettings} /> : <DisplayContent state={state} displaySettings={displaySettings} />}
    </div>
  );
}

// ========== BLACK SCREEN ==========

function BlackScreen({ displaySettings }: { displaySettings: typeof DEFAULT_SETTINGS.display }) {
  return (
    <div 
      className="w-full h-screen" 
      style={{ backgroundColor: displaySettings.backgroundColor }}
    />
  );
}

// ========== DISPLAY CONTENT ==========

function DisplayContent({ 
  state, 
  displaySettings 
}: { 
  state: ScreenState;
  displaySettings: typeof DEFAULT_SETTINGS.display;
}) {
  if (state.mode === 'empty') {
    return <BlackScreen displaySettings={displaySettings} />;
  }

  const item = state.mode === 'single' ? state.item : state.currentItem;

  switch (item.type) {
    case 'text':
      return <TextDisplay item={item} displaySettings={displaySettings} />;
    case 'image':
      return <ImageDisplay path={item.path} displaySettings={displaySettings} />;
    case 'video':
      return <VideoDisplay path={item.path} displaySettings={displaySettings} />;
    case 'audio':
      return <AudioDisplay path={item.path} displaySettings={displaySettings} />;
    case 'heading':
      return <HeadingDisplay content={item.content} displaySettings={displaySettings} />;
    case 'qrcode':
      return <QRCodeDisplay item={item} displaySettings={displaySettings} />;
    case 'blank':
      return <BlackScreen displaySettings={displaySettings} />;
  }
}

// ========== TEXT DISPLAY ==========

function TextDisplay({ 
  item, 
  displaySettings 
}: { 
  item: TextDisplayItem;
  displaySettings: typeof DEFAULT_SETTINGS.display;
}) {
  const paddingStyle = {
    paddingTop: `${displaySettings.padding.top}px`,
    paddingRight: `${displaySettings.padding.right}px`,
    paddingBottom: `${displaySettings.padding.bottom}px`,
    paddingLeft: `${displaySettings.padding.left}px`,
  };

  const textStyle = {
    fontSize: `${displaySettings.fontSize}px`,
    fontFamily: displaySettings.fontFamily,
    lineHeight: displaySettings.lineHeight,
    letterSpacing: `${displaySettings.letterSpacing}px`,
    color: displaySettings.textColor,
    textAlign: displaySettings.textAlign,
  };

  return (
    <div 
      className="w-full min-h-screen flex items-center justify-center"
      style={paddingStyle}
    >
      <div className="w-full">
        <div
          className="whitespace-pre-wrap drop-shadow-lg"
          style={textStyle}
        >
          {item.slideContent || ''}
        </div>
      </div>
    </div>
  );
}

// ========== IMAGE DISPLAY ==========

function ImageDisplay({ 
  path, 
  displaySettings 
}: { 
  path: string;
  displaySettings: typeof DEFAULT_SETTINGS.display;
}) {
  const imageUrl = getFileUrl(path);
  const paddingStyle = {
    paddingTop: `${displaySettings.padding.top}px`,
    paddingRight: `${displaySettings.padding.right}px`,
    paddingBottom: `${displaySettings.padding.bottom}px`,
    paddingLeft: `${displaySettings.padding.left}px`,
  };

  return (
    <div 
      className="w-full h-screen flex items-center justify-center"
      style={paddingStyle}
    >
      <img
        src={imageUrl}
        alt=""
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}

// ========== VIDEO DISPLAY ==========

function VideoDisplay({ 
  path, 
  displaySettings 
}: { 
  path: string;
  displaySettings: typeof DEFAULT_SETTINGS.display;
}) {
  const videoUrl = getFileUrl(path);
  const [key, setKey] = useState(path);
  const paddingStyle = {
    paddingTop: `${displaySettings.padding.top}px`,
    paddingRight: `${displaySettings.padding.right}px`,
    paddingBottom: `${displaySettings.padding.bottom}px`,
    paddingLeft: `${displaySettings.padding.left}px`,
  };

  // Reset video when path changes
  useEffect(() => {
    setKey(path);
  }, [path]);

  return (
    <div 
      className="w-full h-screen flex items-center justify-center"
      style={paddingStyle}
    >
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

function AudioDisplay({ 
  path, 
  displaySettings 
}: { 
  path: string;
  displaySettings: typeof DEFAULT_SETTINGS.display;
}) {
  const audioUrl = getFileUrl(path);
  const [key, setKey] = useState(path);
  const filename = path.split('/').pop() ?? path;
  const paddingStyle = {
    paddingTop: `${displaySettings.padding.top}px`,
    paddingRight: `${displaySettings.padding.right}px`,
    paddingBottom: `${displaySettings.padding.bottom}px`,
    paddingLeft: `${displaySettings.padding.left}px`,
  };

  // Reset audio when path changes
  useEffect(() => {
    setKey(path);
  }, [path]);

  return (
    <div 
      className="w-full h-screen flex flex-col items-center justify-center"
      style={paddingStyle}
    >
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
        <p 
          className="text-2xl font-medium"
          style={{ color: displaySettings.textColor }}
        >
          {filename}
        </p>
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

function HeadingDisplay({ 
  content, 
  displaySettings 
}: { 
  content: string;
  displaySettings: typeof DEFAULT_SETTINGS.display;
}) {
  const paddingStyle = {
    paddingTop: `${displaySettings.padding.top}px`,
    paddingRight: `${displaySettings.padding.right}px`,
    paddingBottom: `${displaySettings.padding.bottom}px`,
    paddingLeft: `${displaySettings.padding.left}px`,
  };

  const textStyle = {
    fontSize: `${displaySettings.fontSize * 1.5}px`, // Większa czcionka dla nagłówków
    fontFamily: displaySettings.fontFamily,
    lineHeight: displaySettings.lineHeight,
    letterSpacing: `${displaySettings.letterSpacing}px`,
    color: displaySettings.textColor,
    textAlign: displaySettings.textAlign,
  };

  return (
    <div 
      className="w-full h-screen flex items-center justify-center"
      style={paddingStyle}
    >
      <h1 
        className="font-bold drop-shadow-lg"
        style={textStyle}
      >
        {content}
      </h1>
    </div>
  );
}

// ========== QR CODE DISPLAY ==========

function QRCodeDisplay({ 
  item, 
  displaySettings 
}: { 
  item: { type: 'qrcode'; value: string; label?: string };
  displaySettings: typeof DEFAULT_SETTINGS.display;
}) {
  const paddingStyle = {
    paddingTop: `${displaySettings.padding.top}px`,
    paddingRight: `${displaySettings.padding.right}px`,
    paddingBottom: `${displaySettings.padding.bottom}px`,
    paddingLeft: `${displaySettings.padding.left}px`,
  };

  const textStyle = {
    fontSize: `${displaySettings.fontSize}px`,
    fontFamily: displaySettings.fontFamily,
    color: displaySettings.textColor,
    textAlign: 'center' as const,
  };

  // Calculate QR code size based on screen size
  const qrSize = Math.min(800, window.innerHeight * 0.6);

  return (
    <div 
      className="w-full h-screen flex flex-col items-center justify-center"
      style={paddingStyle}
    >
      <div className="bg-white p-6 rounded-lg shadow-2xl">
        <QRCodeSVG
          value={item.value}
          size={qrSize}
          level="M"
          includeMargin={false}
        />
      </div>
      {item.label && (
        <p 
          className="mt-6 font-small"
        >
          {item.label}
        </p>
      )}
    </div>
  );
}
