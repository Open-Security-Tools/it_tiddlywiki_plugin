/*\
created: 20210723152326655
type: application/javascript
title: $:/plugins/opensecuritytools/twit/modules/twit.js
tags: 
modified: 20211101152923586
module-type: startup

A startup module to add IT model field processing during tiddler save

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "twit";
exports.platforms = ["browser"];
exports.after = ["startup"];
exports.synchronous = true;


function checkId(cf, nf, draftF) {
	var currentId = cf["twit_id"];

	// Detecting duplicates on the twit_id field is made more complicated when renaming because both the old tiddler object and 
	// draft of objects need to be discarded.
	var duplicateFilter = "[has[twit_class]twit_id[" + currentId + "]!title[" + draftF["draft.of"] + "]!title[" + draftF["title"] + "]]";
	var results = $tw.wiki.filterTiddlers(duplicateFilter);
	var duplicateId = results[0];

	// Autogenerate a reference id
	if ((currentId == undefined) || (currentId === "") || (duplicateId)) {

		if (duplicateId) {
			console.log("Duplicate id detected (duplicate=" + duplicateId + "), resetting id for '" + cf.title + ";");
		}

		var maxRefId = $tw.wiki.filterTiddlers("[has[twit_class]get[twit_id]maxall[]]");
		var candidate = maxRefId[0];

		// Minus infinity passed back as a string
		if (candidate === "-Infinity") {
			candidate = 1000;
		}
		else {
			// Force pass as number
			candidate = +candidate + 1;
		}
		nf["twit_id"] = candidate;
	}

	return nf;
}

exports.startup = function() {
	// Add hooks for trapping user actions
	$tw.hooks.addHook("th-saving-tiddler",function(tiddler, oldTiddler) {

		// Is this one of our classes?
		if (tiddler.fields.twit_class) {

			// We'll manage current and new fields as dictionaries.
			var cf = tiddler.fields;
			var nf = {}

			// Make sure the id is set and unique.
			nf = checkId(cf, nf, oldTiddler.fields);
			return new $tw.Tiddler(tiddler, nf);
		} else {
			return tiddler;
		}
	});
};

})();
