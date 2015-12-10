import {Component, NgFor, NgIf, EventEmitter, NgModel, Control, ControlGroup, ControlArray, Validators, FormBuilder, CORE_DIRECTIVES,FORM_DIRECTIVES} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http';

declare var zone:Zone;

@Component({
    selector: 'mou-sidebar',
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, NgFor, NgModel, NgIf],
    events: ['tempmarker', 'updateorg'],
    templateUrl: './components/sidebar/sidebar.html'
})

export class Sidebar {
    http:Http;
    newObject:boolean;
    editmode:boolean;
    active:boolean;
    coordinatePoint:boolean;

    groupSets:Array<any> = [];
    groupsDoubleArray:any[][] = [];

    id:Control = new Control("");
    name:Control = new Control("", Validators.required);
    shortName:Control = new Control("", Validators.required);
    description:Control = new Control("");
    code:Control = new Control("");
    openingDate:Control = new Control("", Validators.required);
    closedDate:Control = new Control("");
    url:Control = new Control("");
    lat:Control = new Control("");
    lng:Control = new Control("");
    parent:Control = new Control("");
    contactPerson:Control = new Control("");
    address:Control = new Control("");
    email:Control = new Control("");
    phoneNumber:Control = new Control("");
    exitButton:any;
    featureType:Control = new Control("");
    coordinates:Control = new Control("");
    ctrlGroups:Array<Control> = [new Control('')];
    groupsArray:ControlArray = new ControlArray(this.ctrlGroups);


    form:ControlGroup = new ControlGroup({
        organisationUnitGroups: this.groupsArray,
        id: this.id,
        name: this.name,
        shortName: this.shortName,
        description: this.description,
        code: this.code,
        openingDate: this.openingDate,
        closedDate: this.closedDate,
        url: this.url,
        lat: this.lat,
        lng: this.lng,
        parent: this.parent,
        contactPerson: this.contactPerson,
        address: this.address,
        email: this.email,
        phoneNumber: this.phoneNumber,
        featureType: this.featureType,
        coordinates: this.coordinates
    });

    constructor(http:Http, fb:FormBuilder) {
        this.http = http;
        this.editmode = false;
        this.active = false;
        this.coordinatePoint = false;
        this.tempmarker = new EventEmitter();
        this.updateorg = new EventEmitter();
        this.exitButton = document.getElementById("slideout")
        let instance = this;

        // listener for value change in coordinate input field
        this.lat.valueChanges.observer({
            next: (value) => {
                if (instance.lng.value && value) {
                    let pos = {lat: value, lng: instance.lng.value};
                    this.tempmarker.next(pos);
                }
            }
        });
        this.lng.valueChanges.observer({
            next: (value) => {
                if (instance.lat.value && value) {
                    let pos = {lat: instance.lat.value, lng: value};
                    this.tempmarker.next(pos);
                }
            }
        });

        // find all orgUnitSets
        this.findOrgUnitSets();
    }

    // this method is called when the sidebar should update its content with new org unit
    update(orgunitId) {
        this.active = true;
        this.newObject = false;
        this.http.get(dhisAPI + "/api/organisationUnits/" + orgunitId)
            .map(res => res.json())
            .subscribe(res => this.updateValues(res))
    }

    // update form values with new information from http get result
    updateValues(res) {

        // update the form controls with data from incoming json object
        for (control in this.form.controls) {
            if (this.form.controls[control] instanceof ControlArray) {
                console.log("nothing to do here");
            }
            else if (res[control] !== undefined) {
                this.form.controls[control].updateValue(res[control]);
            }
            else
                this.form.controls[control].updateValue("");

        }

        // Date fix:
        if (res["openingDate"]) {
            this.form.controls["openingDate"].updateValue((new Date(res["openingDate"].substring(0, 10))).toISOString().substring(0, 10));
        }
        if (res["closedDate"]) {
            this.form.controls["closedDate"].updateValue((new Date(res["closedDate"].substring(0, 10))).toISOString().substring(0, 10));
        }

        // we're only interested in coordinates if it's a featureType point. Since we want to use two different input fields for lat and lang (and the api uses a single object for both)
        // we need to have a separate data structure for coordinates, and update them manually
        if (res.featureType === "POINT") {
            this.coordinatePoint = true;
            let coord = new Object();
            coord = JSON.parse(res["coordinates"]);
            this.form.controls.lat.updateValue(coord[1]);
            this.form.controls.lng.updateValue(coord[0]);
        }
        else {
            this.coordinatePoint = false;
        }

        // Update organisationUnitGroups with correct values from api
        for (var i = 0; i < this.groupsDoubleArray.length; i++) {
            for (var j = 0; j < this.groupsDoubleArray[i].length; j++) {
                for (group in res.organisationUnitGroups) {
                    if (res.organisationUnitGroups[group].id == this.groupsDoubleArray[i][j].id) {
                        this.form.controls.organisationUnitGroups.controls[i].updateValue(this.groupsDoubleArray[i][j].name);
                    }
                }
            }
        }
    }

    // called on form submit
    onSubmit() {
        this.editmode = false;

        let headers = new Headers();
        headers.append('Accept', 'application/json');

        headers.append('Content-Type', 'application/json');


        let jsonObject = this.form.value;

        // remove empty fields from the form object, no need to send empty values to the api
        $.each(jsonObject, function (key, value) {
            if (value === "" || value === null) {
                delete jsonObject[key];
            }
        });

        // we were unable to find a way to associate a new (or existing) organisation unit with one or more organisationUnitGroups, so we're removing the data before posting to API
        $.each(jsonObject.organisationUnitGroups, function (key, value) {
//            if( value === "" || value === null){
            delete jsonObject.organisationUnitGroups[key];
            //          } else {
            //              jsonObject.organisationUnitGroups[key].id = value;
            //         }
        });

        jsonObject.openingDate = (new Date(this.form.value.openingDate)).toISOString();

        if (this.form.value.closedDate) {
            jsonObject.closedDate = (new Date(this.form.value.closedDate)).toISOString();
        }

        if (this.coordinatePoint) {
            jsonObject.featureType = "POINT";
            jsonObject.coordinates = "[" + this.form.controls.lng.value + "," + this.form.controls.lat.value + "]";
        }

        // POST if the object is new, PUT if it's an update to an existing orgUnit
        if (this.newObject) {
            jsonObject.parent = {};
            jsonObject.parent.id = this.form.controls.parent.value;

            delete jsonObject["lat"];
            delete jsonObject["lng"];
            this.http.post(dhisAPI + "/api/organisationUnits/", JSON.stringify(jsonObject), {
                    headers: headers
                })
                .map(res => res.json())
                .subscribe(res => this.emitNewUpdatedObject(res));
        } else {
            this.http.put(dhisAPI + "/api/organisationUnits/" + this.form.controls.id.value, JSON.stringify(jsonObject), {
                    headers: headers
                })
                .map(res => res.json())
                .subscribe(res => console.log(res));
        }
    }

    // emit an event that the current orgUnit has been updated (useful for map component)
    emitNewUpdatedObject(obj) {
        this.updateorg.next(obj.response.lastImported);
    }

    // cancel editing orgUnit
    cancel() {
        this.editmode = false;
        this.tempmarker.next(null);
    }

    // Prepare sidebar for adding new object. Receiving location and parent for the new orgUnit
    add(data) {
        this.coordinatePoint = true;
        this.newObject = true;
        this.active = true;
        this.editmode = true;

        for (control in this.form.controls) {
            if (!(this.form.controls[control] instanceof ControlArray))
                this.form.controls[control].updateValue("");
        }

        this.form.controls.lat.updateValue(data.location.lat);
        this.form.controls.lng.updateValue(data.location.lng);
        this.form.controls.parent.updateValue(data.parent);

    }

    // dismiss sidebar
    exit() {
        this.active = false;
    }

    // dynamically find all orgUnitSets for populating input selects
    findOrgUnitSets() {
        let instance = this;
        this.http.get(dhisAPI + "/api/organisationUnitGroupSets?paging=false")
            .map(res => res.json())
            .map(res => res.organisationUnitGroupSets)
            .subscribe(res => this.addOrgUnitSets(instance, res))
    }

    // adding the orgUnitSets from the api
    addOrgUnitSets(instance, res) {
        //delete instance.ctrlGroups[0];
        for (group in res) {
            instance.groupsArray.push(new Control(''));
            instance.groupSets.push(res[group]);

            this.http.get(dhisAPI + "/api/organisationUnitGroupSets/" + res[group].id)
                .map(res => res.json())
                .map(res => res.organisationUnitGroups)
                .subscribe(res => this.addOrgUnitGroup(instance, res))

        }
    }

    // add orgUnitGroup as option to input selects
    addOrgUnitGroup(instance, res) {
        let ar:Array<any> = [];
        for (group in res) {
            ar.push(res[group]);
        }
        instance.groupsDoubleArray.push(ar);
    }
}

