import {HTTP_PROVIDERS} from 'angular2/http';
import {Component, NgZone, NgIf, View, bootstrap, provide, ELEMENT_PROBE_PROVIDERS} from 'angular2/angular2';
import {Map} from './map/map';
import {Search} from "./search/search";
import {Sidebar} from "./sidebar/sidebar";


declare var System:any;

@Component(
    {
        selector: 'mou-app',
        templateUrl: './components/app.html',
        directives:[Map, Search, Sidebar, NgIf]
    })


class App {
    zone: Zone;

    constructor(zone: NgZone){
        this.zone = zone;
    }
    toplevel: boolean = false;

    showtoplevel(){
        let instance = this;
        zone.run(() => {
            this.setToplevelTrue();
        });
    }

    setToplevelTrue(){
        this.toplevel = true;
    }
}

bootstrap(App,[HTTP_PROVIDERS, ELEMENT_PROBE_PROVIDERS]);
