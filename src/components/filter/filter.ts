import {Component, View, CORE_DIRECTIVES, NgFor} from 'angular2/angular2';
import {Headers, Http} from 'angular2/http';

@Component({
    selector: 'mou-filter',
    directives: [CORE_DIRECTIVES, NgFor],
    templateUrl: './components/filter/filter.html'
})

export class Filter {
    result: Object;

    // Example HTTP request


    constructor(http: Http) {
        var authHeader = new Headers();
        authHeader.append('Authorization', 'Basic YWRtaW46ZGlzdHJpY3Q=');
        this.result = {organisationUnits:[]};
        http.get('http://mydhis.com:8082/api/organisationUnits?paging=false', {headers: authHeader})
        //http.get('orgunit.json')
            .map(res => res.json()).subscribe(
            res => this.result = res,
            error => this.logError(error)
        );

    }
    
    filterUnits(){
        console.log(this.result);
    }


    logError(errorm test){
        console.error(error);
    }
}
