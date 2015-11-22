import {Component, NgFor, NgIf, NgModel, CORE_DIRECTIVES,FORM_DIRECTIVES} from 'angular2/angular2';
import {Http} from 'angular2/http';


@Component({
    selector: 'mou-sidebar',
    directives: [CORE_DIRECTIVES,FORM_DIRECTIVES,NgFor,NgModel,NgIf],
    templateUrl: './components/sidebar/sidebar.html'
})
export class Sidebar {
    http: Http;
    activeOrgUnit: Object;
    editmode: boolean;

    constructor(http:Http){
        this.http = http;
        this.editmode = false;
    }

    update(orgunitId){
        console.log(orgunitId);
        this.http.get(dhisAPI + "/api/organisationUnits/" + orgunitId)
            .map(res => res.json())
            .subscribe(res => this.activeOrgUnit = res)
    }
}

