import {Component, EventEmitter,CORE_DIRECTIVES,} from 'angular2/angular2';
import {Headers, Http} from 'angular2/http';
import {Search} from "../search/search";

@Component({
    selector: 'mou-map',
    directives: [CORE_DIRECTIVES, Search],
    events: ['newactive', 'outevent'],
    templateUrl: './components/map/map.html'
})


export class Map {

    map:Object;
    http: Http;

    constructor(http:Http) {
        this.outevent = new EventEmitter();

        this.newactive = new EventEmitter();
        this.map = new google.maps.Map(document.getElementById("map"),{center: {lat:0,lng:0}, zoom:12});
        this.init();
        this.http = http;

        this.getData('?paging=false&level=2',this);
    }

    inevent(e){
        this.outevent.next(e);
    }


    init() {

        let initMap = this.initMap;
        let map = this.map;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    let pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    initMap(pos,map);
                }, function () {
                //handleNoGeoLocation()
                }
            );
        } else {
            alert("You do not support geolocation");
        }


    }


    initMap(location,map){

        map.setCenter(location,12);



        map.addListener('click', function (event) {
                console.log("jule husker");
            }
        );

    }

    logError(error) {
        console.error(error);

    }

    getData(query,instance){
        console.log(instance.http);
        instance.http.get(dhisAPI+'/api/organisationUnits'+query)
            .map(res => res.json())
            .subscribe(
                res => instance.parseResult(res),
                error => instance.logError(error)
            );

    }

    parseResult(res){

        if(res.organisationUnits) {
            for (let item in res.organisationUnits) {
                this.getData('/' + res.organisationUnits[item].id,this);
            }
            //liten hack
        }//else if(res.name != false){
           // for (let item in res.children) {
             //   this.getData('/' + res.children[item].id,this);
            //}
        //}
        else {

            this.drawPolygon(res);};
    }
    drawPolygon(item){
        let instance = this;
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

            this.map.data.addListener('click', function(event) {
               //TODO: spør om man vil ned/opp eller se info

                let id = event.feature.O.id;
                console.log(id);

                instance.map.data.forEach(function(feature) {
                    instance.map.data.remove(feature);
                });
               // instance.getData('/' + id+'/children',instance);
                instance.getData('/' + id,instance);

            });


        }else {
            // ToDO:
            console.log("fiks meg! gi warning på topp av kart");
        }


    }


    createOrgUnit(){
        console.log('you just added a new organisation unit');
    }

    update(event){
        this.newactive.next(event);
    }
}





