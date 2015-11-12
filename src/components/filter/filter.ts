import {Component, CORE_DIRECTIVES} from 'angular2/angular2';

@Component({
    selector: 'mou-filter',
    directives: [CORE_DIRECTIVES],
    templateUrl: './components/filter/filter.html'
})

export class Filter {
    writeYolo() {
        console.log("yol");
    }

}



