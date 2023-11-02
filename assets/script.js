var city = "";
var seachHistory = [];
var lastCitySearched = "";

var apiKey = '81267044a6a603d5910e846b831a12aa';
var baseUrl = 'https://api.openweathermap.org/data/2.5';

function getCityWeather(city) {
    fetch(`${baseUrl}/weather?q=${city}&appid=${apiKey}&units=imperial`)

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
        .catch(error => alert(error.message));
    }

function searchSubmitHandler(event) {

    event.preventDefault();

    var cityName = document.querySelector('#cityname').value.trim();

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

var img = document.createElement('img');
document.querySelector('#main-city-temp').textContent = `Temperature: ${weatherData.main.temp}°F`;
document.querySelector('#main-city-humid').textContent = `Humidity: ${weatherData.main.humidity}%`;
document.querySelector('#main-city-wind').textContent = `Wind Speed: ${weatherData.wind.speed.toFixed(1)}mph`;

fetch(`${baseUrl}/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`)
.then(response => response.json())
.then(data => {

    var uvIndex = data.value;
    var uvBox = document.querySelector('#uv-box');
    uvBox.textContent = `${uvIndex}`;

    if (data.value >= 11) {
        uvBox.style.backgroundColor = '#6c49cb';
    } else if (data.value < 11 && data.value >= 8) {
        uvBox.style.backgroundColor = '#d90011';
    } else if (data.value < 8 && data.value >= 6) {
        uvBox.style.backgroundColor = '#f95901';
    }else if (data.value < 6 && data.value >= 3) {
        uvBox.style.backgroundColor = '#f7e401';
    } else {
        uvBox.style.backgroundColor = '#299501';
    }
});

fetch(`${baseUrl}/forecast?q=${weatherData.name}&appid=${apiKey}&units=imperial`)
    .then(response => response.json())
    .then(data => {
        var fiveDay = document.querySelector('#five-day');
        fiveDay.innerHTML = '';

        for (var i = 7; i < data.list.length; i += 7) {
            var temperature = data.list[i].main.temp;
            var windSpeed = data.list[i].wind.speed;

            var fiveDayCard = `
            <div class="col-md-2 m-2 py-3 card text-white bg-primary">
                <div class="card-body p-1">
                    <h5 class="card-title">${dayjs(data.list[i].dt * 1000).format('MM/DD/YYYY')}</h5>
                    <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="rain">
                    <p class="card-text">Temp: ${temperature}°F</p>
                    <p class="card-text">Humidity: ${data.list[i].main.humidity}%</p>
                    <p class="card-text">Wind Speed: ${windSpeed.toFixed(1)}mph</p>
                    <p class="card-text" id="uv-index-${i}">UV Index:</p>
                </div>
            </div>
            `;

            fiveDay.insertAdjacentHTML('beforeend', fiveDayCard);

            // Fetch UV index data separately for each day
            fetch(`${baseUrl}/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`)
                .then(response => response.json())
                .then(uvData => {
                    var uvIndexData = uvData.value
                    var uvIndexElement = document.querySelector(`#uv-index-${i}`);
                    uvIndexElement.textContent = `UV Index: ${uvIndexData}`;

                    if (uvData.value >= 11) {
                        uvIndexElement.style.backgroundColor = '#6c49cb';
                    } else if (uvData.value < 11 && uvData.value >= 8) {
                        uvIndexElement.style.backgroundColor = '#d90011';
                    } else if (uvData.value < 8 && uvData.value >= 6) {
                        uvIndexElement.style.backgroundColor = '#f95901';
                    } else if (uvData.value < 6 && uvData.value >= 3) {
                        uvIndexElement.style.backgroundColor = '#f7e401';
                    } else {
                        uvIndexElement.style.backgroundColor = '#299501';
                    }
                })
                .catch(error => {
                    alert('Unable to retrieve UV Index data');
                })
        }
    })
    .catch(error => {
        alert('Unable to retrieve five-day forecast data');
    });
}

function saveSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        var searchHistoryList = document.querySelector('#search-history');
        var link = document.createElement('a');
        link.href = '#';
        link.classList.add('list-group-item', 'list-group-item-action');
        link.id = city;
        link.textContent = city;
        searchHistoryList.appendChild(link);

        localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
        localStorage.setItem('lastCitySearched', JSON.stringify(lastCitySearched));
    };
}

function loadSearchHistory () {
    searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory'));
    lastCitySearched = JSON.parse(localStorage.getItem('lastCitySearched'));

    if (!searchHistory) {
        searchHistory=[];
    }

    if(!lastCitySearched) {
        lastCitySearched ='';
    }

    var searchHistoryList = document.querySelector('#search-history');
    searchHistoryList.innerHTML = '';

    for (var i = 0; i < searchHistory.length; i++) {
        $("#search-history").append(`<a href="#" class="list-group-item-action" id="${searchHistory[i]}">${searchHistory[i]}</a>`);
    }
};

loadSearchHistory();

if (lastCitySearched != ""){
    getCityWeather(lastCitySearched);
}

$("#search-form").submit(searchSubmitHandler);
$("#search-history").on("click", function(event) {
    var prevCity = $(event.target).closest("a").attr("id");

    getCityWeather(prevCity);
});
