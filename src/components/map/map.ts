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
    LEVEL: number;
    runned: boolean;

    constructor(http:Http) {
        this.newactive = new EventEmitter();
        this.map = new google.maps.Map(document.getElementById("map"),{center: {lat:0,lng:0}, zoom:12});
        this.init();
        this.http = http;
        this.LEVEL = 2;
        this.runned = false;
        this.getData('?paging=false&level=2',this);
    }

    setRunned(value){
        this.runned = value;
    }

    addLevel(){
        this.LEVEL++;
    }

    init() {

        let initMap = this.initMap;
        let map = this.map;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    //let pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                let pos = {lat:10,lng:39}
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



        map.addListener('click', function (event) {
                console.log(event.latlng);
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
                res => instance.parseResult(res,instance),
                error => instance.logError(error)
            );

    }

    parseResult(res,instance){
        console.log(res);

        if(res.organisationUnits) {
            console.log("inne i res.organisationUnits");
            console.log(res instanceof JSONArray);
            for (let item in res.organisationUnits) {
                this.getData('/' + res.organisationUnits[item].id,this);
            }
            //liten hack
        }else if(res instanceof Array && res.children){
            console.log("inne i res.children"+ res.organisationUnits+ " og " + res.children);
            for (let item in res.children) {
                console.log(res.children[item].level + " = " + instance.LEVEL + "skal jeg inn?");
                if(res.children[item].level == instance.LEVEL){
                    console.log(res.children[item].level + " = " + instance.LEVEL + " så nå skal jeg inn");
                    this.getData('/' + res.children[item].id,this);
                }
            }
        }
        else {
            console.log("tegner" + res[2]);
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
                if(instance.runned == false){
                    instance.setRunned(true);


                    let id = event.feature.O.id;
                    console.log(id);

                    instance.map.data.forEach(function(feature) {
                        instance.map.data.remove(feature);
                    });
                    instance.addLevel();
                    instance.getData('/' + id+'/children',instance);
                   // instance.getData('/' + id,instance);

                }

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





