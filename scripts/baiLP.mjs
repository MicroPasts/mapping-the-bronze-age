import fs from 'fs';
import Papa from 'papaparse';
import { nanoid } from 'nanoid';

const getPlace = (fourFigureLon,fourFigureLat) => {
    console.log(fourFigureLon)
    return {
      type: 'Point',
      coordinates: [ parseFloat(fourFigureLon), parseFloat(fourFigureLat) ]
    };

}

const buildFeature = (record, place, fourFigureLon, fourFigureLat) => {
  if (!place?.trim() && !fourFigureLon?.trim())
    return;

  return {
    ...record,
    // '@id': nanoid(),
    properties: {
      ...record.properties,
      place: place.trim(),
      // relation
    },
    geometry: {
      ...getPlace(fourFigureLon,fourFigureLat)
    }
  }
}

/**
 * Note: for the dummy, each data point == one record at one particular place.
 * (I.e. one record linked to three places is represented as three data points)
 */
const recordsCsv = fs.readFileSync('./baiGrids.csv', { encoding: 'utf8' });
const records = Papa.parse(recordsCsv, { header: true });
const baseUrl = 'https://bronze-age-index.micropasts.org/records/'
const features = records.data.reduce((all, row) => {

  const objectID = row['objectID'];
  const objectType = row['objectType'];
  const photo = row['imageURL'];
  const Link = baseUrl + row['objectID'];
  const URI = baseUrl + row['objectID'];

  const description = row['description'];
  const collection = row['collection'];
  const place = row['parish'];
  const institution  = row['museumCollection'];
  const fourFigureLat = row['fourFigureLat'];
  const fourFigureLon = row['fourFigureLon'];
  const county = row['county'];
  const country = row['country'];
  const context = row['context'];
  const year =  row['dateDiscoveryYear'];
  const project = row['project'];
  const broadperiod = row['broadperiod'];

  const peripleoRecord = {
    '@id': URI,
    type: 'Feature',
    properties: {
      title: objectType,
      source: Link,
      objectID: objectID,
      institution: institution,
      context: context,
      county: county,
      country: country,
      license: 'CC-BY',
      discovery: year,
      project: project,
      broadperiod: broadperiod
    },
    descriptions: [{
      value: description
    }],
    depictions: [{
      '@id': photo,
      license: 'CC-BY',
      thumbnail: photo
    }]
  };

  const features = Link?.trim() ? [
    buildFeature(peripleoRecord, place, fourFigureLon, fourFigureLat)
  ].filter(rec => rec) : [];

  return [...all, ...features];
}, []);

const fc = {
  type: 'FeatureCollection',
  features
};

fs.writeFileSync('baiFull.json', JSON.stringify(fc, null, 2), 'utf8');
