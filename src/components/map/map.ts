import {Component, EventEmitter,CORE_DIRECTIVES,} from 'angular2/angular2';
import {Headers, Http} from 'angular2/http';


@Component({
    selector: 'mou-map',
    directives: [CORE_DIRECTIVES],
    events: ['newactive', 'neworg'],
    templateUrl: './components/map/map.html'
})


export class Map {

    hideModal:any;
    map:Object;
    http:Http;
    LEVEL:number;
    runned:boolean;
    parent:Object;
    currentPos:Object;
    uprunned:boolean;
    activeId:string;
    currentMarker:Object;

    // COLORS:Object;

    constructor(http:Http) {

        this.activeId = null;
        this.newactive = new EventEmitter();
        this.neworg = new EventEmitter();
        this.map = new google.maps.Map(document.getElementById("map"), {center: {lat: 0, lng: 0}, zoom: 12});
        this.init();
        this.http = http;
        this.LEVEL = 2;
        this.runned = false;
        this.getData('?paging=false&level=2', this);
        this.parent = null;
        this.currentPos = null;
        this.uprunned = false;
        this.currentMarker = null;
        // this.COLORS = {'red','brown',',yellow','green',',pink','purple','gray','black'};
        this.hideModal = document.getElementById("topLevel").style.visibility = "hidden";
        this.hideModal = document.getElementById("middleLevel").style.visibility = "hidden";
        this.hideModal = document.getElementById("bottomLevel").style.visibility = "hidden";
        this.hideModal = document.getElementById("divModal").style.visibility = "hidden";
    }

    setActiveId(id) { this.activeId = id; }

    getMap() { return this.map; }

    getHttp() { return this.http; }

    setcurrentPos(latlng) { this.currentPos = latlng; }

    getcurrentPos() { return this.currentPos; }

    setParent(id) {  this.parent = id; }

    getParent() { return this.parent; }

    setRunned(value) { this.runned = value; }

    setupRunned(value) { this.uprunned = value; }

    setLevel(value) { this.LEVEL = value; }

    getLevel(){ return this.LEVEL; }

    addLevel() { this.LEVEL++; }

    upLevel() { this.LEVEL--; }


    init() {

        let map = this.map;
        let pos = {lat: 9.1, lng: -11.6};

        map.setCenter(pos, 0);
        map.setZoom(7);

    }

    logError(error) {
        console.error(error);

    }

    getData(query, instance, isParent) {
        instance.http.get(dhisAPI + '/api/organisationUnits' + query)
            .map(res => res.json())
            .subscribe(
                res => instance.parseResult(res, instance, isParent),
                error => instance.logError(error)
            );
    }

    parseResult(res, instance, isParent) {

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
        }
    }

    drawPolygon(item, instance) {
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
                    "color": "gray",
                    "icon": null
                }
            };

            if (unit.geometry.type == 'Point') {
                unit.properties.icon = {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 3
                };

            }

            this.map.data.addGeoJson(unit);
            this.map.data.setStyle(function (feature) {
                let color = 'gray';
                let icon;
                if (feature.getProperty('icon') !== null) {
                    icon = feature.getProperty('icon');
                }
                color = feature.getProperty('color');
                return /** @type {google.maps.Data.StyleOptions} */({
                    fillColor: color,
                    strokeColor: color,
                    strokeWeight: 3,
                    icon: icon
                });
            });


            this.map.data.addListener('click', function (event) {
                instance.setActiveId(event.feature.O.id);
                instance.setcurrentPos(event.latLng);


                //TODO: finne liste over alle levels slike at man ikke har hardkodet inn < 4 !!
                if (instance.uprunned == false && instance.LEVEL == 2) {
                    this.hideModal = document.getElementById("topLevel").style.visibility = "visible";
                    this.hideModal = document.getElementById("middleLevel").style.visibility = "hidden";
                    this.hideModal = document.getElementById("bottomLevel").style.visibility = "hidden";
                    instance.showModal();

                }
                else if (instance.runned == false && instance.LEVEL < 4) {
                    this.hideModal = document.getElementById("topLevel").style.visibility = "hidden";
                    this.hideModal = document.getElementById("middleLevel").style.visibility = "visible";
                    this.hideModal = document.getElementById("bottomLevel").style.visibility = "hidden";
                    instance.showModal();
                } else if (instance.runned == false && instance.LEVEL <= 4) {

                    this.hideModal = document.getElementById("topLevel").style.visibility = "hidden";
                    this.hideModal = document.getElementById("middleLevel").style.visibility = "hidden";
                    this.hideModal = document.getElementById("bottomLevel").style.visibility = "visible";

                    instance.setcurrentPos(event.latLng);
                    instance.showModal();

                }


            });
        }
        else {
            // ToDO:
            console.log("fiks meg! gi warning på topp av kart");
        }
    }

    drillDown() {
        this.closeModal();
        let map = this.getMap();
        let id = this.activeId;
        let level = this.LEVEL;
        console.log(id);
        this.setRunned(true);
        this.setParent(id);

        map.data.forEach(function (feature) {
            if (!(feature.O.id == id && level == 3)) {
                map.data.remove(feature);

            }
        });

        this.addLevel();
        this.getData('/' + id + '/children', this);

    }

    drillUp() {

        if (this.LEVEL > 2) {
            this.setupRunned(true);
            this.upLevel();
            let instance = this;
            this.closeModal();
            this.map.data.forEach(function (feature) {
                instance.map.data.remove(feature);

            });
            let parent = instance.getParent();
            instance.getData('/' + parent, instance, true);
        }
        this.closeModal();
    }

    seeDetails() {
        let map = this.getMap();
        let id = this.activeId;
        this.closeModal();
        map.data.forEach(function (feature) {
            if (feature.getProperty('id') == id) {
                feature.setProperty('color', 'red');
            }
        });
        this.newactive.next(this.activeId);
    }

    addUnit() {
        this.closeModal();
        let pos = this.getcurrentPos();
        let lat = pos.lat();
        let lng = pos.lng();
        let map = this.map;



          var
         marker = new google.maps.Marker({
         position: pos,
         map: map,
         title: 'newOrg',
         icon: {
         path: google.maps.SymbolPath.CIRCLE,
         scale: 3
         }
         });
         this
         .
         currentMarker = marker;
         marker
         .
         setMap(map);

        let parent = this.getParent();


        let location = {lat: lat, lng: lng};
        let event = {location, parent};
        this.neworg.next(event);
        this.closeModal();
        this.setRunned(false);
    }

    update(event) {
        this.neworg.next(event);
        let map = this.getMap();
        let http = this.getHttp();

        map.data.forEach(function (feature) {
            map.data.remove(feature);
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

    showModal() {
        return this.hideModal = document.getElementById("divModal").style.visibility = "visible";
    }

    closeModal() {
        this.hideModal = document.getElementById("topLevel").style.visibility = "hidden";
        this.hideModal = document.getElementById("middleLevel").style.visibility = "hidden";
        this.hideModal = document.getElementById("bottomLevel").style.visibility = "hidden";
        this.hideModal = document.getElementById("divModal").style.visibility = "hidden";

        this.setRunned(false);
    }

}





