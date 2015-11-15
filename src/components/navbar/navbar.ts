import {Component} from 'angular2/angular2';
import {Search} from "../search/search";

@Component({
    selector: 'mou-navbar',
    directives: [Search],
    templateUrl: './components/navbar/navbar.html'
})
export class Navbar {

}


