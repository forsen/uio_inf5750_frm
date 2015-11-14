import {Injectable} from 'angular2/angular2';
import {Http} from 'angular2/http';

@Injectable()
export class DhisapiService {
    private http: Http;

    constructor(http: Http){
        this.http = http;
    }

    getApiURL = function(callback){
        this.http.get('../manifest.webapp')
            .map(res => res.json())
            .map(res => res.activities.dhis.href)
            .subscribe( res => callback(res));
    }
}
