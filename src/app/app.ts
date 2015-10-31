import {bootstrap, Component} from 'angular2/angular2';

@Component({
    selector: 'hello-world',
    template: `
        <h1>Hello World</h1>
        <p>This is just a sample template yeah!</p>
    `
})
class Hello {}

bootstrap(Hello);

