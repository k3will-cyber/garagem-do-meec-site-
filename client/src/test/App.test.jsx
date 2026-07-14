import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import HomePage from '../pages/HomePage';

// Mock hooks that depend on Canvas API (not available in jsdom)
vi.mock('../hooks/useWheel', () => ({
  default: () => ({
    canvasRef: { current: null },
    isSpinning: false,
    spinCount: 0,
    showRegModal: false,
    showResultModal: false,
    showPopup: false,
    currentPrize: null,
    regData: { name: '', whatsapp: '' },
    setRegData: vi.fn(),
    spin: vi.fn(),
    closeRegModal: vi.fn(),
    closeResultModal: vi.fn(),
    openRegModal: vi.fn(),
    closePopup: vi.fn(),
    openWheelFromPopup: vi.fn(),
  }),
}));

// Mock API-dependent hooks
vi.mock('../hooks/useEstoque', () => ({
  default: () => ({
    products: [],
    loading: false,
    error: null,
  }),
}));

describe('HomePage', () => {
  const renderHome = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </MemoryRouter>
    );

  it('renderiza o nome GARAGEM DO MEEC', () => {
    renderHome();
    const headings = screen.getAllByText(/GARAGEM DO MEEC/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renderiza a seção de serviços', () => {
    renderHome();
    expect(screen.getByText(/SERVIÇO COM/i)).toBeInTheDocument();
  });

  it('renderiza o link do WhatsApp no contato', () => {
    renderHome();
    const whatsappLinks = screen.getAllByText(/WHATSAPP/i);
    expect(whatsappLinks.length).toBeGreaterThan(0);
  });

  it('renderiza a seção de números', () => {
    renderHome();
    expect(screen.getByText(/NÚMEROS QUE/i)).toBeInTheDocument();
  });

  it('renderiza o processo de 4 etapas', () => {
    renderHome();
    expect(screen.getByText(/COMO A GENTE/i)).toBeInTheDocument();
  });

  it('renderiza o footer com o ano', () => {
    renderHome();
    expect(screen.getByText(/2026/i)).toBeInTheDocument();
  });
});
