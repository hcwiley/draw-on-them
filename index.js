/**
 * @format
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import { ToastProvider } from 'react-native-toast-notifications'

import App from './App';
import { name as appName } from './app.json';

import { DrawingProvider } from './src/store';

const composeProviders =
  (...Providers) =>
    Child =>
      props =>
        Providers.reduce(
          (acc, Provider) => <Provider>{acc}</Provider>,
          <Child {...props} />,
        );

const WrappedApp = () => {
  return (
    <DrawingProvider>
      <ToastProvider
        placement='bottom'
        duration={2500}
        animationType='slide-in'
        offsetBottom={40}
        swipeEnabled={true}
      >
        <App />
      </ToastProvider>
    </DrawingProvider>
  );
};

AppRegistry.registerComponent(appName, () => WrappedApp);
