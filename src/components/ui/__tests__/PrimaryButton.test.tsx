import { render, screen } from '@testing-library/react';
import { PrimaryButton } from '../PrimaryButton';

describe('PrimaryButton', () => {
  it('renders correctly with default styles', () => {
    render(<PrimaryButton>Click Me</PrimaryButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-neon-lime');
  });

  it('passes custom props down', () => {
    render(<PrimaryButton disabled data-testid="custom-btn">Disabled</PrimaryButton>);
    const button = screen.getByTestId('custom-btn');
    expect(button).toBeDisabled();
  });
});
