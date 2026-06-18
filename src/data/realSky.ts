export type SkyStar = {
  name: string;
  ra: number;
  dec: number;
  mag: number;
  constellation: string;
};

export type ProjectedStar = SkyStar & {
  az: number;
  alt: number;
  intensity: number;
};

export const brightStars: SkyStar[] = [
  { name: 'Sirius', ra: 6.752, dec: -16.716, mag: -1.46, constellation: 'CMa' },
  { name: 'Canopus', ra: 6.399, dec: -52.696, mag: -0.74, constellation: 'Car' },
  { name: 'Arcturus', ra: 14.261, dec: 19.182, mag: -0.05, constellation: 'Boo' },
  { name: 'Vega', ra: 18.615, dec: 38.783, mag: 0.03, constellation: 'Lyr' },
  { name: 'Capella', ra: 5.278, dec: 45.998, mag: 0.08, constellation: 'Aur' },
  { name: 'Rigel', ra: 5.243, dec: -8.202, mag: 0.13, constellation: 'Ori' },
  { name: 'Procyon', ra: 7.655, dec: 5.225, mag: 0.34, constellation: 'CMi' },
  { name: 'Betelgeuse', ra: 5.919, dec: 7.407, mag: 0.42, constellation: 'Ori' },
  { name: 'Altair', ra: 19.846, dec: 8.868, mag: 0.76, constellation: 'Aql' },
  { name: 'Aldebaran', ra: 4.599, dec: 16.509, mag: 0.86, constellation: 'Tau' },
  { name: 'Antares', ra: 16.49, dec: -26.432, mag: 1.06, constellation: 'Sco' },
  { name: 'Spica', ra: 13.42, dec: -11.161, mag: 0.98, constellation: 'Vir' },
  { name: 'Pollux', ra: 7.755, dec: 28.026, mag: 1.14, constellation: 'Gem' },
  { name: 'Fomalhaut', ra: 22.961, dec: -29.622, mag: 1.16, constellation: 'PsA' },
  { name: 'Deneb', ra: 20.691, dec: 45.28, mag: 1.25, constellation: 'Cyg' },
  { name: 'Regulus', ra: 10.139, dec: 11.967, mag: 1.35, constellation: 'Leo' },
  { name: 'Castor', ra: 7.577, dec: 31.888, mag: 1.58, constellation: 'Gem' },
  { name: 'Gacrux', ra: 12.519, dec: -57.113, mag: 1.63, constellation: 'Cru' },
  { name: 'Bellatrix', ra: 5.419, dec: 6.35, mag: 1.64, constellation: 'Ori' },
  { name: 'Elnath', ra: 5.438, dec: 28.608, mag: 1.65, constellation: 'Tau' },
  { name: 'Miaplacidus', ra: 9.22, dec: -69.717, mag: 1.67, constellation: 'Car' },
  { name: 'Alnilam', ra: 5.604, dec: -1.202, mag: 1.69, constellation: 'Ori' },
  { name: 'Alnair', ra: 22.138, dec: -46.961, mag: 1.74, constellation: 'Gru' },
  { name: 'Alioth', ra: 12.9, dec: 55.96, mag: 1.76, constellation: 'UMa' },
  { name: 'Alnitak', ra: 5.679, dec: -1.943, mag: 1.77, constellation: 'Ori' },
  { name: 'Dubhe', ra: 11.063, dec: 61.751, mag: 1.79, constellation: 'UMa' },
  { name: 'Mirfak', ra: 3.405, dec: 49.861, mag: 1.79, constellation: 'Per' },
  { name: 'Wezen', ra: 7.14, dec: -26.393, mag: 1.83, constellation: 'CMa' },
  { name: 'Sargas', ra: 17.622, dec: -42.998, mag: 1.86, constellation: 'Sco' },
  { name: 'Kaus Australis', ra: 18.402, dec: -34.384, mag: 1.79, constellation: 'Sgr' },
  { name: 'Avior', ra: 8.375, dec: -59.51, mag: 1.86, constellation: 'Car' },
  { name: 'Menkalinan', ra: 5.992, dec: 44.947, mag: 1.9, constellation: 'Aur' },
  { name: 'Atria', ra: 16.811, dec: -69.027, mag: 1.91, constellation: 'TrA' },
  { name: 'Alhena', ra: 6.628, dec: 16.399, mag: 1.93, constellation: 'Gem' },
  { name: 'Peacock', ra: 20.428, dec: -56.735, mag: 1.94, constellation: 'Pav' },
  { name: 'Polaris', ra: 2.53, dec: 89.264, mag: 1.98, constellation: 'UMi' },
  { name: 'Mirzam', ra: 6.378, dec: -17.956, mag: 1.98, constellation: 'CMa' },
  { name: 'Alphard', ra: 9.46, dec: -8.658, mag: 1.99, constellation: 'Hya' },
  { name: 'Hamal', ra: 2.119, dec: 23.463, mag: 2.0, constellation: 'Ari' },
  { name: 'Diphda', ra: 0.727, dec: -17.986, mag: 2.04, constellation: 'Cet' },
  { name: 'Nunki', ra: 18.922, dec: -26.297, mag: 2.05, constellation: 'Sgr' },
  { name: 'Mizar', ra: 13.399, dec: 54.925, mag: 2.23, constellation: 'UMa' },
  { name: 'Merak', ra: 11.031, dec: 56.382, mag: 2.37, constellation: 'UMa' },
  { name: 'Phecda', ra: 11.897, dec: 53.695, mag: 2.44, constellation: 'UMa' },
  { name: 'Megrez', ra: 12.257, dec: 57.033, mag: 3.31, constellation: 'UMa' },
  { name: 'Alkaid', ra: 13.792, dec: 49.313, mag: 1.85, constellation: 'UMa' },
  { name: 'Sadr', ra: 20.37, dec: 40.257, mag: 2.23, constellation: 'Cyg' },
  { name: 'Gienah', ra: 20.771, dec: 33.97, mag: 2.48, constellation: 'Cyg' },
  { name: 'Albireo', ra: 19.512, dec: 27.96, mag: 3.05, constellation: 'Cyg' },
  { name: 'Rasalhague', ra: 17.582, dec: 12.56, mag: 2.08, constellation: 'Oph' },
  { name: 'Eltanin', ra: 17.943, dec: 51.489, mag: 2.24, constellation: 'Dra' },
  { name: 'Kochab', ra: 14.845, dec: 74.155, mag: 2.08, constellation: 'UMi' },
  { name: 'Scheat', ra: 23.063, dec: 28.082, mag: 2.42, constellation: 'Peg' },
  { name: 'Markab', ra: 23.079, dec: 15.205, mag: 2.49, constellation: 'Peg' },
  { name: 'Algenib', ra: 0.221, dec: 15.184, mag: 2.83, constellation: 'Peg' },
  { name: 'Alpheratz', ra: 0.14, dec: 29.09, mag: 2.07, constellation: 'And' },
  { name: 'Mirach', ra: 1.162, dec: 35.621, mag: 2.05, constellation: 'And' },
  { name: 'Almach', ra: 2.065, dec: 42.329, mag: 2.1, constellation: 'And' },
];

export const constellationLines = [
  ['Merak', 'Dubhe'],
  ['Phecda', 'Megrez'],
  ['Megrez', 'Alioth'],
  ['Alioth', 'Mizar'],
  ['Mizar', 'Alkaid'],
  ['Phecda', 'Merak'],
  ['Sadr', 'Deneb'],
  ['Sadr', 'Gienah'],
  ['Sadr', 'Albireo'],
  ['Alpheratz', 'Mirach'],
  ['Mirach', 'Almach'],
  ['Markab', 'Scheat'],
  ['Scheat', 'Alpheratz'],
  ['Alpheratz', 'Algenib'],
  ['Algenib', 'Markab'],
];

const deg = Math.PI / 180;
const rad = 180 / Math.PI;

function julianDate(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function gmstDegrees(date: Date) {
  const jd = julianDate(date);
  const days = jd - 2451545.0;
  return normalizeDegrees(280.46061837 + 360.98564736629 * days);
}

export function projectBirthSky() {
  const latitude = 40.238;
  const longitude = 33.033;
  const utcDate = new Date(Date.UTC(2005, 5, 24, 19, 0, 0));
  const lst = normalizeDegrees(gmstDegrees(utcDate) + longitude);

  return brightStars
    .map((star): ProjectedStar => {
      const hourAngle = normalizeDegrees(lst - star.ra * 15);
      const ha = (hourAngle > 180 ? hourAngle - 360 : hourAngle) * deg;
      const dec = star.dec * deg;
      const lat = latitude * deg;

      const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
      const alt = Math.asin(sinAlt);
      const az = Math.atan2(
        -Math.sin(ha),
        Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(ha),
      );

      return {
        ...star,
        alt: alt * rad,
        az: normalizeDegrees(az * rad),
        intensity: Math.max(0.18, Math.min(1, (3.7 - star.mag) / 4.7)),
      };
    })
    .filter((star) => star.alt > -8);
}
