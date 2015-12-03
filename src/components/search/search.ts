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
    emptySearch: any;
    slide: any;


    constructor(public http:Http) {
        this.newsearch = new EventEmitter();
        this.visible = true;
        this.emptySearch = document.getElementById("divresult");
        this.getUnitGroupSets();
        this.ownershipSelector = document.getElementById("ownershipSelector");
        this.typeSelector = document.getElementById("typeSelector");
        this.locationSelector = document.getElementById("locationSelector");
        this.searchBar = document.getElementById("livesearch");
        this.orglist = document.getElementById("orglist");
        this.a = document.getElementById("testunit");
    }

    getMoreInfo(orgunit) {
        this.orgunits = [];
        this.newsearch.next(orgunit.id);
    }

    //pil opp og ned

    toggle() {
        this.visible = !this.visible;
        //this.getUnitGroupSets();
    }

    hideDiv(){
        if(livesearch.value == "")
            return true;

    }


    emptyByClick(){
        return this.emptySearch = document.getElementById("divresult").style.visibility = "hidden";
    }


    getUnitGroupSets(){
        this.http.get(dhisAPI + "/api/organisationUnitGroupSets")
        .map(res => res.json())
        .map(res => res.organisationUnitGroupSets)
        .subscribe(
            zone.bind( res =>{
                this.setOptionHeader(this.ownershipSelector, res[0].name);
                this.setOptionHeader(this.typeSelector, res[1].name);
                this.setOptionHeader(this.locationSelector, res[2].name);

                for(var i = 0; i < res.length; i++) {
                    this.http.get(res[i].href)
                    .map(result => result.json())
                    .subscribe(
                        zone.bind(result => {
                            if(result.displayName == "Facility Ownership"){
                                for(var j = 0; j < result.organisationUnitGroups.length; j++) {
                                    this.setOption(this.ownershipSelector, result.organisationUnitGroups[j].name);
                                }
                            }
                            else if(result.displayName == "Facility Type"){
                                for(var j = 0; j < result.organisationUnitGroups.length; j++) {
                                    this.setOption(this.typeSelector, result.organisationUnitGroups[j].name);
                                }
                            }
                            else if(result.displayName == "Location Rural/Urban"){
                                for(var j = 0; j < result.organisationUnitGroups.length; j++) {
                                    this.setOption(this.locationSelector, result.organisationUnitGroups[j].name);
                                }
                            }
                    }));
                }
            })
        )
    }

    setOptionHeader(selector, value){
        this.option = document.createElement("option");
        this.option.text = "-- " + value + " --";
        this.option.value = "";
        selector.appendChild(this.option);
    }

    setOption(selector, value){
        this.option = document.createElement("option");
        this.option.text = value;
        this.option.value = value;
        selector.appendChild(this.option);
    }

    checkOrgunits(){
        if(!this.orgunits.length == false && !this.filterset){
            this.setFilter();
            this.filterset = true;
        }
        else if(!this.orgunits.length){
            this.filteredOrgunits = [];
            if(this.filterset) {
                this.filterset = false;
            }

        }
        return !this.orgunits.length;
    }


    setFilter(){
        this.filteredOrgunits = [];

        for (var i = 0; i < this.orgunits.length; i++) {
            this.http.get(this.orgunits[i].href)
                .map(res => res.json())
                .subscribe(
                    zone.bind(orgunits => {
                        if (this.ownershipSelector.value == "" && this.typeSelector.value == "" && this.locationSelector.value == "") {
                            this.filteredOrgunits.push(orgunits);
                        }
                        else {
                            var os = false; var ls = false;var ts = false;
                            for (var group in orgunits.organisationUnitGroups) {
                                if (this.ownershipSelector.value != "") {
                                    if (orgunits.organisationUnitGroups[group].name == this.ownershipSelector.value) {
                                        os = true;
                                    }
                                }
                                if (this.ownershipSelector.value == "") {
                                    os = true;
                                }
                                if (this.typeSelector.value != "") {
                                    if (orgunits.organisationUnitGroups[group].name == this.typeSelector.value) {
                                        ts = true;
                                    }
                                }
                                if (this.typeSelector.value == "") {
                                    ts = true;
                                }
                                if (this.locationSelector.value != "") {
                                    if (orgunits.organisationUnitGroups[group].name == this.locationSelector.value) {
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


