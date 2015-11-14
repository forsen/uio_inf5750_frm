import {Directive, View, EventEmitter, ElementRef} from 'angular2/angular2';

// RxJs
import * as Rx from '@reactivex/rxjs/dist/cjs/Rx';

import {SearchService} from "./SearchService";

declare var zone: Zone;

@Directive({
    selector: 'input[type=text][mou-live-search]',
    outputs: ['results', 'loading'],
    providers: [SearchService]
})
export class LiveSearch {
    results: EventEmitter = new EventEmitter();
    loading: EventEmitter = new EventEmitter();

    constructor( private el: ElementRef, public search: SearchService){

    }

    onInit(){
        console.log("starting");
        (<any>Rx).Observable.fromEvent(this.el.nativeElement, 'keyup')
            .map(e => e.target.value)
            .filter(text => text.length > 2)
            .debounceTime(250)
            .distinctUntilChanged()
            .do(zone.bind(() => this.loading.next(true)))
            .flatMap(query => this.search.search(query))
            .do(zone.bind(() => this.loading.next(false)))
            .subscribe(
                zone.bind( orgunits => {
                    this.results.next(orgunits);
                }),
                zone.bind(err => {
                    console.log(err);
                    this.results.next(['ERROR, see console']);
                }),
                () => {
                    console.log("complete");
                }
            )
    }
}

