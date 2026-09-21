// Jest manual mock for react-native-haptic-feedback (a native TurboModule,
// which doesn't exist in the Jest test environment). Node-modules mocks
// under a root-level __mocks__ folder are picked up by Jest automatically —
// see https://jestjs.io/docs/manual-mocks#mocking-node-modules — this
// mirrors the package's own officially-documented mock shape.
export const trigger = jest.fn();
export const stop = jest.fn();
export const isSupported = jest.fn().mockReturnValue(true);
export const triggerPattern = jest.fn();
export const impact = jest.fn();
export const playAHAP = jest.fn().mockResolvedValue(undefined);
export const getSystemHapticStatus = jest
  .fn()
  .mockResolvedValue({ vibrationEnabled: true, ringerMode: 'normal' });
export const setEnabled = jest.fn();
export const isEnabled = jest.fn().mockReturnValue(true);

const RNHapticFeedback = {
  trigger,
  stop,
  isSupported,
  triggerPattern,
  impact,
  playAHAP,
  getSystemHapticStatus,
  setEnabled,
  isEnabled,
};

export default RNHapticFeedback;
