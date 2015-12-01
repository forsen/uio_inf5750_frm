import {Component, NgFor, NgIf, NgModel, CORE_DIRECTIVES,FORM_DIRECTIVES} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http';

declare var zone: Zone;

@Component({
    selector: 'mou-sidebar',
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, NgFor, NgModel, NgIf],
    templateUrl: './components/sidebar/sidebar.html',
    styles: [`
        .ng-valid[required] {
            border-left: 5px solid #42A948; /* green */
        }
        .ng-invalid {
            border-left: 5px solid #a94442; /* red */
        }
    `]
})
export class Sidebar {
    http:Http;
    activeOrgUnit:Object;
    editmode:boolean;
    active: boolean;
    constructor(http:Http) {
        this.http = http;
        this.editmode = false;
        this.active = false;
        this.activeOrgUnit = new Object();
    }

    update(orgunitId) {
        this.active = true;
        this.http.get(dhisAPI + "/api/organisationUnits/" + orgunitId)
            .map(res => res.json())
            .subscribe(res => this.activeOrgUnit = res)
    }

    onSubmit() {
        this.editmode = false;

        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');

        if (this.activeOrgUnit.id) {
            this.http.put(dhisAPI + "/api/organisationUnits/" + this.activeOrgUnit.id, JSON.stringify(this.activeOrgUnit), {
                    headers: headers
                })
                .map(res => res.json())
                .subscribe(res => console.log(res));
        }



    }

    cancel(){
        this.editmode = false;
        if(this.activeOrgUnit.id){
            this.update(this.activeOrgUnit.id);
        }else{
            this.activeOrgUnit = new Object();
        }
    }

    addData(data){

        this.active = true;
        this.editmode = true;
        console.log(data);
        this.activeOrgUnit = new Object();
        this.activeOrgUnit.name = "Erik";
        console.log("faen");
        zone.afterTask();
    }
}

