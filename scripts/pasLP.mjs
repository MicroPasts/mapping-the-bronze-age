import fs from 'fs';
import Papa from 'papaparse';
import { nanoid } from 'nanoid';
import { format,parseISO } from "date-fns";

const getPlace = (fourFigureLon,fourFigureLat) => {
    return {
      type: 'Point',
      coordinates: [ parseFloat(fourFigureLon), parseFloat(fourFigureLat) ]
    };

}

const buildFeature = (record, place, fourFigureLon, fourFigureLat) => {
  if (!place?.trim() || !fourFigureLon?.trim() )
    return;
  console.log(fourFigureLon)
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

const createDate =  ( datefound1) => {
  if(!datefound1?.trim())
    return;
    // console.log(format(parseISO(datefound1),"yyyy"))
  return format(parseISO(datefound1),"yyyy");

}
/**
 * Note: for the dummy, each data point == one record at one particular place.
 * (I.e. one record linked to three places is represented as three data points)
 */
const recordsCsv = fs.readFileSync('./pasGrids.csv', { encoding: 'utf8' });
const records = Papa.parse(recordsCsv, { header: true });
const baseUrl = 'https://bronze-age-index.micropasts.org/records/'
const features = records.data.reduce((all, row) => {
const missingUrl  = 'https://bronze-age-index.micropasts.org/img.png'
  const objectID = row['objectID'];
  const objectType = row['objectType'];
  const photo = row['imageURL'];
  const imageURL = photo ? photo : missingUrl;
  const Link = baseUrl + row['objectID'];
  const URI = baseUrl + row['objectID'];
  const description = row['description'];
  const collection = 'Portable Antiquities Scheme';
  const place = row['parish'];
  const fourFigureLat = row['fourFigureLat'];
  const fourFigureLon = row['fourFigureLon'];
  const county = row['county'];
  const context = row['discoveryMethod'];
  const project = 'PAS';
  const broadperiod = row['broadperiod'];
  const country = 'United Kingdom';
  const institution = 'PAS';
  const datefound1 = createDate(row['datefound1']);
  const discovery = datefound1 ? datefound1: '';
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
      discovery: discovery,
      project: project,
      broadperiod: broadperiod
    },
    descriptions: [{
      value: description
    }],
    depictions: [{
      '@id': imageURL,
      license: 'CC-BY',
      thumbnail: imageURL
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

fs.writeFileSync('pas-ld.json', JSON.stringify(fc, null, 2), 'utf8');
