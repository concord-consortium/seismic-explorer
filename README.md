# Seismic Eruptions

Latest **stable** version:

http://models-resources.concord.org/seismic-eruptions/index.html

Latest **development** version:

http://models-resources.concord.org/seismic-eruptions/branch/master/index.html

Old versions can be accessed via `/version/<tag>` path, e.g.:

http://models-resources.concord.org/seismic-eruptions/version/0.1.0/index.html

## Development

First, you need to make sure that webpack is installed and all the NPM packages required by this project are available:

```
npm install -g webpack
npm install
```
Then you can build the project files using:
```
webpack
```
or start webpack dev server:
```
npm install -g webpack-dev-server 
webpack-dev-server
```
and open http://localhost:8080/ or http://localhost:8080/webpack-dev-server/ (auto-reload after each code change).

### Frameworks, conventions

This app is built using [React](https://facebook.github.io/react/), [Redux](http://redux.js.org/) and [ImmutableJS](https://facebook.github.io/immutable-js/). If you are not familiar with one of these, take a look at [this great tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html). It also uses lots of ES6 syntax, so it might be good to review it first. Semicolons are discussable, but I've decided to follow Redux examples style.

Some things that may be confusing when you start working with Redux (or at least they had been confusing for me):

* Should I create component or container? [A good article](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.5h6qk3ac0) and the most important part:

> When you notice that some components don’t use the props they receive but merely forward them down and you have to rewire all those intermediate components any time the children need more data, it’s a good time to introduce some container components. This way you can get the data and the behavior props to the leaf components without burdening the unrelated components in the middle of the tree.

* Is it okay to still use React's state? I think so, and so does [Redux's author](https://github.com/reactjs/redux/issues/1287). 

Additional, useful resources:
* [Redux examples](https://github.com/reactjs/redux/tree/master/examples)
* [normalizr](https://github.com/gaearon/normalizr) transforms JSON data from Portal (flattens structure and groups objects by IDs)

### CSS styles

* Browser specific prefixes are not necessary, as this project uses [autoprefixer](https://github.com/postcss/autoprefixer), which will add them automatically.
* Webpack parses URLs in CSS too, so it will either copy resources automatically to `/dist` or inline them in CSS file. That applies to images and fonts (take a look at webpack config).
* All the styles are included by related components in JS files. Please make sure that those styles are scoped to the top-level component class, so we don't pollute the whole page. It's not very important right now, but might become important if this page becomes part of the larger UI. And I believe it's a good practice anyway. 
* I would try to make sure that each component specifies all its necessary styles to look reasonably good and it doesn't depend on styles defined somewhere else (e.g. in parent components). Parent components or global styles could be used to theme components, but they should work just fine without them too.

## License 

[MIT](https://github.com/concord-consortium/seismic-eruptions2/blob/master/LICENSE)
