import './App.css';
import React, { Component } from 'react';
import { Map, TileLayer, Marker } from  "react-leaflet";
import CanvasJSReact from './canvasjs.react';

const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

require('dotenv').config();

function Forecast(props) {
    const days = props.forecast.map(day => (
        <tr key={day['observation_time'].value}>
            <td>{day['observation_time'].value}</td>
            <td>{((day['temp'][0]['min'].value + day['temp'][1]['max'].value) / 2).toFixed(1)}</td>
            <td>{day['weather_code'].value}</td>
        </tr>
    ))

    return (
        <table id="forecastTable">
            <thead>
                <tr>
                  <th>Day</th>
                  <th>Temperature</th>
                  <th>Forecast</th>
                </tr>
            </thead>
            <tbody>{days}</tbody>
        </table>
    );
}

function MapContainer (props) {
    const marker = props.marker.hasLocation ? (
        <Marker position={props.marker.latlng}/>
    ) : null

    return (
        <Map
            center={[34,-108]}
            zoom={6}
            onClick={props.onClick}
            className='leaflet-container'
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {marker}
        </Map>
    );
}

class App extends Component{
    constructor(props) {
        super(props);
        this.state = {
            'marker': {
                'hasLocation': false,
                'latlng': {
                    'lat': 34,
                    'lng': -108,
                }
            },
            'forecast': [],
            'options': {
                animationEnabled: true,
                exportEnabled: true,
                theme: "light2", // "light1", "dark1", "dark2"
                title:{
                    text: "Daily Temperature"
                },
                axisY: {
                    title: "Temperature",
                    includeZero: false,
                    suffix: "°F"
                },
                axisX: {
                    title: "Date",
                    interval: 1
                },
                data: [{
                    type: "line",
                    toolTipContent: "Day {x}: {y}°F",
                    dataPoints: []
                }]
            }
        };

    }

    getAvg(key, obj) { return ((obj[key][0]['min'].value + obj[key][1]['max'].value) / 2) }

    handleClick = (e) => {
        this.setState({'marker': {
                hasLocation: true,
                latlng: e.latlng
            }
        });

        // get weather forecast
        fetch("https://api.climacell.co/v3/weather/forecast/daily?lat=" + e.latlng.lat + "&lon=" + e.latlng.lng + "&unit_system=us&start_time=now&fields=precipitation%2Cprecipitation_accumulation%2Ctemp%2Cwind_speed%2Cbaro_pressure%2Cvisibility%2Chumidity%2Cweather_code&apikey=" + process.env.REACT_APP_API_KEY)
            .then(res => res.json())
            .then(
                (result) => {
                    // set forecast state
                    this.setState({'forecast': result});
                    console.log(result)

                    // grab solar predictions based on forecast
                    const params = [];
                    result.forEach(day => {
                        params.push(make_params(
                            this.getAvg("temp", day),
                            temp_hum_to_dew(f_to_c(this.getAvg("temp", day)), this.getAvg("humidity", day)),
                            this.getAvg("humidity", day),
                            day['precipitation_accumulation'].value,
                            this.getAvg("baro_pressure", day),
                            this.getAvg("wind_speed", day),
                            this.getAvg("visibility", day),
                            day['weather_code'].value))
                    })

                    // make api call
                    fetch(process.env.REACT_APP_ROUTE, {
                        body: `json_args=${encodeURIComponent(JSON.stringify(params))}`,
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        method: "POST",
                        mode: 'no-cors'
                    })
                        .then(out => JSON.parse(out.text()))
                        .then(prediction => {
                            this.setState({'solar_prediction': prediction});
                        })
                        .catch(error => {
                            console.error('There was an error!', error);
                        });

                    //set data points
                    const dataPoints = this.state.solar_prediction.map((value, i) => (
                        {
                            x: i,
                            y:  parseFloat(value.toFixed(1))
                        }
                    ));
                    const stateCopy = this.state.options;
                    stateCopy['data'][0]['dataPoints'] = dataPoints;
                    this.setState({'options': stateCopy});
                    this.chart.render();
                })
    }


    render() {
        return (
            <div className="vert-container">
                <div className="top-container">
                        <div className="map">
                            <MapContainer
                                onClick={e => this.handleClick(e)}
                                marker={this.state.marker}
                            />
                        </div>
                        <div className="forecast">
                            <Forecast
                                forecast={this.state.forecast}
                            />
                        </div>
                </div>
                <div className="chart">
                    <CanvasJSChart options={this.state.options} onRef={ref => this.chart = ref}/>
                </div>
            </div>
        );
    }
}

export default App;

function f_to_c(t) {
    return (t - 32) * (5/9);
}

function c_to_f(t) {
    return (t * (9/5)) + 32;
}

// uses C degrees and percent
function temp_hum_to_dew(temp, humidity) {
    return (Math.pow((humidity/100), 0.125) * (112 + (0.9 * temp)))
        + (0.1 * temp)
        - 112;
}

function code_to_value(code, to_compare) {
    if(code === to_compare) {
        return 6;
    }
    else {
        return 0;
    }
}

function make_params(temperature, dew_point, relative_humidity, daily_precipitation,
    station_pressure, wind_speed, hourly_visibility=10, weather_code=0) {

    return [{
        'temperature': temperature,
        'dew_point': dew_point,
        'relative_humidity': relative_humidity,
        'daily_precipitation': daily_precipitation,
        'station_pressure': station_pressure,
        'wind_speed': wind_speed,
        'hourly_visibility': hourly_visibility,
        'cloud_cover': 0,
        'mostly_cloudy': code_to_value(weather_code, 'mostly_cloudy'),
        'mostly_clear': code_to_value(weather_code, 'mostly_clear'),
        'clear': code_to_value(weather_code, 'clear'),
        'cloudy': code_to_value(weather_code, 'cloudy'),
        'partly_cloudy': code_to_value(weather_code, 'partly_cloudy'),
        'overcast': code_to_value(weather_code, 'overcast'),
        'rain_light': code_to_value(weather_code, 'rain_light'),
        'tstorm': code_to_value(weather_code, 'tstorm'),
        'drizzle': code_to_value(weather_code, 'drizzle'),
        'rain_heavy': code_to_value(weather_code, 'rain_heavy'),
        'rain': code_to_value(weather_code, 'rain'),
        'fog': code_to_value(weather_code, 'fog'),
        'snow_light': code_to_value(weather_code, 'snow_light'),
        'snow': code_to_value(weather_code, 'snow'),
        'snow_heavy': code_to_value(weather_code, 'snow_heavy'),
        'freezing_rain': code_to_value(weather_code, 'freezing_rain'),
        'freezing_drizzle': code_to_value(weather_code, 'freezing_drizzle'),
        'ice_pellets': code_to_value(weather_code, 'ice_pellets'),
        'ice_pellets_light': code_to_value(weather_code, 'ice_pellets_light'),
        'ice_pellets_heavy': code_to_value(weather_code, 'ice_pellets_heavy'),
        'flurries': code_to_value(weather_code, 'flurries'),
        'freezing_rain_heavy': code_to_value(weather_code, 'freezing_rain_heavy'),
        'freezing_rain_light': code_to_value(weather_code, 'freezing_rain_light'),
        'fog_light': code_to_value(weather_code, 'fog_light')
    }]
}
