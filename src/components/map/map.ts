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
        let feature;
        let incoming: string;
        incoming = item.featureType.toLowerCase();
        switch(incoming){
            case "point":
                feature = 'Point';
                break;
            case "multi_polygon":
                feature = 'MultiPolygon';
                break;
             case "polygon":
                 feature = 'MultiPolygon';
                break;
            default:
        }
          // TODO: test på feature og behandle type: NONE
        if(feature !== undefined) {
            let unit = {
                "type": "Feature",
                "geometry": {
                    "type": feature,
                    "coordinates": JSON.parse(item.coordinates)
                },
                "properties": {
                    "name": item.name,
                    "id": item.id
                }
            };
            this.map.data.addGeoJson(unit);
            let map = this.map;
            this.map.data.addListener('click', function(event) {

                console.log(event);
                map.data.revertStyle();
                map.data.overrideStyle(event.feature, {strokeWeight: 8});
            });
            //.addListener('click', function(){
               // console.log("Nå klikket du på:" + unit.properties.name + unit.properties.id);
            //});
         /*   var featureStyle = {
                strokeColor: '#66ffff',
                strokeOpacity: 0.5,
                strokeWeight: 3,
            }
            map.data.setStyle(featureStyle);
            map.data.addListener('click', function(event) {
                console.log(layer);
                // This is where I want to check if point(s) fall within it.
            }*/



        }else {
            // ToDO:
            console.log("fiks meg! gi warning på topp av kart");
        }


    }


    createOrgUnit(){
        console.log('you just added a new organisation unit');
    }

    deleteMarker(){
        console.log('you just deleted the marker');
    }


}





