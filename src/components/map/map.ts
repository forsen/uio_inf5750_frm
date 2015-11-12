import {Component, CORE_DIRECTIVES} from 'angular2/angular2';


@Component({
    selector: 'mou-map',
    directives: [CORE_DIRECTIVES],
    templateUrl: './components/map/map.html'
})


export class Map {
    constructor(){
        this.initMap();
    }

    initMap(){
        let map = new google.maps.Map(document.getElementById("map"),
            {center:{lat:59,lng:11},zoom:12});
    }

}
