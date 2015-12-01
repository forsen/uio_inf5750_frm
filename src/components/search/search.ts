import {Component,EventEmitter, View, CORE_DIRECTIVES} from 'angular2/angular2';
import {Http} from 'angular2/http';
import {LiveSearch} from "./livesearch";
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
    loading: boolean = false;
    groups: Array<any> = [];
    groupSet: Array<any> = [];
    counter: number = 0;
    ownershipSelector: any;
    typeSelector: any;
    locationSelector: any;
    option: any;
    searchBar: any;

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
        console.log("yolo");
        this.newsearch.next(orgunit.id);
    }

    //pil opp og ned

    toggle() {
        this.visible = !this.visible;
        //this.getUnitGroupSets();
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

    setFilter(){
        console.log("Dette er setFilter");
        console.log(this.ownershipSelector.value);
        var text = livesearch.value;

        //livesearch.value = "";
        //console.log(this.searchBar.key);

        /*for(var i = 0; i < text.length; i++){
            livesearch.value += text.charAt(i);
        }*/
        //this.searchBar.createEvent('keyup');

        this.searchBar.focus(true);
    }
}


