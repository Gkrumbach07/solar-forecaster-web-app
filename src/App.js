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

    handleClick = (e) => {
        this.setState({'marker': {
                hasLocation: true,
                latlng: e.latlng
            }
        });

        const data_params = make_params(70, 78, 89,
            0, 90, 3);

        fetch(process.env.REACT_APP_ROUTE, {
            body: `json_args=${encodeURIComponent(JSON.stringify(data_params))}`,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "POST",
            mode: 'no-cors'
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => {
            this.setState({ errorMessage: error.toString() });
            console.error('There was an error!', error);
        });

        // get weather forecast
        fetch("https://api.climacell.co/v3/weather/forecast/daily?lat=" + e.latlng.lat + "&lon=" + e.latlng.lng + "&unit_system=us&start_time=now&fields=precipitation%2Cprecipitation_accumulation%2Ctemp%2Cwind_speed%2Cbaro_pressure%2Cvisibility%2Chumidity%2Cweather_code&apikey=" + process.env.REACT_APP_API_KEY)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({'forecast': result});

                    //set data points
                    const dataPoints = this.state.forecast.map((day, i) => (
                        {
                            x: i,
                            y:  parseFloat(((day['temp'][0]['min'].value + day['temp'][1]['max'].value) / 2).toFixed(1))
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
/*


 */

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

function make_params(temperature, dew_point, relative_humidity, daily_precipitation,
    station_pressure, wind_speed, hourly_visibility=10, cloud_cover=0,
    mostly_cloudy=0, mostly_clear=0, clear=0, cloudy=0, partly_cloudy=0,
    overcast=0, rain_light=0, tstorm=0, drizzle=0, rain_heavy=0, rain=0,
    fog=0, snow_light=0, snow=0, snow_heavy=0, freezing_rain=0,
    freezing_drizzle=0, ice_pellets=0, ice_pellets_light=0,
    ice_pellets_heavy=0, flurries=0, freezing_rain_heavy=0,
    freezing_rain_light=0, fog_light=0) {

    return [{
        'temperature': temperature,
        'dew_point': dew_point,
        'relative_humidity': relative_humidity,
        'daily_precipitation': daily_precipitation,
        'station_pressure': station_pressure,
        'wind_speed': wind_speed,
        'hourly_visibility': hourly_visibility,
        'cloud_cover': cloud_cover,
        'mostly_cloudy': mostly_cloudy,
        'mostly_clear': mostly_clear,
        'clear': clear,
        'cloudy': cloudy,
        'partly_cloudy': partly_cloudy,
        'overcast': overcast,
        'rain_light': rain_light,
        'tstorm': tstorm,
        'drizzle': drizzle,
        'rain_heavy': rain_heavy,
        'rain': rain,
        'fog': fog,
        'snow_light': snow_light,
        'snow': snow,
        'snow_heavy': snow_heavy,
        'freezing_rain': freezing_rain,
        'freezing_drizzle': freezing_drizzle,
        'ice_pellets': ice_pellets,
        'ice_pellets_light': ice_pellets_light,
        'ice_pellets_heavy': ice_pellets_heavy,
        'flurries': flurries,
        'freezing_rain_heavy': freezing_rain_heavy,
        'freezing_rain_light': freezing_rain_light,
        'fog_light': fog_light
    }]
}
