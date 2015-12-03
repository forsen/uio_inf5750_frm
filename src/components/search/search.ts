import {Component,EventEmitter, View, CORE_DIRECTIVES} from 'angular2/angular2';
import {Http} from 'angular2/http';
import {LiveSearch} from "./livesearch";
import {Sidebar} from "../sidebar/sidebar";

@Component({
    selector: 'mou-search',
    directives: [CORE_DIRECTIVES, LiveSearch, Sidebar],
    events: ['newsearch'],
    templateUrl: './components/search/search.html',
    styleUrls: ['./components/search/search.css']
})
export class Search {
    orgunits: Array<any> = [];
    loading: boolean = false;
    facilityType: Array<any> = [];
    facilityOwnership: Array<any> = [];
    facilityLocation: Array<any> = [];
    emptySearch: any;
    slide: any;

    constructor(public http:Http) {
        this.newsearch = new EventEmitter();
        this.visible = true;
        this.emptySearch = document.getElementById("divresult");

    }




    getMoreInfo(orgunit) {
        this.orgunits = [];
        console.log("yolo");
        this.newsearch.next(orgunit.id);
    }




    toggle() {
        this.visible = !this.visible;
    }


    hideDiv(){
        if(livesearch.value == "")
            return true;

    }


    emptyByClick(){
        return this.emptySearch = document.getElementById("divresult").style.visibility = "hidden";
    }



    /*getFilterTypes(){
        this.http.get(dhis + "/api/organisationUnitGroups/")
            .map(res => res.json())
            .map(res => res.organisationUnitGroups)
            .subscribe(
                zone.bind(res => {
                   for(var i = 0; i < res.length; i++){
                       this.http.get(res[i].href)
                        .map(result => result.json())
                        .map(result => result.organisationUnitGroupSet)
                        .subscribe(
                            zone.bind(result => {
                                if(result.name == "Location Rural/Urban"){
                                    this.facilityLocation.push(res[i].name);
                                }
                                else if(result.name == "Facility Type"){
                                    this.facilityType.push(res[i].name);
                                }
                                else if(result.name == "")
                            })
                        )
                   }

                })
            )
    }

    setFilterTypes(){

    }*/

    setFilter(){
        var text = livesearch.value;
        livesearch.value = "";
        console.log(text);
        for(var i = 0; i < text.length; i++){
            livesearch.value += text.charAt(i);
        }
    }

}


