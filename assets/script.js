$(document).ready(function () {
//  OpenWeather API
    var apikey = dfeeac901eb9e6d9c301359f18f2b294;


    var cityEl = $('h2#city');
    var dateEl = $('h3#date');
    var weatherIconEl = $('img#weather-icon');
    var temperatureEl = $('span#temperature');
    var humidity = $('span#humidity');
    var windEl = $('span#win');
    var uvIndexEl =$('span#uv-index');
    var cityListEl = $('div.cityList');

    var cityInput = $('#city-input');

    let pastCities = [];

    function compare(a, b) {
        var cityA = a.city.toUpperCase();
        var cityB = b.city.toUpperCase();

        let comparison = 0;
        if (cityA > cityB) {
            comparison = 1;
        } else if (cityA < cityB) {
            comparison = -1;
        }
        return comparison
    }

    //  Local Storage functions for past searched cities

    function loadCities() {
        var storedCities = JSON.parse(localStorage.getItem('pastCities'));
        if (storedCities) {
            pastCities = storedCities;
        }
    }

    function storedCities () {
        localStorage.setItem('pastCities', JSON.stringify(pastCities));
    }

    // Function to build URL for the API call
    
    function buildURLFromInputs (city) {
        if (city) {
            return 'https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}';
        }
    }

    function buildURLFromId(id) {
        return 'https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}';
    }

    // Function to display the last 5 searched cities

    function displayCities(pastCities) {
        cityListEl.empty();
        pastCities.splice(5);
        let sortedCities = [...pastCities];
        sortedCities.sort(compare);
        sortedCities.forEach(function (location) {
            let cityDiv = $('<div>').addClass('col-12 city');
            let cityBtn = $('<button').addClass('btn btn-light city-btn').text(location.city);
            cityDiv.append(cityBtn);
            cityListEl.append(cityDiv);
        });
    }

    // Function to color UV Index based on the color scale from: https://www.epa.gov/sunsafety/uv-index-scale-0
    function setUVIndexColor(uvi) {
        if (uvi < 3) {
            return 'green';
        } else if (uvi >= 3 && uvi < 6) {
            return 'yellow';
        } else if (uvi >= 6 && uvi < 8) {
            return 'orange';
        } else if (uvi >= 8 && uvi < 11) {
            return 'red';
        } else return 'purple';
    }

    // Function to search for weather condition calling the OpenWeather API
    function searchWeather(queryURL) {

        // Create an AJAX call to retrieve weather data

        $.ajax({
            url: queryURL,
            method: 'GET',
        }).then(function (response) {

            // Store current city in the past cities
            let city = response.name;
            let id = response.id;
            // Remove duplicate name cities
            if (pastCities[0]) {
                pastCities = $.grep(pastCities, function (storedCities) {
                    return id !== storedCities.id;
                })
            }
            pastCities.unshift({ city, id });
            storedCities();
            displayCities(pastCities);

            // Display current weather in main DOM
            cityEl.text(response.name);
            let formatedDate = moment.unix(response.dt).format('L');
            dateEl.text(formatedDate);
            let weatherIcon = response.weather[0].icon;
            weatherIconEl.attr('src', `http://openweathermap.org/img/wn/${weatherIcon}.png`).attr('alt', response.weather[0].description);
            temperatureEl.html(((response.main.temp - 273.15) * 1.8 + 32).toFixed(1));
            humidityEl.text(reponse.main.humidity);
            windEl.text((response.wind.speed * 2.237).toFixed(1));

            // Call OpenWeather API with lat and lon to get UV index and the 5 day forecast
        
        })
    }
})