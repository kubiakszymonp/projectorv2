import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getFileUrl } from '@/api/files';
import { DEFAULT_SETTINGS } from '@/types/settings';
import type { ScreenState, TextDisplayItem } from '@/types/player';

type Display = typeof DEFAULT_SETTINGS.display;

/**
 * Renders the public screen content for a given state + display settings.
 * Used both by the real /display route and by the (scaled) preview in the
 * control panel. In `preview` mode media is not auto-played (no sound).
 */
export function SlideRenderer({
  state,
  displaySettings,
  preview = false,
}: {
  state: ScreenState;
  displaySettings: Display;
  preview?: boolean;
}) {
  const isHidden = state.mode === 'empty' || !state.visible;
  return isHidden ? (
    <BlankScreen displaySettings={displaySettings} />
  ) : (
    <DisplayContent state={state} displaySettings={displaySettings} preview={preview} />
  );
}

function BlankScreen({ displaySettings }: { displaySettings: Display }) {
  const mode = displaySettings.blankScreen ?? 'black';

  if (mode === 'clock') {
    return <ClockScreen displaySettings={displaySettings} />;
  }

  if (mode === 'logo' && displaySettings.blankLogoPath) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: displaySettings.backgroundColor }}
      >
        <img
          src={getFileUrl(displaySettings.blankLogoPath)}
          alt=""
          className="max-w-[60%] max-h-[60%] object-contain"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ backgroundColor: displaySettings.backgroundColor }} />
  );
}

function ClockScreen({ displaySettings }: { displaySettings: Display }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      style={{ backgroundColor: displaySettings.backgroundColor, color: displaySettings.textColor }}
    >
      <div style={{ fontSize: '12vw', fontFamily: displaySettings.fontFamily }} className="font-bold leading-none">
        {time}
      </div>
      <div style={{ fontSize: '3vw', fontFamily: displaySettings.fontFamily }} className="mt-4 capitalize opacity-80">
        {date}
      </div>
    </div>
  );
}

function DisplayContent({
  state,
  displaySettings,
  preview,
}: {
  state: ScreenState;
  displaySettings: Display;
  preview: boolean;
}) {
  if (state.mode === 'empty') {
    return <BlankScreen displaySettings={displaySettings} />;
  }

  const item = state.mode === 'single' ? state.item : state.currentItem;

  switch (item.type) {
    case 'text':
      return <TextDisplay item={item} displaySettings={displaySettings} />;
    case 'image':
      return <ImageDisplay path={item.path} displaySettings={displaySettings} />;
    case 'video':
      return <VideoDisplay path={item.path} displaySettings={displaySettings} preview={preview} />;
    case 'audio':
      return <AudioDisplay path={item.path} displaySettings={displaySettings} preview={preview} />;
    case 'heading':
      return <HeadingDisplay content={item.content} displaySettings={displaySettings} />;
    case 'qrcode':
      return <QRCodeDisplay item={item} displaySettings={displaySettings} />;
    case 'blank':
      return <BlankScreen displaySettings={displaySettings} />;
  }
}

function paddingOf(d: Display) {
  return {
    paddingTop: `${d.padding.top}px`,
    paddingRight: `${d.padding.right}px`,
    paddingBottom: `${d.padding.bottom}px`,
    paddingLeft: `${d.padding.left}px`,
  };
}

function TextDisplay({ item, displaySettings }: { item: TextDisplayItem; displaySettings: Display }) {
  const autoFit = displaySettings.autoFitText;
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(displaySettings.fontSize);

  // Auto-fit: shrink the font until the page fits the screen (measured in DOM)
  useLayoutEffect(() => {
    if (!autoFit) {
      setFontSize(displaySettings.fontSize);
      return;
    }
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    let size = displaySettings.fontSize;
    text.style.fontSize = `${size}px`;
    const fits = () =>
      text.scrollHeight <= container.clientHeight &&
      text.scrollWidth <= container.clientWidth;
    while (size > 12 && !fits()) {
      size -= 2;
      text.style.fontSize = `${size}px`;
    }
    setFontSize(size);
  }, [autoFit, displaySettings, item.slideContent]);

  const textStyle = {
    fontSize: `${autoFit ? fontSize : displaySettings.fontSize}px`,
    fontFamily: displaySettings.fontFamily,
    lineHeight: displaySettings.lineHeight,
    letterSpacing: `${displaySettings.letterSpacing}px`,
    color: displaySettings.textColor,
    textAlign: displaySettings.textAlign,
  } as const;

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={paddingOf(displaySettings)}
    >
      <div className="w-full">
        <div ref={textRef} className="whitespace-pre-line drop-shadow-lg" style={textStyle}>
          {item.slideContent || ''}
        </div>
        {displaySettings.showPageNumber && item.totalPages > 1 && (
          <div className="text-center mt-4 text-sm opacity-60" style={{ color: displaySettings.textColor }}>
            Strona {item.pageIndex + 1}/{item.totalPages}
          </div>
        )}
      </div>
    </div>
  );
}

function ImageDisplay({ path, displaySettings }: { path: string; displaySettings: Display }) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={paddingOf(displaySettings)}>
      <img src={getFileUrl(path)} alt="" className="max-w-full max-h-full object-contain" />
    </div>
  );
}

function VideoDisplay({
  path,
  displaySettings,
  preview,
}: {
  path: string;
  displaySettings: Display;
  preview: boolean;
}) {
  const [key, setKey] = useState(path);
  useEffect(() => setKey(path), [path]);

  return (
    <div className="w-full h-full flex items-center justify-center" style={paddingOf(displaySettings)}>
      {/* No controls — playback is driven remotely from the panel */}
      <video
        key={key}
        src={getFileUrl(path)}
        autoPlay={!preview}
        muted={preview}
        playsInline
        className="max-w-full max-h-full"
      />
    </div>
  );
}

function AudioDisplay({
  path,
  displaySettings,
  preview,
}: {
  path: string;
  displaySettings: Display;
  preview: boolean;
}) {
  const [key, setKey] = useState(path);
  const filename = path.split('/').pop() ?? path;
  useEffect(() => setKey(path), [path]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={paddingOf(displaySettings)}>
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <p className="text-2xl font-medium" style={{ color: displaySettings.textColor }}>
          {filename}
        </p>
      </div>
      {!preview && (
        <audio key={key} src={getFileUrl(path)} autoPlay controls className="w-full max-w-md" />
      )}
    </div>
  );
}

function HeadingDisplay({ content, displaySettings }: { content: string; displaySettings: Display }) {
  const textStyle = {
    fontSize: `${displaySettings.fontSize * 1.5}px`,
    fontFamily: displaySettings.fontFamily,
    lineHeight: displaySettings.lineHeight,
    letterSpacing: `${displaySettings.letterSpacing}px`,
    color: displaySettings.textColor,
    textAlign: displaySettings.textAlign,
  } as const;

  return (
    <div className="w-full h-full flex items-center justify-center" style={paddingOf(displaySettings)}>
      <h1 className="font-bold drop-shadow-lg" style={textStyle}>
        {content}
      </h1>
    </div>
  );
}

function QRCodeDisplay({
  item,
  displaySettings,
}: {
  item: { type: 'qrcode'; value: string; label?: string };
  displaySettings: Display;
}) {
  const [qrSize, setQrSize] = useState(() => Math.min(800, window.innerHeight * 0.6));

  useEffect(() => {
    const update = () => setQrSize(Math.min(800, window.innerHeight * 0.6));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={paddingOf(displaySettings)}>
      <div className="bg-white p-6 rounded-lg shadow-2xl">
        <QRCodeSVG value={item.value} size={qrSize} level="M" includeMargin={false} />
      </div>
      {item.label && (
        <p
          className="mt-8 text-center font-medium"
          style={{ color: displaySettings.textColor, fontSize: `${displaySettings.fontSize}px` }}
        >
          {item.label}
        </p>
      )}
    </div>
  );
}
