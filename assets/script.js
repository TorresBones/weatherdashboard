
var seachHistory = [];
var lastCitySearched = "";
var apiKey = '81267044a6a603d5910e846b831a12aa';
var baseUrl = 'api.openweathermap.org/data/2.5/forecast?lat=44.34&lon=10.99&appid=81267044a6a603d5910e846b831a12aa&units=imperial';

function getCityWeather(city) {
    try {
        fetch('${baseUrl}/weather?q=$appid=${apiKey}')
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data request failed');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);

            lastCitySearched = data.name;
            saveSearchHistory(data.name);
        })
        .catch(error => {
            alert(error.message);
        });
    } catch (error) {
        alert(error.message);
    }
}

function searchSubmitHandler(event) {

    event.preventDefault();

    var cityName = document.querySelector('#cityname').ariaValueMax.trim();

    if (cityName) {
        getCityWeather(cityName);

        document.querySelector('#cityname').value = '';
    } else {
        alert('Please enter a city name');
    }
}

function displayWeather(weatherData) {
    var mainCityName = document.querySelector('#main-city-name');
    mainCityName.textContent = `${weatherData.name} (${dayjs(weatherData.dt * 1000).format('MM/DD/YYYY')})`
}