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
    ownernshipSelector: any;
    typeSelector: any;
    locationSelector: any;
    option: any;
    searchBar: any;

    constructor(public http:Http) {
        this.newsearch = new EventEmitter();
        this.visible = true;
        //this.getFilterGroups();
        this.getUnitGroupSets();
        this.ownernshipSelector = document.getElementById("ownershipSelector");
        this.typeSelector = document.getElementById("typeSelector");
        this.locationSelector = document.getElementById("locationSelector");
        this.searchBar = document.getElementById("livesearch");
        this.ownernshipSelector.addEventListener("click", this.testFilter);
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
                this.setOption("-- " + res[0].name + " --");
                this.option.value = "";
                this.ownernshipSelector.appendChild(this.option);
                this.setOption("-- " + res[1].name + " --");
                this.option.value = "";
                this.typeSelector.appendChild(this.option);
                this.setOption("-- " + res[2].name + " --");
                this.option.value = "";
                this.locationSelector.appendChild(this.option);
                for(var i = 0; i < res.length; i++) {
                    this.http.get(res[i].href)
                    .map(result => result.json())
                    .subscribe(
                        zone.bind(result => {
                            if(result.displayName == "Facility Ownership"){
                                for(var j = 0; j < result.organisationUnitGroups.length; j++) {
                                    this.setOption(result.organisationUnitGroups[j].name);
                                    this.ownernshipSelector.appendChild(this.option);
                                }
                            }
                            else if(result.displayName == "Facility Type"){
                                for(var j = 0; j < result.organisationUnitGroups.length; j++) {
                                    this.setOption(result.organisationUnitGroups[j].name);
                                    this.typeSelector.appendChild(this.option);
                                }
                            }
                            else if(result.displayName == "Location Rural/Urban"){
                                for(var j = 0; j < result.organisationUnitGroups.length; j++) {
                                    this.setOption(result.organisationUnitGroups[j].name);
                                    this.locationSelector.appendChild(this.option);
                                }
                            }
                    }));
                }
            })
        )
    }

    setOption(value){
        this.option = document.createElement("option");
        this.option.text = value;
        this.option.value = value;
    }


    setFilter(){
        console.log("Dette er setFilter");

        var text = livesearch.value;

        //livesearch.value = "";
        //console.log(this.searchBar.key);

        /*for(var i = 0; i < text.length; i++){
            livesearch.value += text.charAt(i);
        }*/
        //this.searchBar.createEvent('keyup');

        this.searchBar.focus(true);
    }

    testFilter(test){
        console.log("Testfilter ble aktivert!");
        console.log(test);
    }

}


