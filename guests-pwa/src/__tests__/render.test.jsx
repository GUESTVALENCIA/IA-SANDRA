import { render } from '@testing-library/react';
import App from '../App.jsx';

test('renders header', () => {
  const { getByText } = render(<App />);
  expect(getByText(/Guests-Valencia/)).toBeTruthy();
});
