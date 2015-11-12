import {Component, CORE_DIRECTIVES} from '../../../node_modules/angular2/angular2.d.ts';

@Component({
    selector: 'map',
    directives: [CORE_DIRECTIVES],
    template: ` <div id="map"></div>`
    //templateUrl: './map.html'


})


class Map {


    initMap() {
         let map = new google.maps.Map(document.getElementById('map'), {
           center: {lat: -34.397, lng: 150.644},
         zoom: 8
        });

    }
}
