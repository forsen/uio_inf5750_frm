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
        this.parent =null ;
        this.currentPos = null;
       // this.getData('?paging=false&level=2',this);
        this.getData('?paging=false&level=3',this);
    }

    setcurrentPos(latlng){
        this.currentPos = latlng;
    }
     getcurrentPos(){
         return this.currentPos;
     }

    setParent(id){
        this.parent=id;
    }
    getParent(){
        return this.parent;
    }


    init() {

        let initMap = this.initMap;
        let instance = this;
        let map = this.map;
        let pos = {lat: 9.1, lng: -10.6};
        initMap(pos,map,instance);

    }


    initMap(location,map,instance){


        map.setCenter(location,2);
        let infowindow = new google.maps.InfoWindow({
            //TODO: Style this
            content:'<div>Du you want to add a new OrgUnit here ?    <button onclick="instance.myFunction()">Yes</button></div>'
        });
        map.addListener('click', function (e) {
            instance.setcurrentPos(e.latLng);

            instance.myFunction();
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

                 infowindow.addListener('closeclick', function (e) {
                     marker.setMap(null);
             });

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
        let pos = this.getcurrentPos();
        let event =  {pos,parent};
        this.newOrg.next(event);

    }

    myFunction(){
        console.log("Inne i myfunksjonen");
      

    }

    update(event){
        this.newactive.next(event);
    }
}





