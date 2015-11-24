import {Component,EventEmitter, View, CORE_DIRECTIVES} from 'angular2/angular2';
import {LiveSearch} from "./livesearch";

@Component({
    selector: 'mou-search',
    directives: [CORE_DIRECTIVES, LiveSearch],
    events: ['newsearch'],
    templateUrl: './components/search/search.html',
    styleUrls: ['./components/search/search.css']
})
export class Search {
    orgunits: Array<any> = [];
    loading: boolean = false;

    constructor() {
        this.newsearch = new EventEmitter();
        this.visible = true;

    }

    getMoreInfo(orgunit) {
        this.newsearch.next(orgunit.id);
    }

    //pil opp og ned

    toggle() {
        this.visible = !this.visible;
    }

}


