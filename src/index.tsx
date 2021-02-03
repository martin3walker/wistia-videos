import React from 'react';
import { render } from 'react-dom';

import {
  FieldExtensionSDK,
  init,
  locations,
} from '@contentful/app-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import '@contentful/forma-36-tokens/dist/css/index.css';
import './index.css';

import Field from './components/Field';


import LocalhostWarning from './components/LocalhostWarning';

if (process.env.NODE_ENV === 'development' && window.self === window.top) {
  // You can remove this if block before deploying your app
  const root = document.getElementById('root');
  render(<LocalhostWarning />, root);
} else {
  init(async (sdk) => {
    const root = document.getElementById('root');

    const videos = await (await fetch("https://www.contentful.com/.netlify/functions/getWistiaVideos")).json()
    
    if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
      render(<Field sdk={sdk as FieldExtensionSDK} data={videos}/>, root);
    }

  });
}
