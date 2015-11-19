import {Component,View,EventEmitter, CORE_DIRECTIVES} from 'angular2/angular2';
import {Search} from "../search/search";

@Component({
    selector: 'mou-navbar',
    directives: [CORE_DIRECTIVES, Search],
    templateUrl: './components/navbar/navbar.html',
    events:['outevent'],
    styleUrls: ['./components/navbar/navbar.css']
})

export class Navbar {
    constructor(){
        this.outevent = new EventEmitter();
    }

    inevent(e){
        this.outevent.next(e);
    }
}


