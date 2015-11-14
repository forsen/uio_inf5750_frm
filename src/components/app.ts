import {HTTP_PROVIDERS} from 'angular2/http';
import {Component, View, bootstrap, provide, ELEMENT_PROBE_PROVIDERS} from 'angular2/angular2';
import {Map} from './map/map';
import {Search} from "./search/search";
import {Filter} from "./filter/filter";
import {DhisapiService} from "./dhisapi/dhisapiService";

declare var System:any;

@Component(
    {
        selector: 'mou-app',
        templateUrl: './components/app.html',
        directives:[Filter, Map, Search],
        providers: [DhisapiService]
    })


class App {
    constructor(dhis: DhisapiService){
        dhis.getApiURL(function(uri){
            console.log(uri);
        })
    }

}

bootstrap(App,[HTTP_PROVIDERS, ELEMENT_PROBE_PROVIDERS, DhisapiService]);
