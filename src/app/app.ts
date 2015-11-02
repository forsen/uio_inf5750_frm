import {bootstrap, Component, CORE_DIRECTIVES} from 'angular2/angular2';
import {Http, HTTP_PROVIDERS} from 'angular2/http';

@Component({
    selector: 'hello-world',
    directives: [CORE_DIRECTIVES],
    providers: [HTTP_PROVIDERS],
    template: `
        <h1>Hello World</h1>
        <p>This is just a sample template yeah!</p>
        <div *ng-if="name">Name from DHIS: {{name}}</div>
        <p>{{getName()}}</p>
    `
})
class Hello {
    http: Http;
    constructor(http: Http){
        this.http = http;
    }

    getName(){
        return dhisAPI;
    }
/*
    getAPI(){
     return this.http.get('../manifest.webapp')
         .map(res => res.json())
         .subscribe(
             data => console.log(data)
         );

    }
*/

    public name: string;
}

bootstrap(Hello);
