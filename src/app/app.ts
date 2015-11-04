import {bootstrap, Component, CORE_DIRECTIVES} from 'angular2/angular2';

@Component({
    selector: 'hello-world',
    directives: [CORE_DIRECTIVES],
    template: `
        <h1>Hello World</h1>
        <p>This is just a sample template yeah!</p>
        <p>{{getApiURI()}}</p>
    `
})


class App {

    getApiURI(){
        return dhisAPI;
    }

}

bootstrap(App);
