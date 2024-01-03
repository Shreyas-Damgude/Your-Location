'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

function renderCountry(country, className = '') {
  const html = `<article class="country ${className}">
  <img class="country__img" src="${country.flag}" />
  <div class="country__data">
    <h3 class="country__name">${country.name}</h3>
    <h4 class="country__region">${country.region}</h4>
    <p class="country__row"><span>👫</span>${(
      +country.population / 1000000
    ).toFixed(1)} million people</p>
    <p class="country__row"><span>🗣️</span>${country.languages[0].name}</p>
    <p class="country__row"><span>💰</span>${country.currencies[0].name}</p>
  </div>
</article>`;

  countriesContainer.insertAdjacentHTML('beforeend', html);
}

function renderError(msg) {
  countriesContainer.insertAdjacentText('beforeend', msg);
}

function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function whereAmI() {
  countriesContainer.style.opacity = 1;
  btn.remove();
  try {
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;

    const resGeo = await fetch(
      `https://geocode.xyz/${lat}, ${lng}?geoit=json&auth=599232566333249761464x113742`
    );
    if (!resGeo.ok) throw new Error('Problem getting location data');

    const dataGeo = await resGeo.json();
    const resCountry = await fetch(
      dataGeo.country.toLowerCase() === 'india'
        ? 'https://restcountries.com/v2/name/bharat'
        : `https://restcountries.com/v2/name/${dataGeo.country}`
    );
    if (!resCountry.ok) throw new Error('Problem getting country');

    const [country] = await resCountry.json();
    renderCountry(country);

    if (!country.borders) throw new Error('No Neighbours');
    const [neighbour] = country.borders;

    const resNeighbour = await fetch(
      `https://restcountries.com/v2/alpha/${neighbour}`
    );
    if (!resNeighbour.ok) throw new Error('Problem getting neighbour');
    const neighbourCountry = await resNeighbour.json();
    renderCountry(neighbourCountry, 'neighbour');

    return `You are in ${dataGeo.city}, ${dataGeo.state}, ${dataGeo.country}`;
  } catch (err) {
    renderError(err.message);
    throw err;
  }
}

btn.addEventListener('click', async function () {
  const yourLocation = await whereAmI();
  alert(yourLocation);
});
