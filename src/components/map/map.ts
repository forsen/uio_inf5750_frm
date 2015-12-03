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
    http:Http;
    LEVEL:number;
    runned:boolean;
    parent:Object;
    currentPos:Object;
    uprunned:boolean;

    constructor(http:Http) {
        this.newactive = new EventEmitter();
        this.newOrg = new EventEmitter();
        this.map = new google.maps.Map(document.getElementById("map"), {center: {lat: 0, lng: 0}, zoom: 12});
        this.init();
        this.http = http;
        this.LEVEL = 2;
        this.runned = false;
        this.getData('?paging=false&level=2', this);
        this.parent = null;
        this.currentPos = null;
        this.uprunned = false;

    }

    getMap() {
        return this.map;
    }

    getHttp() {
        return this.http;
    }

    setcurrentPos(latlng) {
        this.currentPos = latlng;
    }

    getcurrentPos() {
        return this.currentPos;
    }

    setParent(id) {
        this.parent = id;
    }

    getParent() {
        return this.parent;
    }

    setRunned(value) {
        this.runned = value;
    }

    setupRunned(value) {
        this.uprunned = value;
    }

    setLevel(value) {
        this.LEVEL = value;
    }

    addLevel() {
        this.LEVEL++;
    }

    upLevel() {
        this.LEVEL--;
    }

    init() {

        let map = this.map;
        let pos = {lat: 9.1, lng: -10.6};

        map.setCenter(pos, 12);
    }

    logError(error) {
        console.error(error);

    }

    getData(query, instance, isParent) {
        console.log("hoi");
        instance.http.get(dhisAPI + '/api/organisationUnits' + query)
            .map(res => res.json())
            .subscribe(
                res => instance.parseResult(res, instance, isParent),
                error => instance.logError(error)
            );
    }

    parseResult(res, instance, isParent) {
        console.log(res);


        if (isParent) {
            instance.setParent(res.parent.id);
            instance.getData('/' + res.parent.id + '/children', instance, false);
        }
        else {
            if (res.organisationUnits) {
                for (let item in res.organisationUnits) {
                    this.getData('/' + res.organisationUnits[item].id, this);

                }
                instance.setupRunned(false);
                instance.setRunned(false);
            } else if (!res.displayName && res.children) {
                console.log("children");
                for (let item in res.children) {
                    console.log(res.children[item].level + " og " + instance.LEVEL);
                    if (res.children[item].level == instance.LEVEL) {
                        this.getData('/' + res.children[item].id, this);
                    }
                }
                instance.setRunned(false);
                instance.setupRunned(false);
            }
            else {
                console.log("jeei");
                this.drawPolygon(res, instance);
            }
        }
    }

    drawPolygon(item, instance) {
        let bounds = new google.maps.LatLngBounds();
        let feature;
        let incoming:string;
        incoming = item.featureType.toLowerCase();
        switch (incoming) {
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
        if (feature !== undefined) {
            let unit = {
                "type": "Feature",
                "geometry": {
                    "type": feature,
                    "coordinates": JSON.parse(item.coordinates)
                },
                "properties": {
                    "name": item.name,
                    "id": item.id,
                    "icon": null
                    }
                }
            };
            if (unit.geometry.type == 'Point') {
                //ToDO: add en style på markeren !

                instance.map.data.setStyle(function(feature) {
                    var color = 'gray';
                    if (feature.getProperty('isColorful')) {
                        color = feature.getProperty('color');

                    }
                    return /** @type {google.maps.Data.StyleOptions} */({
                        fillColor: color,
                        strokeColor: color,
                        strokeWeight: 2
                    });
                });

            }

            this.map.data.addGeoJson(unit);

            this.map.data.addListener('click', function (event) {

                console.log("klikket " + instance.runned + " og " + instance.LEVEL + " og " + event.feature.O.id);

                //TODO: spør om man vil ned/opp eller se info
                //TODO: finne liste over alle levels slike at man ikke har hardkodet inn < 4 !!

                if (instance.runned == false && instance.LEVEL < 4) {
                    instance.setRunned(true);

                    let infowindow = new google.maps.InfoWindow({
                        //TODO: Style this
                        content: '<div> <button >DrillUP</button>' +
                        ' <button ">DrillDOWN</button>' +
                        '<button ">SEEINFO</button></div>'
                    });

                    infowindow.setPosition(event.latlng);
                    // infowindow.open(instance.map);

                    let id = event.feature.O.id;
                    instance.setParent(id);
                    console.log(id);

                    instance.map.data.forEach(function (feature) {
                        if (!(feature.O.id == id && instance.LEVEL == 3)) {
                            instance.map.data.remove(feature);

                        }
                    });

                    instance.addLevel();

                    instance.getData('/' + id + '/children', instance);
                } else if (instance.runned == false && instance.LEVEL >= 4) {
                    instance.setRunned(true);
                    let infowindowNew = new google.maps.InfoWindow({
                        //TODO: Style this
                        content: '<div>Du you want to add a new OrgUnit here ?    <button onclick="myFunction()">Yes</button></div>'
                    });
                    instance.setcurrentPos(event.latLng);

                    var marker = new google.maps.Marker({
                        position: event.latLng,
                        map: instance.map,
                        title: 'newOrg',
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 5
                        }

                    });

                    marker.setMap(instance.map);

                    infowindowNew.open(instance.map, marker);

                    infowindowNew.addListener('closeclick', function (e) {
                        instance.setRunned(false);
                        marker.setMap(null);
                    });

                    instance.addUnit();


                }


            });


            this.map.data.addListener('rightclick', function (event) {
                if (instance.uprunned == false) {
                    instance.setupRunned(true);

                    instance.upLevel();

                    if (instance.LEVEL > 1) {
                        instance.map.data.forEach(function (feature) {
                            instance.map.data.remove(feature);
                        });

                        let parent = instance.getParent();
                        instance.getData('/' + parent, instance, true);
                    }
                    else {
                        instance.addLevel();
                        instance.setupRunned(true);
                        //TODO skriv en warning om at man ikke kan gå opp

                    }

                }
            });


        } else {
            // ToDO:
            console.log("fiks meg! gi warning på topp av kart");
        }


    }

    addUnit() {
        let parent = this.getParent();
        let pos = this.getcurrentPos();
        let lat = pos.lat();
        let lng = pos.lng()
        let location = {lat: lat, lng: lng};
        let event = {location, parent};
        this.newOrg.next(event);
    }

    //TODO slett denne når popup er klar !
    myFunction() {
        console.log("Inne i myfunksjonen");
    }

    update(event) {
        this.newactive.next(event);
        let getResult = Object;
        let test = this.getMap();
        let http = this.getHttp();

        test.data.forEach(function (feature) {
            test.data.remove(feature);
        });
        http.get(dhisAPI + '/api/organisationUnits/' + event)
            .map(res => res.json())
            .subscribe(
                res=> this.mapUpdate(res, this)
            );
    }

    mapUpdate(res, instance) {
        this.setLevel(res.level);
        this.setParent(res.parent.id);
        this.drawPolygon(res, instance);

    }

}





