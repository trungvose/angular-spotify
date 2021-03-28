# Angular Spotify

A simple Spotify client built with Angular 11, Nx workspace, ngrx, TailwindCSS and ng-zorro.

## Working application

Check out the **live application** -> https://spotify.trungk18.com

### Technical Notes

- Upon opening Angular Spotify, It will redirect you to Spotify to get access to you data. Angular Spotify only use the data purely for displaying on the UI. We won't store your data anywhere else.
- Angular Spotify only keeps the access token in browser memory, without even storing it into browser local storage. If you do a hard refresh on the browser, It will ask for a new access token from Spotify. One access token is only valid for **one hour**.
- **Spotify premium** is required for the Web Playback SDK to work.

## Support

If you like my work, feel free to:

- ⭐ this repository. And we will be happy together :)
- [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)][tweet] about Angular Spotify
- <a title="Thanks for your support!" href="https://www.buymeacoffee.com/tuantrungvo" target="_blank"><img src="https://res.cloudinary.com/dvujyxh7e/image/upload/c_thumb,w_140,g_face/v1596378474/default-orange_uthxgz.jpg" alt="Buy Me A Coffee"></a>

Thanks a bunch for stopping by and supporting me!

[tweet]: https://twitter.com/intent/tweet?url=https://github.com/trungk18/angular-spotify&text=A%20cool%20Spotify%20client%20made%20with%20Angular%2011,%20Nx%20workspace,%20ngrx,%20TailwindCSS%20and%20ng-zorro&hashtags=angularspotify,angular,nx,ngrx,ngzorro,typescript

## Who is it for 🤷‍♀️

I still remember Window Media Player on windows has the visualization when you start to play the music and I wanted to have the same experience when listening to Spotify. That is reason I started this project.

I found that there weren't a lot of resources how to build a proper real-world scale application and that's my focus for sharing. I built a [Jira clone application][jira] as the first one for that purpose. [Nx workspace][nx] is getting more and more attention from the Angular community but people are always confused on how to architect and setup a project with Nx. I hope Angular Spotify will give you more insight on that.

---

You know I am one of the moderator of [Angular Vietnam][angularvn]. Recently, I also started [Angular Singapore][angularsg]. This piece of work is the beginning of my long term plan to bring Angular knowledge to more people. My desire is to advocate and grow the Angular developer community in Singapore and Vietnam :)

## Tech stack

![Tech logos][stack]

- [Angular 11][angular]
- [Nx Workspace][nx]
- [ngneat][] packages includes: `ngneat/svg-icon` and `ngneat/until-destroy`
- [ngrx][ngrx] and [ngrx/component-store][component-store]
- [ng-zorro][ng-zorro] UI component: `tooltip`, `modal`, `slider`, `switch` and more.
- [TailwindCSS][tailwind]
- [Netlify][netlify] for deployment

[angular]: https://angular.io/
[ngrx]: https://ngrx.io/
[component-store]: https://ngrx.io/guide/component-store
[tailwind]: https://tailwindcss.com/
[ng-zorro]: https://ng.ant.design/docs/introduce/en
[netlify]: http://netlify.com/
[ngneat]: https://github.com/ngneat

## High level design

See my original notes on [Nx workspace structure for NestJS and Angular][gist]

### Principles

All components are following:

- OnPush Change Detection and async pipes: all components are using observable and async pipe for rendering data, no single subscribe are using for manually subscribing for rendering. Only some places are calling subscribe for dispatching action, which I will have a refactor live stream session with my friend [nartc][nartc] to use component store for fully subscribe-less application.
- SCAMs (single component Angular modules) for tree-shakable components, meaning each component will have a respective module. For example, a RegisterComponent will have a corresponding RegisterModule, we won't declare RegisterComponent as part of AuthModule for example.
- Mostly everything will stay in the `libs` folder. New modules, new models, new configurations, new components etc... are in libs. libs should be separated into different directories based on existing apps. We won't put them inside the apps folder. For example in an Angular, it contains the main.ts, `app.component.ts` and `app.module.ts`

### Structure

## Features and Roadmap

I set the tentative deadline for motivating myself to finish the work on time. Otherwise, It will take forever to complete :)

### 1.0 - Simple Spotify client

> March 01 - 28, 2021

- [x] Proven, scalable, and easy to understand structure with Nx workspace
- [x] Play music using Spotify SDK
- [x] Load maximum 50 save playlists and maximum 100 songs per playlist.
- [x] Cool visualization

## Live stream

## Time spending

It is a side project that I only spent time outside of the office hours to work on. I initially planned to complete the project within two weeks but the first two weekends were not very productive, maybe because of the holiday mood from Lunar New Year :) But once the lego blocks are getting together, I feel the rhythm and I know it has to be finished by the end of March.

I couldn't get the full time report from waka time because it only show me the latest two weeks 🤣 But approximately, I have spent about 50 hours working on this project. Which is equivalent to watch the [whole Stranger Things series twice][stranger].

I really enjoyed working on this project. The visualization was the most exciting one and I decided to start this project because of that single component.

![Angular Spotify - Time spending][time]

### Accessibility ♿

Not all components have properly defined [aria attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA), visual focus indicators, etc.

## Setting up development environment 🛠

- `git clone https://github.com/trungk18/angular-spotify.git`
- `cd angular-spotify`
- `npm start` for starting Angular web application
- The app should run on `http://localhost:4200/`

### Unit/Integration tests 🧪

I skipped writing test for this project.

## Compatibility

Web Playback SDK provided supports for Chrome, Firefox, Edge, IE 11 or above running on Mac/Windows/Linux.

It **doesn't support** Safari or any mobile browser on **Android** or **iOS**

View [completed list of supported browsers](https://developer.spotify.com/documentation/web-playback-sdk/#supported-browsers)

## Author: Trung Vo ✍️

- A seasoned front-end engineer with 7 years of passion in creating experience-driven products. I am proficient in Angular, React and TypeScript development.
- Personal blog: https://trungk18.com/
- Say hello: trungk18 [et] gmail [dot] com

## Contributing

If you have any ideas, just [open an issue][issues] and tell me what you think.

If you'd like to contribute, please fork the repository and make changes as you'd like. [Pull requests][pull] are warmly welcome.

## Credits

## License

Feel free to use my code on your project. It would be great if you put a reference to this repository.

[MIT](https://opensource.org/licenses/MIT)

[issues]: https://github.com/trungk18/angular-spotify/issues/new
[pull]: https://github.com/trungk18/angular-spotify/compare
[jira]: https://jira.trungk18.com/
[nx]: https://nx.dev/
[angularsg]: https://twitter.com/angularsg
[angularvn]: https://twitter.com/ngvnofficial
[nartc]: https://github.com/nartc
[gist]: https://gist.github.com/trungk18/7ef8766cafc05bc8fd87be22de6c5b12
[stack]: /apps/angular-spotify/src/assets/readme/angular-spotify-tech-stack.png
[time]: /apps/angular-spotify/src/assets/readme/time-spending.png
