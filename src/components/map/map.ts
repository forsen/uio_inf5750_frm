import {Component, CORE_DIRECTIVES,} from 'angular2/angular2';
import {Headers, Http} from 'angular2/http';


@Component({
    selector: 'mou-map',
    directives: [CORE_DIRECTIVES],
    templateUrl: './components/map/map.html'
})


export class Map {
    result:Object;
    map:Object;
    pos:Object;
    marker:Object;

    constructor(http:Http) {
        this.initMap();

        var authHeader = new Headers();
        authHeader.append('Authorization', 'Basic YWRtaW46ZGlzdHJpY3Q=');
        this.result = {organisationUnits: []};
        // http.get(dhisAPI+'/api/organisationUnits?paging=false', {headers: authHeader})
        http.get('http://mydhis.com:8082/api/organisationUnits?paging=false', {headers: authHeader})
            .map(res => res.json()).subscribe(
            res => this.result = res,
            error => this.logError(error)
        );
    }


    initMap() {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    this.pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    this.map = new google.maps.Map(document.getElementById("map"),
                        {center: this.pos, zoom: 12});
                    this.marker = new google.maps.Marker({
                        position: this.pos,
                        map: this.map,
                        title: 'Me'
                    });

                    let infowindow = new google.maps.InfoWindow({
                        content: "This is You"
                    });
                    this.marker.addListener('click', function () {
                        infowindow.open(this.map, this.marker);
                    });
                   // this.map.addListener('click', this.addMarker(position.coords.latitude, position.coords.longitude));

                }, function () {
                    //handleNoGeolocation(true);
                }
            );
        } else {
            alert("You do not support geolocation");
        }


    }


    //Other map functions
   // addMarker(lat, lng) {

     //   let marker = new google.maps.Marker({
       //     position: {lat, lng},
         //   map: this.map,
        //    title: 'Me'
        //});
    //}

    logError(error) {
        console.error(error);

    }

}


/* showOnMap(){
 var bermudaTriangle = new google.maps.Polygon({
 paths: triangleCoords,
 strokeColor: '#FF0000',
 strokeOpacity: 0.8,
 strokeWeight: 2,
 fillColor: '#FF0000',
 fillOpacity: 0.35
 });
 bermudaTriangle.setMap(this.map);

 }*/




