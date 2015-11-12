import {HTTP_PROVIDERS} from 'angular2/http';
import {Component, View, bootstrap, provide} from 'angular2/angular2';
import {Map} from './map/map';
import {Search} from "./search/search";

declare var System:any;

@Component(
    {
        selector: 'mou-app',
        templateUrl: './components/app.html',
        directives:[Map, Search]
    })


class App {

}

bootstrap(App);