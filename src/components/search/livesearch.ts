import {View, CORE_DIRECTIVES} from 'angular2/angular2';
import {Pipe} from 'angular2/angular2';



@Pipe({
    name: 'livesearch'
})
export class Livesearch {
    transform(value, args) { return value * 2; }
}

