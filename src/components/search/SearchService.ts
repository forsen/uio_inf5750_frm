import {provide, Injectable} from 'angular2/angular2';
import {Http} from 'angular2/http';
import * as Rx from '@reactivex/rxjs/dist/cjs/Rx';

@Injectable()
export class SearchService {

    constructor(public http: Http){

    }
    search(query: string): Rx.Observable<any[]>{
        return this.http.get(dhisAPI + "/api/organisationUnits?paging=false&filter=name:like:" + query)
            .map(res=>res.json())
            .map(res => res.organisationUnits)
            .filter(orgunits => orgunits);

    }
}

export var SEARCH_PROVIDERS: Array<any> = [
    provide(SearchService, {useClass: SearchService})
];
