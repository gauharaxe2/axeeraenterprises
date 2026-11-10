import test from 'node:test';
import assert from 'node:assert/strict';
import { googleMapsDirectionsUrl, googleMapsEmbedUrl, googleMapsPlaceUrl, mapsQuery } from './maps.ts';

test('map links pin the published headquarters address on Google Maps', () => {
  const address = 'D-26, Wahdat Colony, Multan, 66000';
  const query = mapsQuery(address);
  assert.match(query, /Wahdat Colony/);
  assert.match(query, /Pakistan/);

  const embed = googleMapsEmbedUrl(address);
  assert.match(embed, /^https:\/\/maps\.google\.com\/maps\?q=30\.2054412,71\.4892754/);
  assert.match(embed, /output=embed/);
  assert.match(decodeURIComponent(embed), /D-26, Wahdat Colony, Multan, 66000/);

  assert.equal(
    googleMapsPlaceUrl(address),
    'https://www.google.com/maps/search/?api=1&query=30.2054412,71.4892754'
  );
  assert.equal(
    googleMapsDirectionsUrl(address),
    'https://www.google.com/maps/dir/?api=1&destination=30.2054412,71.4892754'
  );
});
