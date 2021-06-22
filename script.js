function gid(id) {
	return document.getElementById(id);
}
function qs(selector) {
	return document.querySelector(selector);
}
const resultsNav = gid('resultsNav');
const favoritesNav = gid('favoritesNav');
const imagesContainer = qs('.images-container');
const saveConfirmed = qs('.save-confirmed');
const loader = qs('.loader');

// Nasa API
const count = 10;
const apiKey = 'DEMO_KEY'
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

let resultsArray = [];
// Obj instead of array, easier to delete items
let favorites = {};

function showContent(page) {
	// show loader
	loader.classList.add('hidden');
	if (page === 'results') {
		resultsNav.classList.remove('hidden');
		favoritesNav.classList.add('hidden');
	} else {
		resultsNav.classList.add('hidden');
		favoritesNav.classList.remove('hidden');
	}
	window.scrollTo({ top: 0, behavior: 'instant' });
}

function createDOMNodes(page) {
	const currentArray = page === 'results' ? resultsArray : Object.values(favorites);

	currentArray.forEach((result) => {
		// Create Card container
		const card = document.createElement('div');
		card.classList.add('card');
		// Create Link
		const link = document.createElement('a');
		link.href = result.hdurl;
		link.title = 'View Full Image';
		link.target = '_blank';

		const image = document.createElement('img');
		image.src = result.url;
		image.alt = 'NASA Picture of the Day';
		image.loading = 'lazy';
		image.classList.add('card-img-top');

		const cardBody = document.createElement('div');
		cardBody.classList.add('card-body');

		const cardTitle = document.createElement('h5');
		cardTitle.classList.add('card-title');
		cardTitle.textContent = result.title;

		const saveText = document.createElement('p');
		saveText.classList.add('clickable');
		if (page === 'results') {
			saveText.textContent = 'Add to Favorites';
			saveText.setAttribute('onclick', `saveFavorite('${result.url}')`);
		} else {
			saveText.textContent = 'Remove Favorite';
			saveText.setAttribute('onclick', `removeFavorite('${result.url}')`);
		}

		const cardText = document.createElement('p');
		cardText.classList.add('card-text');
		cardText.textContent = result.explanation;

		const footer = document.createElement('small');
		footer.classList.add('text-muted');

		// Date
		const date = document.createElement('strong');
		date.textContent = result.date;

		// Copyright
		const copyrightResult = result.copyright === undefined ? '' : result.copyright;
		const copyright = document.createElement('span');
		copyright.textContent = ` ${copyrightResult}`;

		// Append-a-palooza
		footer.append(date, copyright);
		cardBody.append(cardTitle, saveText, cardText, footer);
		link.appendChild(image);

		card.append(link, cardBody);
		imagesContainer.appendChild(card);

	});
}

// Update DOM
function updateDOM(page) {
	// get Favorites from local storage
	if (localStorage.getItem('nasaFavorites')) {
		favorites = JSON.parse(localStorage.getItem('nasaFavorites'));
	}
	// will remove all elements, so it can be rebuilt if removed. or added more
	imagesContainer.textContent = '';
	createDOMNodes(page);
	showContent(page);

}

// Get 10 images from Nasa API
async function getNasaPictures() {
	// show loader
	loader.classList.remove('hidden');
	try {
		const response = await fetch(apiUrl);
		resultsArray = await response.json();
		updateDOM('results');

	} catch (error) {
		console.log(error);
	}
}
// Add result to favorites
function saveFavorite(itemUrl) {
	// Loop through results array to select favorites
	resultsArray.forEach((item) => {
		// check if it matches item, and that the favorites obj doesn't already have a key with itemUrl
		if (item.url.includes(itemUrl) && !favorites[itemUrl]) {
			favorites[itemUrl] = item;
			// set favorites
			localStorage.setItem('nasaFavorites', JSON.stringify(favorites));

			// Show save Confirmation for 2 seconds
			saveConfirmed.hidden = false;
			setTimeout(() => {
				saveConfirmed.hidden = true;
			}, 2000);
		}
	})
}
// Remove Favorite
function removeFavorite(itemUrl) {
	if (favorites[itemUrl]) {
		delete favorites[itemUrl];
		// set favorites
		localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
		updateDOM('favorites');
	}
}
// On Load
getNasaPictures();