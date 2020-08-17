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

            {props.track.map(loc => (
                <Marker
                    key={loc.id}
                    position={[
                        loc.lat,
                        loc.long
                    ]}
                />
            ))}
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
            'track': [],
            'forecast': [],
            'solar_prediction': [],
            'options': {
                animationEnabled: true,
                exportEnabled: true,
                theme: "light2", // "light1", "dark1", "dark2"
                title:{
                    text: "Solar Efficiency"
                },
                axisY: {
                    title: "Efficiency",
                    includeZero: true,
                },
                axisX: {
                    title: "Date",
                    interval: 1
                },
                data: [{
                    type: "line",
                    toolTipContent: "Day {x}: {y}",
                    dataPoints: []
                }]
            }
        };

    }
    componentDidMount() {
        fetch(process.env.REACT_APP_BACKEND_URL + '/tracked', {})
            .then(res => res.json())
            .then(result => {
                this.setState({'track': result["locations"]})
            })
    }

    handleClick = (e) => {
        this.setState({'marker': {
                hasLocation: true,
                latlng: e.latlng
            }
        });

        const params = [{
            "lat": e.latlng.lat,
            "long": e.latlng.lng
        }]

        fetch(process.env.REACT_APP_BACKEND_URL + '/predict', {
            body: `json_args=${encodeURIComponent(JSON.stringify(params))}`,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "POST"
        })
            .then(res => res.json())
            .then(result => {
                // set forecast state
                this.setState({'forecast': result['weather']});

                this.setState({'solar_prediction': result['solar']});

                //set data points
                const dataPoints = this.state.solar_prediction.map((value, i) => (
                    {
                        x: i,
                        y:  parseFloat(value.toFixed(4))
                    }
                ));
                const stateCopy = this.state.options;
                stateCopy['data'][0]['dataPoints'] = dataPoints;
                this.setState({'options': stateCopy});
                this.chart.render();
            })
    }

    handleSave = (e) => {
        if(this.state.marker.hasLocation) {
            const params = {
                "lat": this.state.marker.latlng.lat,
                "long": this.state.marker.latlng.lng
            }

            fetch(process.env.REACT_APP_BACKEND_URL + '/addlocation', {
                body: `json_args=${encodeURIComponent(JSON.stringify(params))}`,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: "POST"
            })
                .then(res => res.json())
                .then(result => {
                    this.setState({'track': result["locations"]})
                })
        }
    }


    render() {
        return (
            <div className="vert-container">
                <div className="top-container">
                        <div className="map">
                            <MapContainer
                                onClick={e => this.handleClick(e)}
                                marker={this.state.marker}
                                track={this.state.track}
                            />
                        </div>
                        <div className="forecast">
                            <Forecast
                                forecast={this.state.forecast}
                            />
                        </div>
                </div>
                <div>
                    <button onClick={e => this.handleSave(e)}>Track Location</button>
                </div>
                <div className="chart">
                    <CanvasJSChart options={this.state.options} onRef={ref => this.chart = ref}/>
                </div>
            </div>
        );
    }
}

export default App;