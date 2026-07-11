import { render, screen, fireEvent } from '@testing-library/react';
import AnnotatedTranscript from './AnnotatedTranscript';

const TEXT = 'Isaac Newton discovered gravity in England.';
const ENTITIES = [{ text: 'Isaac Newton', type: 'PERSON', start: 0, end: 12 }];
const KEYTERMS = [{ text: 'gravity', score: 3.2, start: 24, end: 31 }];

describe('AnnotatedTranscript', () => {
  test('renders the full transcript text', () => {
    const { container } = render(
      <AnnotatedTranscript text={TEXT} entitySpans={ENTITIES} keyTermSpans={KEYTERMS} onSelectSpan={() => {}} />
    );
    expect(container.textContent).toBe(TEXT);
  });

  test('renders entity and key-term marks', () => {
    render(<AnnotatedTranscript text={TEXT} entitySpans={ENTITIES} keyTermSpans={KEYTERMS} onSelectSpan={() => {}} />);
    const marks = screen.getAllByText(/Isaac Newton|gravity/, { selector: 'mark' });
    expect(marks).toHaveLength(2);
  });

  test('clicking a mark reports the span with its key', () => {
    const onSelectSpan = jest.fn();
    render(<AnnotatedTranscript text={TEXT} entitySpans={ENTITIES} keyTermSpans={KEYTERMS} onSelectSpan={onSelectSpan} />);
    fireEvent.click(screen.getByText('Isaac Newton', { selector: 'mark' }));
    expect(onSelectSpan).toHaveBeenCalledTimes(1);
    expect(onSelectSpan.mock.calls[0][0]).toMatchObject({ kind: 'entity', text: 'Isaac Newton', key: 'entity-0-12' });
  });

  test('renders plain text when there are no spans', () => {
    const { container } = render(<AnnotatedTranscript text={TEXT} onSelectSpan={() => {}} />);
    expect(container.textContent).toBe(TEXT);
    expect(container.querySelector('mark')).toBeNull();
  });
});
