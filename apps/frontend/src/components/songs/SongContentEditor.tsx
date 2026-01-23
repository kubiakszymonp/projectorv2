import { Eye, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { MobileContentTab } from '@/types/songCatalog';
import { cn } from '@/lib/utils';

interface SongContentEditorProps {
  content: string;
  onContentChange: (value: string) => void;
  previewSlide: number | null;
  onPreviewSlideChange: (index: number | null) => void;
  isMobile: boolean;
  mobileContentTab: MobileContentTab;
  onMobileContentTabChange: (tab: MobileContentTab) => void;
}

export function SongContentEditor({
  content,
  onContentChange,
  previewSlide,
  onPreviewSlideChange,
  isMobile,
  mobileContentTab,
  onMobileContentTabChange,
}: SongContentEditorProps) {
  const slides = content
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile tabs */}
        <div className="p-2 border-b">
          <MobileContentTabs
            activeTab={mobileContentTab}
            onTabChange={onMobileContentTabChange}
          />
        </div>

        {/* Content based on active tab */}
        {mobileContentTab === 'text' ? (
          <TextEditorPanel
            content={content}
            onContentChange={onContentChange}
          />
        ) : (
          <SlidePreviewPanel
            slides={slides}
            previewSlide={previewSlide}
            onPreviewSlideChange={onPreviewSlideChange}
            truncateSlides={false}
          />
        )}
      </div>
    );
  }

  // Desktop layout - side by side
  return (
    <div className="flex-1 flex min-h-0">
      <div className="flex-1 flex flex-col min-w-0 border-r">
        <TextEditorPanel
          content={content}
          onContentChange={onContentChange}
        />
      </div>
      <div className="w-80 flex flex-col bg-muted/20">
        <SlidePreviewPanel
          slides={slides}
          previewSlide={previewSlide}
          onPreviewSlideChange={onPreviewSlideChange}
          truncateSlides={true}
        />
      </div>
    </div>
  );
}

interface MobileContentTabsProps {
  activeTab: MobileContentTab;
  onTabChange: (tab: MobileContentTab) => void;
}

function MobileContentTabs({ activeTab, onTabChange }: MobileContentTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
      <button
        onClick={() => onTabChange('text')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          activeTab === 'text'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <FileText className="h-4 w-4" />
        Treść
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          activeTab === 'preview'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Eye className="h-4 w-4" />
        Podgląd
      </button>
    </div>
  );
}

interface TextEditorPanelProps {
  content: string;
  onContentChange: (value: string) => void;
}

function TextEditorPanel({ content, onContentChange }: TextEditorPanelProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="p-3 border-b bg-muted/30">
        <span className="text-sm font-medium">Treść pieśni</span>
        <span className="text-sm text-muted-foreground ml-2">
          (slajdy oddzielone pustą linią)
        </span>
      </div>
      <Textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="flex-1 resize-none rounded-none border-0 focus-visible:ring-0 p-4 text-base leading-relaxed"
        placeholder="Wpisz tekst pieśni...&#10;&#10;Oddziel slajdy pustą linią."
      />
    </div>
  );
}

interface SlidePreviewPanelProps {
  slides: string[];
  previewSlide: number | null;
  onPreviewSlideChange: (index: number | null) => void;
  truncateSlides: boolean;
}

function SlidePreviewPanel({
  slides,
  previewSlide,
  onPreviewSlideChange,
  truncateSlides,
}: SlidePreviewPanelProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-muted/20">
      <div className="p-3 border-b bg-muted/30">
        <span className="text-sm font-medium">Podgląd slajdów</span>
        <span className="text-sm text-muted-foreground ml-2">
          ({slides.length})
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {slides.map((slide, index) => (
            <Card
              key={index}
              className={cn(
                'cursor-pointer transition-all hover:border-foreground/20',
                previewSlide === index && 'ring-2 ring-emerald-500'
              )}
              onClick={() => onPreviewSlideChange(previewSlide === index ? null : index)}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Slajd {index + 1}
                  </span>
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className={cn(
                  'text-sm whitespace-pre-wrap',
                  truncateSlides && 'line-clamp-4'
                )}>
                  {slide}
                </p>
              </div>
            </Card>
          ))}
          {slides.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Brak slajdów
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}


