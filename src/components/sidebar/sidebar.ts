import {Component, NgFor, NgIf, NgModel, Control, ControlGroup, ControlArray, Validators, FormBuilder, CORE_DIRECTIVES,FORM_DIRECTIVES} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http';

declare var zone: Zone;

@Component({
    selector: 'mou-sidebar',
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, NgFor, NgModel, NgIf],
    templateUrl: './components/sidebar/sidebar.html',
    styles: [`
        .ng-valid.ng-dirty {
            border-left: 5px solid #42A948; /* green */
        }
        .ng-invalid {
            border-left: 5px solid #a94442; /* red */
        }
        .form-background {
            padding: 10px;
            background: white;
        }
    `]
})

export class Sidebar {
    form: ControlGroup;
    http:Http;
    newObject: boolean;
    editmode:boolean;
    active: boolean;

    id: Control = new Control("");
    name: Control = new Control("", Validators.required);
    shortName: Control = new Control("",Validators.required);
    description: Control = new Control("");
    code: Control = new Control("");
    openingDate: Control = new Control("",Validators.required);
    closedDate: Control = new Control("");
    url: Control = new Control("");
    lat: Control = new Control("");
    lng: Control = new Control("");
    parent: Control = new Control("");
    contactPerson: Control = new Control("");
    address: Control = new Control("");
    email: Control = new Control("");
    phoneNumber: Control = new Control("");


    constructor(http:Http, fb: FormBuilder) {
        this.http = http;
        this.editmode = false;
        this.active = false;
        this.form = fb.group({
            "id": this.id,
            "name": this.name,
            "shortName": this.shortName,
            "description": this.description,
            "code": this.code,
            "openingDate": this.openingDate,
            "closedDate": this.closedDate,
            "url": this.url,
            "lat": this.lat,
            "lng": this.lng,
            "parent": this.parent,
            "contactPerson": this.contactPerson,
            "address": this.address,
            "email": this.email,
            "phoneNumber": this.phoneNumber
        });
    }

    update(orgunitId) {
        this.active = true;
        this.newObject = false;
        this.http.get(dhisAPI + "/api/organisationUnits/" + orgunitId)
            .map(res => res.json())
            .subscribe(res => this.updateValues(res))
    }

    updateValues(res){
        for(control in this.form.controls){
            if(res[control] !== undefined) {
                this.form.controls[control].updateValue(res[control]);
            }
            else
                this.form.controls[control].updateValue("");
        }
    }
    onSubmit() {
        this.editmode = false;

        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');

        let jsonObject = this.form.value;

        $.each(jsonObject, function(key, value){
            if (value === "" || value === null){
                delete jsonObject[key];
            }
        });



        console.log(this.form.value);

        if (this.newObject) {
            jsonObject.parent = {};
            jsonObject.parent.id = this.form.controls.parent.value;
            jsonObject.featureType="POINT";
            jsonObject.coordinates="[" + this.form.controls.lat.value + ","+this.form.controls.lng.value+"]";
            delete jsonObject["lat"];
            delete jsonObject["lng"];
            this.http.post(dhisAPI + "/api/organisationUnits/", JSON.stringify(jsonObject), {
                    headers: headers
                })
                .map(res => res.json())
                .subscribe(res => console.log(res));
        }else{
            this.http.put(dhisAPI + "/api/organisationUnits/" + this.form.controls.id.value, JSON.stringify(jsonObject),{
                headers: headers
            })
            .map(res => res.json())
            .subscribe(res => console.log(res));
        }




        //console.log(this.form);


    }

    cancel(){
        this.editmode = false;
    }

    add(data){
        this.newObject=true;
        this.setActive();
        this.editmode = true;
        console.log(data);

        this.form.controls.lat.updateValue(data.location.lat);
        this.form.controls.lng.updateValue(data.location.lng);
        this.form.controls.parent.updateValue(data.parent);

        console.log("faen");

    }

    setActive(){
        this.active = true;
    }
}

