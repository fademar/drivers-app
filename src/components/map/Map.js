import React, { Component } from 'react';
import { Map, TileLayer, Marker, Pane } from 'react-leaflet';
import { divIcon } from 'leaflet';
import _ from 'lodash';

const io = require('socket.io-client');

class BaseMap extends Component {
  
 constructor(props) { 
    super(props) 
    this.state = { 
      drivers: [],
      lat: 48.864716,
      lng: 2.349014,
      zoom: 13
    }
 }
 
 componentDidMount() {
      this.socket = io.connect('http://localhost:3001');
      this.socket.on('drivers_update', (data) => this.updateDrivers(data));
  }

  updateDrivers(data) {
    
    // copy the state
    const driverscopy = [...this.state.drivers];
    
    // search for the driver id in the copy
    let index = _.findIndex(driverscopy, ['id', data.id]);
    
    // add the new drivers to the copy if they are not already in, otherwise update their position and update the state
    if (driverscopy.length === 0) {
      driverscopy.push(data);
    } else if (index === -1) {
      driverscopy.push(data);
    } 
    else {      
      driverscopy[index].position = data.position;
      driverscopy[index].state = data.state;
    } 
    this.setState({drivers: driverscopy});
  }


  render() {
    
    const drivers = this.state.drivers;
    const numDrivers = drivers.length;

    const position = [this.state.lat, this.state.lng]

    return (
      <Map center={position} zoom={this.state.zoom}>
        <TileLayer
          url='https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmRlbWFydGhvbiIsImEiOiJjaXFqdzR3bmcwMDAzaHNtYjVtaDB2N2k2In0.66xu0WI-Ufmhd9zF0uqQLQ'
	        attribution='<a href="http://mapbox.com">&copy;Mapbox</a> <a href="http://openstreetmap.org">&copy;OpenStreetMap</a>'
        />

        {drivers.map((driver) => {
          
          let icon = divIcon({className: driver.state, html: '<i class="fa fa-car" aria-hidden="true"></i>'});
          return <Marker key={driver.id} icon={icon} position={[driver.position[0],driver.position[1]]} title={'Driver id: '+driver.id}/>;
        })}

       <div className="dashboard">
          <h1>{numDrivers} drivers on the map</h1>
        </div>
            
      </Map>
    )
  }
}

export default BaseMap;