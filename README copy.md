# Information Technology Management Plugin

Mongoose Security IT plugin for TiddlyWiki.

Plugin management through _[ThirdFlow](https://github.com/TheDiveO/ThirdFlow)_ plugin and this base git repository (https://github.com/TheDiveO/TiddlyWikiPluginSkeleton.git).

# Setup in a new dev environment

* Run `npm install` to install the required TiddlyWiki5 core, as well as the _ThirdFlow_ plugin from the NPM registry.
* Run `$ npm run develop`.
* Navigate to http://localhost:8080 in your web browser.

# Release

* To control which files to release, visit your TiddlyWiki's `$:/ControlPanel`
       and go to the `ThirdFlow` tab. Then click on the subtab named `Release`.
       Follow the instructions given there. Please note that you can develop
       multiple plugins simultaneously from the same development TiddlyWiki.
* When you're ready to release, simply run `$ npm run release` to create the
       release file(s) in `editions/release/output`. Rinse, then repeat as
       necessary.
* In the default setup, the release files inside `editions/release/output`
   won't be under `git` source code control. The rationale is to keep generated
   files out of the manged sources. However, if you want to **keep them
   instead** under `git` control, simply remove the file `.gitignore` in
   `editions/release/`.
