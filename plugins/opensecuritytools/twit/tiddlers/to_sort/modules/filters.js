/*\
created: 20230316224116489
title: $:/plugins/opensecuritytools/twit/modules/filters.js
type: application/javascript
tags: 
modified: 20230316224305366
module-type: filteroperator
\*/

(function(){

"use strict";


function get_human_date(event_date) {
    var now = new Date().setHours(0,0,0,0);
    var eventDate = new Date($tw.utils.parseDate(event_date)).setHours(0,0,0,0);
    var difference = eventDate - now;
    var totalDays = Math.ceil(difference / (1000 * 3600 * 24));
    if (totalDays == 0) {
        return "Today";
    } else if (totalDays == 1) {
        return "Tomorrow";
    } else if (totalDays == -1) {
        return "Yesterday";
    }
}

function get_issue_display_date(tiddler, title) {
    if ((tiddler === undefined) || (tiddler.fields === undefined) || (tiddler.fields.twit_class === undefined) || !((tiddler.fields.twit_class === "challenge"))) {
        return [];
    }

    var result = [];

    if (tiddler.fields.created) {
        var humanDate = get_human_date(tiddler.fields.created);
        if (humanDate) {
            result.push(humanDate);
        } else {
            var value = $tw.utils.parseDate(tiddler.fields.created);
            if(value && $tw.utils.isDate(value) && value.toString() !== "Invalid Date") {
                result.push($tw.utils.formatDateString(value, "YYYY-0MM-0DD"));
            }
        }
    }

    return result;
}

exports.twit_issue_display_date = function(source, operator, options) {
    var result = [];

    source(function(tiddler, title) {
        result.push(...get_issue_display_date(tiddler, title));
    });
    return result;
}



})();
