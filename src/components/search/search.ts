import {Component,EventEmitter, View, CORE_DIRECTIVES} from 'angular2/angular2';
import {Http} from 'angular2/http';
import {LiveSearch} from "./livesearch";
import {Sidebar} from "../sidebar/sidebar";
import * as Rx from '@reactivex/rxjs/dist/cjs/Rx';

declare var zone: Zone;

@Component({
    selector: 'mou-search',
    directives: [CORE_DIRECTIVES, LiveSearch],
    events: ['newsearch'],
    templateUrl: './components/search/search.html',
    styleUrls: ['./components/search/search.css']
})
export class Search {
    orgunits: Array<any> = [];
    filteredOrgunits: Array<any> = [];
    loading: boolean = false;
    groups: Array<any> = [];
    groupSet: Array<any> = [];
    ownershipSelector: any;
    typeSelector: any;
    locationSelector: any;
    option: any;
    searchBar: any;
    filterset: boolean = false;

    constructor(public http:Http) {
        this.newsearch = new EventEmitter();
        this.visible = true;
        this.getUnitGroupSets();
        this.ownershipSelector = document.getElementById("ownershipSelector");
        this.typeSelector = document.getElementById("typeSelector");
        this.locationSelector = document.getElementById("locationSelector");
        this.searchBar = document.getElementById("livesearch");
    }

    getMoreInfo(orgunit) {
        this.orgunits = [];
        this.newsearch.next(orgunit.id);
        return document.getElementById("searchform").reset();

    }

    //When filtermenu is open show x else show arraowdown
    toggle() {
        this.visible = !this.visible;
        if (this.visible) {
            this.resetSelector();
        }
    }

    resetSelector(){
        this.ownershipSelector.selectedIndex = 0;
        this.typeSelector.selectedIndex = 0;
        this.locationSelector.selectedIndex = 0;
        this.checkOrgunits();
    }

    //Hide results when search bar input is erased
    hideDiv() {
        if (this.searchBar.value == ""){
            //this.toggle();
            return true;
        }
    }

    //Click out results and empty the search bar
    emptyByClick(){
        this.orgunits = [];
        return document.getElementById("searchform").reset();
    }

    //Gets all unit group sets (category groups) and the unit groups
    getUnitGroupSets() {
        //gets unit group sets and display in selector
        this.http.get(dhisAPI + "/api/organisationUnitGroupSets")
            .map(res => res.json())
            .map(res => res.organisationUnitGroupSets)
            .subscribe(
                zone.bind(res => {
                    this.setOptionHeader(this.ownershipSelector, res[0].name);
                    this.setOptionHeader(this.typeSelector, res[1].name);
                    this.setOptionHeader(this.locationSelector, res[2].name);

                    for (var i = 0; i < res.length; i++) {
                        //gets unit groups for each group set and display in selector
                        this.http.get(res[i].href)
                            .map(result => result.json())
                            .subscribe(
                                zone.bind(result => {
                                    if (result.displayName == "Facility Ownership") {
                                        for (var j = 0; j < result.organisationUnitGroups.length; j++) {
                                            this.setOption(this.ownershipSelector, result.organisationUnitGroups[j].name);
                                        }
                                    }
                                    else if (result.displayName == "Facility Type") {
                                        for (var j = 0; j < result.organisationUnitGroups.length; j++) {
                                            this.setOption(this.typeSelector, result.organisationUnitGroups[j].name);
                                        }
                                    }
                                    else if (result.displayName == "Location Rural/Urban") {
                                        for (var j = 0; j < result.organisationUnitGroups.length; j++) {
                                            this.setOption(this.locationSelector, result.organisationUnitGroups[j].name);
                                        }
                                    }
                                })
                            );
                    }
                })
            )
    }

    //Add group set "header" to selector
    setOptionHeader(selector, value) {
        this.option = document.createElement("option");
        this.option.text = "All";
        this.option.value = "";
        selector.appendChild(this.option);
    }

    //Add group to selector
    setOption(selector, value) {
        this.option = document.createElement("option");
        this.option.text = value;
        this.option.value = value;
        selector.appendChild(this.option);
    }

    //Checks the status of orgunits-array and if filter is set
    checkOrgunits() {
        if (this.ownershipSelector.value == "" && this.typeSelector.value == "" && this.locationSelector.value == "") {
            this.filteredOrgunits = [];
            for (var i = 0; i < this.orgunits.length; i++) {
                this.filteredOrgunits.push(this.orgunits[i]);
            }
        }
        else if (!this.orgunits.length == false && !this.filterset) {
            this.setFilter();
        }
        else if (!this.orgunits.length) {
            this.filteredOrgunits = [];
            if (this.filterset) {
                this.filterset = false;
            }
        }
        if(this.filteredOrgunits.length == 0){
            return false;
        }
        else{
            return !this.orgunits.length;
        }
    }

    //Filtering the orgunits-array by checking what filter is active
    setFilter() {
        this.filteredOrgunits = [];
        this.filterset = true;
        for (var i = 0; i < this.orgunits.length; i++) {
            this.http.get(this.orgunits[i].href)
                .map(res => res.json())
                .subscribe(
                    zone.bind(orgunits => {
                        if (this.ownershipSelector.value == "" && this.typeSelector.value == "" && this.locationSelector.value == "") {
                            this.filteredOrgunits.push(orgunits);
                        }
                        else {
                            var os = false;
                            var ls = false;
                            var ts = false;
                            for (var j = 0; j < orgunits.organisationUnitGroups.length; j++) {
                                if (this.ownershipSelector.value != "") {
                                    if (orgunits.organisationUnitGroups[j].name == this.ownershipSelector.value) {
                                        os = true;
                                    }
                                }
                                if (this.ownershipSelector.value == "") {
                                    os = true;
                                }
                                if (this.typeSelector.value != "") {
                                    if (orgunits.organisationUnitGroups[j].name == this.typeSelector.value) {
                                        ts = true;
                                    }
                                }
                                if (this.typeSelector.value == "") {
                                    ts = true;
                                }
                                if (this.locationSelector.value != "") {
                                    if (orgunits.organisationUnitGroups[j].name == this.locationSelector.value) {
                                        ls = true;
                                    }
                                }
                                if (this.locationSelector.value == "") {
                                    ls = true;
                                }
                                if (os == true && ts == true && ls == true) {
                                    this.filteredOrgunits.push(orgunits);
                                    os = false;
                                    ts = false;
                                    ls = false;
                                }
                            }
                        }
                    })
                )
        }
    }
}


