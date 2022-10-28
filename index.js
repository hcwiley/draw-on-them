/**
 * @format
 */

import React from 'react';
import { AppRegistry } from 'react-native';

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

const WrappedApp = composeProviders(DrawingProvider)(App);

AppRegistry.registerComponent(appName, () => WrappedApp);
