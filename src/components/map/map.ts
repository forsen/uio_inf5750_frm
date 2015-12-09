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
    allLevels:Object;
    runned:boolean;
    uprunned:boolean;
    parent:Object;
    activeId:string;
    currentPos:Object;
    currentMarker:Object;
    isSearched:boolean;
    popupON:boolean;
    popup:Object;
    COLORS:Object;
    colornum: number;

    constructor(http:Http) {

        this.activeId = null;
        this.newactive = new EventEmitter();
        this.neworg = new EventEmitter();
        this.map = new google.maps.Map(document.getElementById("map"), {
            center: {lat: 0, lng: 0},
            zoom: 12,
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_CENTER
            },
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            streetViewControl: false
        });
        this.init();
        this.http = http;
        this.LEVEL = 2;//
        this.runned = false;
        this.getLevels(this);
        this.parent = null;
        this.currentPos = null;
        this.uprunned = false;
        this.currentMarker = null;
        this.isSearched = false;
        this.colornum = 0;
        this.COLORS = ['#ede1bb', '#1d407e', '#ff512e', '#662d47','#3b3a35', '#419175', '#983e41', '#f3002d', '#b0a875', '#00bfb5', '#926851', '#47a0a4','#333f50','#6f007b'];
        this.popupON = false;
        this.popup = null;
    }


    setActiveId(id) {
        this.activeId = id;
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

    getLevels() {
        this.http.get(dhisAPI + '/api/organisationUnitLevels')
            .map(res => res.json())
            .subscribe(
                res => this.saveLevelTotalandGetdata(res, this),
                err => this.logError(err)
            );
    }

    saveLevelTotalandGetdata(res, instance) {
        instance.allLevels = res.pager.total;
        instance.getData('?paging=false&level=2', instance, false);
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

        if (feature !== undefined) {
            let unit = {
                "type": "Feature",
                "geometry": {
                    "type": feature,
                    "coordinates": JSON.parse(item.coordinates)
                },
                "properties": {
                    "title": item.name,
                    "name": item.name,
                    "id": item.id,
                    "color":instance.COLORS[instance.colornum],
                    "icon": null
                }
            };
            if(instance.COLORS.length == instance.colornum){
                instance.colornum = 0;
            }else{ instance.colornum++;}

            if (unit.geometry.type == 'Point') {
                unit.properties.icon = {
                    path: google.maps.SymbolPath.CIRCLE,
                    strokeColor: 'black',
                    scale: 4
                };
                instance.map.setCenter({lat:unit.geometry.coordinates[1],lng:unit.geometry.coordinates[0]});
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
                    fillOpacity: 0.91,
                    strokeColor: 'white',
                    strokeWeight: 2,
                    icon: icon
                });
            });
            if(instance.isSearched){
                instance.seeDetails();
            }
            this.map.data.addListener('click', function (event) {
                $('#myModal').modal('show');
                instance.setActiveId(event.feature.O.id);
                instance.setcurrentPos(event.latLng);

                if (instance.uprunned == false && instance.LEVEL == 2) {
                    this.hideModal = document.getElementById("topLevel").style.display = "block";
                    this.hideModal = document.getElementById("middleLevel").style.display = "none";
                    this.hideModal = document.getElementById("bottomLevel").style.display = "none";
                }
                else if (instance.runned == false && instance.LEVEL < instance.allLevels) {
                    this.hideModal = document.getElementById("topLevel").style.display = "none";
                    this.hideModal = document.getElementById("middleLevel").style.display = "block";
                    this.hideModal = document.getElementById("bottomLevel").style.display = "none";
                } else if (instance.runned == false && instance.LEVEL <= instance.allLevels) {
                    this.hideModal = document.getElementById("topLevel").style.display = "none";
                    this.hideModal = document.getElementById("middleLevel").style.display = "none";
                    this.hideModal = document.getElementById("bottomLevel").style.display = "block";

                    instance.setcurrentPos(event.latLng);
                }
            });


            this.map.data.addListener('mouseover', function (e) {  
                if(!instance.popupON) {
                    instance.popupON = true;
                    console.log("hei");
                    instance.popup = new google.maps.InfoWindow({
                        content: e.feature.getProperty('name'),
                        position: e.latLng
                    });
                    instance.popup.open(instance.map);

                }
            }); 
            this.map.data.addListener('mouseout', function (event) {  
                instance.popupON = false;
                instance.popup.open(null); 
            });

        }
    }

    drillDown() {
        this.closeModal();
        let map = this.getMap();
        let id = this.activeId;
        let level = this.LEVEL;
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


        this.setupRunned(true);
        this.upLevel();
        let instance = this;
        this.closeModal();
        this.map.data.forEach(function (feature) {
            instance.map.data.remove(feature);

        });
        if (this.currentMarker !== null) {
            this.currentMarker.setMap(null);
        }
        let parent = instance.getParent();
        instance.getData('/' + parent, instance, true);

        this.closeModal();
    }

    seeDetails() {
        let map = this.getMap();
        let id = this.activeId;
        this.closeModal();
        map.data.forEach(function (feature) {
            if (feature.getProperty('id') == id) {
                feature.setProperty('color', 'red');
                if (feature.getProperty('icon') !== null) {
                    feature.O.icon.strokeColor = 'red';
                }
                this.isSearched=false;
            }
            else {
                feature.setProperty('color', 'gray');
                if (feature.getProperty('icon') !== null) {
                    feature.O.icon.strokeColor = 'black';
                }
            }
        });
        this.newactive.next(this.activeId);
    }

    addUnit() {
        this.closeModal();
        let pos = this.getcurrentPos();
        let lat = pos.lat();
        let lng = pos.lng();
        let parent = this.getParent();

        let location = {lat: lat, lng: lng};
        let event = {location, parent};
        this.neworg.next(event);
        this.closeModal();
        this.setRunned(false);
    }

    update(event) {
        this.newactive.next(event);
        let map = this.getMap();
        let http = this.getHttp();

        map.data.forEach(function (feature) {
            map.data.remove(feature);
        });
        http.get(dhisAPI + '/api/organisationUnits/' + event)
            .map(res => res.json())
            .subscribe(
                res => this.mapUpdate(res, this)
            );

    }

    mapUpdate(res, instance) {
        this.setLevel(res.level);
        this.setActiveId(res.id);
        this.isSearched = true;
        this.setParent(res.parent.id);

        instance.getData('/' + res.parent.id + '/children', instance);
        if (res.coordinates == null || instance.LEVEL == instance.allLevels) {
            instance.http.get(dhisAPI + '/api/organisationUnits/' + res.parent.id)
                .map(res => res.json())
                .subscribe(
                    res => instance.drawPolygon(res, instance)
                );
        }

    }

    tempMarker(pos) {
        let map = this.map;
        if (this.currentMarker)
            this.currentMarker.setMap(null);

        this.currentMarker = new google.maps.Marker({
            position: pos,
            map: map,
            title: 'neworg',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 4
            }
        });
        this.currentMarker.setMap(map);
        map.panTo(this.currentMarker.getPosition());
    }




    closeModal() {
        $("#myModal").modal("hide");
        this.setRunned(false);
    }

}





