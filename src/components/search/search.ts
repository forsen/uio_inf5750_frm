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
    facilityType: Array<any> = [];
    facilityOwnership: Array<any> = [];
    facilityLocation: Array<any> = [];
    groups: Array<any> = [];
    groupSet: Array<any> = [];
    counter: number = 0;

    constructor(public http:Http) {
        this.newsearch = new EventEmitter();
        this.visible = true;
        //this.getFilterGroups();
        this.getUnitGroupSets();

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
                this.facilityOwnership .push("-- " + res[0].name + " --");
                this.facilityType.push("-- " + res[1].name + " --");
                this.facilityLocation.push("-- " + res[2].name + " --");

                for(var i = 0; i < res.length; i++) {
                    this.http.get(res[i].href)
                    .map(result => result.json())
                    .map(result => result.organisationUnitGroups)
                    .subscribe(
                        zone.bind(result => {
                            if(this.facilityOwnership.length == 1){
                                for(var j = 0; j < result.length; j++) {
                                    this.facilityOwnership.push(result[j].name);
                                }
                            }
                            else if(this.facilityType.length == 1){
                                for(var j = 0; j < result.length; j++) {
                                    this.facilityType.push(result[j].name);
                                }
                            }
                            else if(this.facilityLocation.length == 1){
                                for(var j = 0; j < result.length; j++) {
                                    this.facilityLocation.push(result[j].name);
                                }
                            }
                    }));
                }
            })
        )
    }


    setFilter(){
        var text = livesearch.value;
        livesearch.value = "";
        console.log(text);
        for(var i = 0; i < text.length; i++){
            livesearch.value += text.charAt(i);
        }
    }

}


