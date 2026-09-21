// Jest manual mock for @maplibre/maplibre-react-native (native TurboModules,
// which don't exist in the Jest test environment). Node-modules mocks under a
// root-level __mocks__ folder are picked up by Jest automatically — see
// https://jestjs.io/docs/manual-mocks#mocking-node-modules — this just needs
// to mount without crashing, not render a real map.
import React from 'react';
import { View } from 'react-native';

export const Map = ({ children }: { children?: React.ReactNode }) => <View>{children}</View>;
export const Camera = () => null;
export const Marker = ({ children }: { children?: React.ReactNode }) => <View>{children}</View>;
