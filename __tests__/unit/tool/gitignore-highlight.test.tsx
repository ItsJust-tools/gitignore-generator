import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GitignoreHighlight } from '@/tool/components/gitignore-highlight';

describe('GitignoreHighlight', () => {
  it('renders comments as comment-styled segments', () => {
    const { container } = render(<GitignoreHighlight value="# a comment" />);
    expect(container.querySelector('.gi-comment')).not.toBeNull();
  });

  it('renders negation prefix specially', () => {
    const { container } = render(<GitignoreHighlight value="!important.config" />);
    expect(container.querySelector('.gi-negation')?.textContent).toBe('!');
  });

  it('renders glob wildcards specially', () => {
    const { container } = render(<GitignoreHighlight value="*.log" />);
    expect(container.querySelector('.gi-glob')?.textContent).toBe('*');
  });

  it('renders directory-trailing slash specially', () => {
    const { container } = render(<GitignoreHighlight value="build/" />);
    expect(container.querySelector('.gi-dir')?.textContent).toBe('/');
  });

  it('renders one line element per input line', () => {
    const { container } = render(<GitignoreHighlight value={'a\nb\nc'} />);
    expect(container.querySelectorAll('.gitignore-highlight-line')).toHaveLength(3);
  });
});
