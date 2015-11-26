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
    parent: Object;
    currentPos : Object;
    uprunned: boolean;
    constructor(http:Http) {
        this.newactive = new EventEmitter();
        this.newOrg = new EventEmitter();
        this.map = new google.maps.Map(document.getElementById("map"),{center: {lat:0,lng:0}, zoom:12});
        this.init();
        this.http = http;
        this.LEVEL = 2;
        this.runned = false;
        this.getData('?paging=false&level=2',this);
        this.parent =null ;
        this.currentPos = null;
        this.uprunned = false;

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

    setRunned(value){
        this.runned = value;
    }

    setupRunned(value){
        this.uprunned = value;
    }

    addLevel(){
        this.LEVEL++;
    }
    upLevel(){
        this.LEVEL--;
    }

    init() {

        let initMap = this.initMap;
        let instance = this;
        let map = this.map;

        let pos = {lat: 9.1, lng: -10.6};
        initMap(pos,map,instance);

    }


    initMap(location,map,instance){
        let add = instance.myFunction;

        map.setCenter(location,12);

        let infowindow = new google.maps.InfoWindow({
            //TODO: Style this
            content:'<div>Du you want to add a new OrgUnit here ?    <button onclick="myFunction()">Yes</button></div>'
        });
        map.addListener('click', function (e) {
            instance.setcurrentPos(e.latLng);


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

            instance.addUnit();

            }
        );

    }

    logError(error) {
        console.error(error);

    }

    getData(query,instance, isParent){
        instance.http.get(dhisAPI+'/api/organisationUnits'+query)
            .map(res => res.json())
            .subscribe(
                res => instance.parseResult(res,instance,isParent),
                error => instance.logError(error)

            );

    }

    parseResult(res,instance){

      /*  if(isParent) {
            instance.ge
        }*/
       // else{


            if (res.organisationUnits) {
                for (let item in res.organisationUnits) {
                    this.getData('/' + res.organisationUnits[item].id, this);

                }
                instance.setupRunned(false);
                //liten hack
            } else if (!res.displayName && res.children) {
                for (let item in res.children) {
                    if (res.children[item].level == instance.LEVEL) {
                        this.getData('/' + res.children[item].id, this);
                    }
                }
                instance.setRunned(false);
                instance.setupRunned(false);
            }
            else {
                this.drawPolygon(res, instance);
            }

      //  }

    }

    drawPolygon(item, instance){
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
                    "id": item.id,

                },
                "style": null
            };
            if(unit.geometry.type == 'Point'){
               //ToDO: add en style på markeren !

            }
            this.map.data.addGeoJson(unit);

            this.map.data.addListener('click', function(event) {
               //TODO: spør om man vil ned/opp eller se info

                if(instance.runned == false && instance.LEVEL > 1){
                    instance.setRunned(true);


                    let infowindow = new google.maps.InfoWindow({
                        //TODO: Style this
                        content:'<div> <button >DrillUP</button>' +
                        ' <button ">DrillDOWN</button>' +
                        '<button ">SEEINFO</button></div>'
                    });


                    infowindow.setPosition(event.latlng);
                   // infowindow.open(instance.map);


                    let id = event.feature.O.id;
                    instance.setParent(id);
                    console.log(id);


                    instance.map.data.forEach(function(feature) {
                        instance.map.data.remove(feature);
                    });
                    instance.addLevel();
                    instance.getData('/' + id+'/children',instance);
                }

            });

            this.map.data.addListener('rightclick', function(event) {
                if(instance.uprunned == false) {
                    instance.setupRunned(true);

                    instance.upLevel();

                    if (instance.LEVEL >= 2) {
                        instance.map.data.forEach(function (feature) {
                            instance.map.data.remove(feature);
                        });
                        let parent = instance.getParent();
                        instance.getData('/'+parent, instance,true);
                    }/*else if(instance.LEVEL > 2){
                        instance.map.data.forEach(function (feature) {
                            instance.map.data.remove(feature);
                        });
                        let parent = instance.getParent();
                        console.log('/' + parent + '/children', instance);
                        instance.getData('/' + parent + '/children', instance);

                    }*/
                    else {
                        //TODO skriv en warning om at man ikke kan gå opp

                }

                }
            });


        }else {
            // ToDO:
            console.log("fiks meg! gi warning på topp av kart");
        }


    }

    addUnit(){

        let parent = this.getParent();
        let pos = this.getcurrentPos();
        let lat = pos.lat();
        let lng = pos.lng()
        let location= {lat: lat, lng: lng};
        let event =  {location,parent};
        this.newOrg.next(event);

    }

    myFunction(){
        console.log("Inne i myfunksjonen");
    }

    update(event){
        this.newactive.next(event);
    }
}





