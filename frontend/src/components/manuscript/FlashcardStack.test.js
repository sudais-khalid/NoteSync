import { render, screen, fireEvent } from '@testing-library/react';
import FlashcardStack from './FlashcardStack';

const CARDS = [
  { question: 'What is gravity?', answer: 'The force that attracts two bodies.' },
  { question: 'What is momentum?', answer: 'Mass times velocity.' },
];

describe('FlashcardStack', () => {
  test('renders one card per flashcard, question side first', () => {
    render(<FlashcardStack flashcards={CARDS} />);
    expect(screen.getByText('What is gravity?')).toBeInTheDocument();
    expect(screen.getByText('What is momentum?')).toBeInTheDocument();
    expect(screen.queryByText('Mass times velocity.')).not.toBeInTheDocument();
  });

  test('clicking flips a card to its answer and back', () => {
    render(<FlashcardStack flashcards={CARDS} />);
    const card = screen.getByText('What is gravity?').closest('button');

    fireEvent.click(card);
    expect(screen.getByText('The force that attracts two bodies.')).toBeInTheDocument();
    expect(screen.queryByText('What is gravity?')).not.toBeInTheDocument();

    fireEvent.click(card);
    expect(screen.getByText('What is gravity?')).toBeInTheDocument();
  });

  test('renders nothing when there are no flashcards', () => {
    const { container } = render(<FlashcardStack flashcards={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
