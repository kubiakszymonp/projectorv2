import * as path from 'path';
import { PathValidator } from './path-validator';

describe('PathValidator', () => {
  const root = path.resolve('/app/data');
  let validator: PathValidator;

  beforeEach(() => {
    validator = new PathValidator(root);
  });

  it('joins a safe relative path inside root', () => {
    const result = validator.safeJoin('media/logo.png');
    expect(result).toBe(path.join(root, 'media/logo.png'));
  });

  it('allows the root itself (empty path)', () => {
    expect(validator.safeJoin('')).toBe(root);
  });

  it('rejects parent traversal with ..', () => {
    expect(() => validator.safeJoin('../secret')).toThrow();
    expect(() => validator.safeJoin('media/../../etc')).toThrow();
  });

  it('rejects absolute paths', () => {
    expect(() => validator.safeJoin('/etc/passwd')).toThrow();
  });

  it('rejects Windows drive letters', () => {
    expect(() => validator.safeJoin('C:/Windows')).toThrow();
  });

  it('does not confuse a sibling prefix dir (data-x) with root', () => {
    const sibling = new PathValidator(path.resolve('/app/data'));
    // A path that resolves to /app/data-x must not be accepted
    expect(() => sibling.safeJoin('../data-x/file')).toThrow();
  });

  it('validateName rejects slashes and dot segments', () => {
    expect(() => validator.validateName('a/b')).toThrow();
    expect(() => validator.validateName('..')).toThrow();
    expect(() => validator.validateName('')).toThrow();
  });
});
