import {Component, CORE_DIRECTIVES,} from 'angular2/angular2';
import {Http} from 'angular2/http';


@Component({
    selector: 'mou-sidebar',
    directives: [CORE_DIRECTIVES],
    templateUrl: './components/sidebar/sidebar.html'
})
export class Sidebar {
    http: Http;

    constructor(http:Http){
        this.http = http;
    }
}

