/*\
created: 20220722215603976
title: $:/plugins/opensecuritytools/twit/modules/twit_hosted_parents_inclusive.js
type: application/javascript
tags: 
modified: 20220723070445305
module-type: filteroperator
\*/

(function(){
"use strict";
    
exports.twit_hosted_parents_inclusive = function(source, operator, options) {
    var result = [];
    var twit_utils = require("$:/plugins/opensecuritytools/twit/modules/twit_utils.js");
    source(function(tiddler, title) {
        result.push(...twit_utils.twit_entity_class_get_hosts_parents_inclusive(title));
    });
    // Remove any duplicates
    return result.filter((v, i, a) => a.indexOf(v) === i);
}
})();
