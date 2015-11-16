import {Component, CORE_DIRECTIVES,} from 'angular2/angular2';
import {Headers, Http} from 'angular2/http';


@Component({
    selector: 'mou-map',
    directives: [CORE_DIRECTIVES],
    templateUrl: './components/map/map.html'
})


export class Map {
    result: Object;
    map: Object;
    constructor(http: Http){
        this.initMap();

        var authHeader = new Headers();
        authHeader.append('Authorization', 'Basic YWRtaW46ZGlzdHJpY3Q=');
        this.result = {organisationUnits:[]};
       // http.get(dhisAPI+'/api/organisationUnits?paging=false', {headers: authHeader})
        http.get('http://mydhis.com:8082/api/organisationUnits?paging=false', {headers: authHeader})
            .map(res => res.json()).subscribe(
            res => this.result = res,
            error => this.logError(error)
        );
    }


    initMap() {
        this.map = new google.maps.Map(document.getElementById("map"),
            {center: {lat: 59, lng: 11}, zoom: 12});

        let marker = new google.maps.Marker({
            position: {lat: 59, lng: 11},
            map: this.map,
            title: 'This is YOU!'
        });

        let infowindow = new google.maps.InfoWindow({
            content: "This is You"
        });

        marker.addListener('click', function () {
            infowindow.open(this.map, marker);
        });

        //Other map functions
        
    }

    logError(error) {
        console.error(error);

    }

}
