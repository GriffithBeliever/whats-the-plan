/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// DateDial pulls in a native TurboModule for haptics, which doesn't exist in
// the Jest environment — use the package's own official mock.
jest.mock('react-native-haptic-feedback');

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
