import {Component, CORE_DIRECTIVES} from 'angular2/angular2';

@Component({
    selector: 'mou-map',
    directives: [CORE_DIRECTIVES],
    templateUrl: './components/map/map.html'
})


export class Map {
    writeYolo() {
        console.log("yol");
    }

}
