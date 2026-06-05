import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('affiche le libellé', () => {
    render(<Button>Connexion</Button>);
    expect(screen.getByRole('button', { name: 'Connexion' })).toBeInTheDocument();
  });

  it('est désactivé en mode loading', () => {
    render(<Button loading>Chargement</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
