import {Component, View, CORE_DIRECTIVES} from 'angular2/angular2';
import {Headers, Http} from 'angular2/http';
import {DhisapiService} from "../dhisapi/dhisapiService";

@Component({
    selector: 'mou-filter',
    directives: [CORE_DIRECTIVES],
    templateUrl: './components/filter/filter.html',
    providers: [DhisapiService]
})

export class Filter {
    result: Object;

    dhis: DhisapiService;
    // Example HTTP request

    /*
    constructor(http: Http) {
        var authHeader = new Headers();
        authHeader.append('Authorization', 'Basic YWRtaW46ZGlzdHJpY3Q=');
        this.result = {organisationUnits:[]};
        http.get(dhisAPI+'/api/organisationUnits?paging=false', {headers: authHeader})
        //http.get('orgunit.json')
            .map(res => res.json()).subscribe(
            res => this.result = res,
            error => this.logError(error)
        );
    }


    logError(error){
        console.error(error);
    }

    */

    constructor(dhis: DhisapiService){
        this.dhis = dhis;
    }

    onInit(){
        this.dhis.getApiURL(function(uri){
            console.log("Dette er uri: " + uri);
        })
    }

}
