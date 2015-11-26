import {CORE_DIRECTIVES, Directive, View, EventEmitter, ElementRef} from 'angular2/angular2';
import {Http} from 'angular2/http';

// RxJs
import * as Rx from '@reactivex/rxjs/dist/cjs/Rx';

import {SearchService} from "./SearchService";

declare var zone: Zone;

@Directive({
    selector: 'input[type=text][mou-live-search]',
    outputs: ['results', 'loading'],
    providers: [CORE_DIRECTIVES, SearchService]
})
export class LiveSearch {
    results:EventEmitter = new EventEmitter();
    loading:EventEmitter = new EventEmitter();
    

    constructor(private el:ElementRef, public http:Http, public search:SearchService) {

    }

    onInit() {
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
                zone.bind(orgunits => {
                    //this.filterUnits(orgunits)
                    this.results.next(this.filterUnits(orgunits));
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

    filterUnits(orgunits) {
        var filteredOrgunits: Array<any> = [];
        for (var i = 0; i < orgunits.length; i++) {
            this.http.get(orgunits[i].href)
                .map(res => res.json())
                .subscribe(
                    zone.bind(orgunits => {
                        if (ownershipSelector.value == "" && typeSelector.value == "" && locationSelector.value == "") {
                            filteredOrgunits.push(orgunits);
                        }
                        else {
                            var os = false;
                            var ls = false;
                            var ts = false;
                            for (var group in orgunits.organisationUnitGroups) {
                                if (ownershipSelector.value != "") {
                                    if (orgunits.organisationUnitGroups[group].name == ownershipSelector.value) {
                                        os = true;
                                    }
                                }
                                if (ownershipSelector.value == "") {
                                    os = true;
                                }
                                if (typeSelector.value != "") {
                                    if (orgunits.organisationUnitGroups[group].name == typeSelector.value) {
                                        ts = true;
                                    }
                                }
                                if (typeSelector.value == "") {
                                    ts = true;
                                }
                                if (locationSelector.value != "") {
                                    if (orgunits.organisationUnitGroups[group].name == locationSelector.value) {
                                        ls = true;
                                    }
                                }
                                if (locationSelector.value == "") {
                                    ls = true;
                                }
                                if (os == true && ts == true && ls == true) {
                                    filteredOrgunits.push(orgunits);
                                    os = false;
                                    ts = false;
                                    ls = false;
                                }
                            }
                        }
                    })
                )
        }
        console.log(filteredOrgunits);
        return filteredOrgunits;
    }
}

