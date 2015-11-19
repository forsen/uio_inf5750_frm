import {Component, CORE_DIRECTIVES,} from 'angular2/angular2';
import {Headers, Http} from 'angular2/http';


@Component({
    selector: 'mou-map',
    directives: [CORE_DIRECTIVES],
    templateUrl: './components/map/map.html'
})


export class Map {

    map:Object;
    marker:Object;
    http: Http;

    constructor(http:Http) {

        this.map = new google.maps.Map(document.getElementById("map"),{center: {lat:0,lng:0}, zoom:12});
        this.init();
        this.http = http;

        this.getData('?paging=false&level=2');
    }


    init() {

        let initMap = this.initMap;
        let addMarker = this.addMarker;
        let map = this.map;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    let pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    initMap(pos,map,addMarker);
                }, function () {
                    //handleNoGeolocation(true);
                }
            );
        } else {
            alert("You do not support geolocation");
        }


    }


    initMap(location,map,addMarker){


        map.setCenter(location,12);

        addMarker(location,map,'This is YOU');



        map.addListener('click', function (event) {
                addMarker(event.latLng,map, 'Want to add a new marker here ? <br> <button onclick=\"createOrgUnit()\">Yes</button> <button onclick=\"deleteMarker()">No</button> ');
            }
        );

    }

    addMarker(location, map, title) {

        let marker = new google.maps.Marker({
            position: location,
            map: map
        });

        let infowindow = new google.maps.InfoWindow({
            content: title
        });

        marker.addListener('click', function () {
            console.log(marker);
            infowindow.open(map,marker);
        });


    }

    logError(error) {
        console.error(error);

    }

    getData(query){
        this.http.get(dhisAPI+'/api/organisationUnits'+query)
            .map(res => res.json())
            .subscribe(
                res => this.parseResult(res),
                error => this.logError(error)
            );

    }

    parseResult(res){

        if(res.organisationUnits) {
            for (let item in res.organisationUnits) {
                this.getData('/' + res.organisationUnits[item].id);
            }
        } else {

            this.drawPolygon(res);};
    }
    drawPolygon(item){
        console.log(item);
        console.log(item.featureType);
        console.log(item.coordinates);
        console.log(item.name);
        let unit = {
            "type": "Feature",
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": JSON.parse(item.coordinates)},
            "properties": {
                "name": item.name
            }
        };
        this.map.data.addGeoJson(unit);
        this.center(unit.geometry.coordinates);



    }

    center(coordinates){
        // let bounds = new google.maps.LatLngBounds(coordinates);
        /* console.log(coordinates.Array);
         for (let i = 0; i < coordinates.length; i++) {
         for(let j = 0; j < coordinates[i]; j++) {
         console.log(coordinates.Array[j]);
         bounds.extend(coordinates.Array[j]);
         }

         }*/
        // for (let i = 0; i < coordinates.length; i++) {
        //     bounds.extend(new google.maps.LatLng(coordinates.[i][1], coordinates[i][2]));
        // }
        // console.log("center: " + bounds.getCenter());

    }


    createOrgUnit(){
        console.log('you just added a new organisation unit');
    }

    deleteMarker(){
        console.log('you just deleted the marker');
    }
    //Other map functions


}





