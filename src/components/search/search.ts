import {Component, View, CORE_DIRECTIVES} from 'angular2/angular2';
import {Observable} from 'angular2/angular2';
import {Pipe} from 'angular2/angular2';
import {Http} from 'angular2/http';
import {Livesearch} from './livesearch';

@Component({
    selector: 'mou-search',
    directives: [CORE_DIRECTIVES],
//    templateUrl: './components/search/search.html'
    template: '{{ 10 | livesearch }}',
    pipes: [Livesearch]
})



export class Search {
    data: Object;
    constructor(http: Http){
        this.data = http.get('items.json');
    }
}


