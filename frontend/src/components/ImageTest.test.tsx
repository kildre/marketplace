import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageTest from './ImageTest';

describe('ImageTest', () => {
  it('should render without crashing', () => {
    render(<ImageTest />);
    expect(screen.getByText('Image Test')).toBeInTheDocument();
  });

  it('should display Advana Dark image', () => {
    render(<ImageTest />);
    const advanaDarkImg = screen.getByAltText('Advana Dark');
    expect(advanaDarkImg).toBeInTheDocument();
    expect(advanaDarkImg).toHaveAttribute('src', '/assets/images/AdvanaDarkTheme.png');
  });

  it('should display DOD Logo image', () => {
    render(<ImageTest />);
    const dodLogoImg = screen.getByAltText('DOD Logo');
    expect(dodLogoImg).toBeInTheDocument();
    expect(dodLogoImg).toHaveAttribute('src', '/assets/images/DOD_color.png');
  });

  it('should display CDAO Logo image', () => {
    render(<ImageTest />);
    const cdaoLogoImg = screen.getByAltText('CDAO Logo');
    expect(cdaoLogoImg).toBeInTheDocument();
    expect(cdaoLogoImg).toHaveAttribute('src', '/assets/images/cdao_Logo.png');
  });

  it('should have correct styles on container', () => {
    render(<ImageTest />);
    const container = screen.getByText('Image Test').parentElement;
    expect(container).toHaveStyle({
      padding: '20px',
      border: '1px solid red',
    });
  });

  it('should render all three images', () => {
    render(<ImageTest />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
  });

  it('should have correct width styles on images', () => {
    render(<ImageTest />);
    const advanaDarkImg = screen.getByAltText('Advana Dark');
    const dodLogoImg = screen.getByAltText('DOD Logo');
    const cdaoLogoImg = screen.getByAltText('CDAO Logo');

    expect(advanaDarkImg).toHaveStyle({ width: '100px' });
    expect(dodLogoImg).toHaveStyle({ width: '50px' });
    expect(cdaoLogoImg).toHaveStyle({ width: '50px' });
  });
});
