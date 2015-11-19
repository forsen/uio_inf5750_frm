import {HTTP_PROVIDERS} from 'angular2/http';
import {Component, View, bootstrap, provide, ELEMENT_PROBE_PROVIDERS} from 'angular2/angular2';
import {Map} from './map/map';
import {Navbar} from "./navbar/navbar";
import {Sidebar} from "./sidebar/sidebar";

declare var System:any;

@Component({
    selector: 'mou-app',
    templateUrl: './components/app.html',
    directives: [Map, Navbar, Sidebar]
})
class App {}

bootstrap(App, [HTTP_PROVIDERS, ELEMENT_PROBE_PROVIDERS]);
