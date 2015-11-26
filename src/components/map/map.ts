import {Component, EventEmitter,CORE_DIRECTIVES,} from 'angular2/angular2';
import {Headers, Http} from 'angular2/http';


@Component({
    selector: 'mou-map',
    directives: [CORE_DIRECTIVES],
    events: ['newactive'],
    templateUrl: './components/map/map.html'
})


export class Map {

    map:Object;
    http: Http;
    parent: Object;
    currentPos = Object;

    constructor(http:Http) {
        this.newactive = new EventEmitter();
        this.newOrg = new EventEmitter();
        this.map = new google.maps.Map(document.getElementById("map"),{center: {lat:0,lng:0}, zoom:12});
        this.init();
        this.http = http;
        this.parent = null;
        this.currentPos = null;
       // this.getData('?paging=false&level=2',this);
        this.getData('?paging=false&level=3',this);
    }
    setParent(id){
        this.parent=id;
    }
    getParent(){
        return this.parent;
    }

    setcurrentPos(latlng){
        this.currentPos = latlng;
    }
    getcurrentPos(){
        return this.currentPos;
    }


    init() {

        let initMap = this.initMap;
        let map = this.map;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                   // let pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                let pos = {lat: 9.1, lng: -10.6};
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

        map.setCenter(location,3);


        let infowindow = new google.maps.InfoWindow({
            content: '<div>Add an OrganisationUnit here ? <button (click)="addUnit(location)">Yes</button> <button (click)="clear()">NO</button>'
        });
        map.addListener('click', function (e) {
            this.setcurrentPos(e.latLng);
            var marker = new google.maps.Marker({
                position: e.latLng,
                map: map,
                title: 'newOrg',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 5
                }

            });
            marker.setMap(map);

            infowindow.open(map, marker);


                console.log("jule husker");
            console.log("Nå er parent og location sånn:" + this.getParent()+ " og "+ this.getcurrentPos());




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
                instance.setParent(id);
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

    addUnit(){
        console.log("Inne i Add funksjonen");
        let parent = this.getParent();
        let pos = this.getcurrentPos;
        let event =  {pos,parent};
        this.newOrg.next(event);

    }

    drawCircle(){
        return new ol.style.Circle({
            radius: 5,
            fill: null,
            stroke: new ol.style.Stroke({color: 'red', width: 1})
        });
    }

    update(event){
        this.newactive.next(event);
    }
}





