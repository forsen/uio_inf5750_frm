import {Component, View, CORE_DIRECTIVES} from 'angular2/angular2';
import {LiveSearch} from "./livesearch";

@Component({
    selector: 'mou-search',
    directives: [CORE_DIRECTIVES, LiveSearch],
    templateUrl: './components/search/search.html'
})
export class Search {
    orgunits: Array<any> = [];
    loading: boolean = false;

    constructor(){
    }
}


