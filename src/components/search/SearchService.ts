import {provide, Injectable} from 'angular2/angular2';
import {Http} from 'angular2/http';
import * as Rx from '@reactivex/rxjs/dist/cjs/Rx';

@Injectable()
export class SearchService {
/*
    data: Rx.Observable<any[]>;

    constructor(http: Http){
        this.data = http.get('testData.json')
            .map(res => res.json())
            .map(res => res.items);
    }
*/

    constructor(public http: Http){

    }
    search(query: string): Rx.Observable<any[]>{
        return this.http.get('testData.json')
            .map(res=>res.json())
            .map(res => res.organisationUnits)
            .filter(function(name:string){
                return name.toLowerCase().indexOf(query.toLowerCase());
            });

            //.map(res => res.json())
            //.map(res => res.organizationUnits);
    //.filter(function(name){
    //        return name.indexOf(query);
    //    })
    }
}

export var SEARCH_PROVIDERS: Array<any> = [
    provide(SearchService, {useClass: SearchService})
];
