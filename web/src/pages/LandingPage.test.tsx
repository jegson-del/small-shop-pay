import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('LandingPage', () => {
  it('renders hero with Get Started CTA', () => {
    render(
      <Wrapper>
        <LandingPage />
      </Wrapper>
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Tap to Pay/i);
    expect(screen.getByRole('link', { name: /Get Started/i })).toHaveAttribute('href', '/register');
  });

  it('renders pricing section', () => {
    render(
      <Wrapper>
        <LandingPage />
      </Wrapper>
    );
    expect(screen.getByRole('heading', { level: 2, name: /Simple, transparent pricing/i })).toBeInTheDocument();
  });

  it('renders supported devices section', () => {
    render(
      <Wrapper>
        <LandingPage />
      </Wrapper>
    );
    expect(screen.getByRole('heading', { level: 2, name: /Supported devices/i })).toBeInTheDocument();
  });

  it('renders Terms, Privacy, and Support links', () => {
    render(
      <Wrapper>
        <LandingPage />
      </Wrapper>
    );
    expect(screen.getByRole('link', { name: /Terms & Conditions/i })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: /Support/i })).toBeInTheDocument();
  });
});
