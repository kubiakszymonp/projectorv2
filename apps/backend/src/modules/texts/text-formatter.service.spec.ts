import { TextFormatterService } from './text-formatter.service';
import { DisplaySettings } from '../../types/settings';

const baseSettings = (over: Partial<DisplaySettings> = {}): DisplaySettings => ({
  fontSize: 48,
  fontFamily: 'Arial',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  lineHeight: 1.4,
  letterSpacing: 0,
  textAlign: 'center',
  backgroundColor: '#000',
  textColor: '#fff',
  maxLinesPerPage: 4,
  maxCharsPerLine: 20,
  blankScreen: 'black',
  blankLogoPath: '',
  showPageNumber: false,
  autoFitText: false,
  ...over,
});

describe('TextFormatterService', () => {
  let service: TextFormatterService;

  beforeEach(() => {
    service = new TextFormatterService();
  });

  it('returns a single empty page for empty input', () => {
    expect(service.formatTextToPages('', baseSettings())).toEqual(['']);
  });

  it('wraps long lines at word boundaries', () => {
    const lines = service.splitIntoLines('ala ma kota i psa razem', 10);
    lines.forEach((l) => expect(l.length).toBeLessThanOrEqual(10));
    expect(lines.join(' ')).toContain('ala');
  });

  it('breaks a word longer than maxChars', () => {
    const lines = service.splitIntoLines('superdługiewyrazenie', 5);
    expect(lines.length).toBeGreaterThan(1);
    lines.forEach((l) => expect(l.length).toBeLessThanOrEqual(5));
  });

  it('preserves empty lines as blank lines', () => {
    const lines = service.splitIntoLines('a\n\nb', 20);
    expect(lines).toEqual(['a', '', 'b']);
  });

  it('splits lines into pages respecting maxLinesPerPage', () => {
    const pages = service.splitLinesIntoPages(['1', '2', '3', '4', '5'], 2);
    expect(pages).toEqual(['1\n2', '3\n4', '5']);
  });

  it('paginates a multi-line slide end to end', () => {
    const content = 'linia jeden\nlinia dwa\nlinia trzy\nlinia cztery\nlinia piec';
    const pages = service.formatTextToPages(content, baseSettings({ maxLinesPerPage: 2, maxCharsPerLine: 50 }));
    expect(pages.length).toBe(3);
  });
});
