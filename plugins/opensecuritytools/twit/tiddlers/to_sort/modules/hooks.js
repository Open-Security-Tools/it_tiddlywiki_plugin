/*\
created: 20220722215603976
title: $:/plugins/opensecuritytools/twit/modules/hooks.js
type: application/javascript
tags: 
modified: 20220723070445305
module-type: filteroperator
\*/

(function(){
"use strict";

var twit_utils = require("$:/plugins/opensecuritytools/twit/modules/twit_utils.js");


const Hooks = Object.freeze({
    HAS_ANNOTATIONS: "hook_has_annotations",
    HAS_IP_ADDRESS: "hook_has_ip_addresses",
    HAS_VLAN: "hook_has_vlan",
    HAS_MAC: "hook_has_mac",
    HAS_NETWORK_PARENT: "hook_has_network_parent",
    MISSING_NETWORK_PARENT: "hook_missing_network_parent",
    HAS_HOSTS: "hook_has_hosts",
    HAS_NETWORK: "hook_has_network",
    DOES_NOT_HAVE_NETWORK_PARENT: "hook_does_not_have_network_parent",
    ISSUE_MODIFIED_TODAY: "hook_issue_modified_today",
    ISSUE_IS_FLAGGED: "hook_issue_is_flagged",
    ISSUE_IS_NOT_FLAGGED: "hook_issue_is_not_flagged",
    ISSUE_HAS_HIT_COUNT: "hook_issue_has_hit_count",
    ISSUE_MISSING_IMPACT: "hook_issue_missing_impact",
    ISSUE_HAS_IMPACT: "hook_issue_has_impact",
    ISSUE_HAS_BEEN_REOPENED: "hook_issue_has_been_reopened",
    IS_ISSUE: "hook_is_issue",
    ISSUE_CAN_BE_HIT: "hook_issue_can_be_hit",
    ISSUE_HAS_EFFORT_HOURS: "hook_issue_has_effort_hours",
    ISSUE_RELATES_TO_HW: "hook_issue_relates_to_hw",
    ISSUE_DOES_NOT_RELATE_TO_HW: "hook_issue_does_not_relate_to_hw",
    ISSUE_RELATES_TO_COMPLIANCE: "hook_issue_relates_to_compliance",
    ISSUE_DOES_NOT_RELATE_TO_COMPLIANCE: "hook_issue_does_not_relate_to_compliance",
    ISSUE_IS_CLOSED: "hook_issue_is_closed",
    ISSUE_MISSING_RESOLUTION: "hook_issue_missing_resolution",
    ISSUE_HAS_RESOLUTION: "hook_issue_has_resolution",
    ISSUE_MISSING_EFFORT_HOURS: "hook_issue_missing_effort_hours",
    ISSUE_IS_OPEN: "hook_issue_is_open",
    ISSUE_MISSING_PROXIMITY: "hook_issue_missing_proximity",
    ISSUE_HAS_PROXIMITY: "hook_issue_has_proximity",
    ISSUE_HAS_PRIORITY: "hook_issue_has_priority",
    ISSUE_HAS_TEXT: "hook_issue_has_text",
});


function get_network_hooks(tiddler, title, options) {
    if ((tiddler === undefined) || (tiddler.fields === undefined) || (tiddler.fields.twit_class !== "network")) {
        return [];
    }

    var result= [];

    if (tiddler.fields.annotations) {
        result.push(Hooks.HAS_ANNOTATIONS);
    }
    if (tiddler.fields.ip_addresses) {
        result.push(Hooks.HAS_IP_ADDRESS);
    }
    if (tiddler.fields.vlan) {
        result.push(Hooks.HAS_VLAN);
    }

    return result;
}

function get_ip_address_hooks(tiddler, title, options) {
    if ((tiddler === undefined) || (tiddler.fields === undefined) || (tiddler.fields.twit_class !== "ip_address")) {
        return [];
    }

    var result= [];

    if (tiddler.fields.annotations) {
        result.push(Hooks.HAS_ANNOTATIONS);
    }
    if (tiddler.fields.mac) {
        result.push(Hooks.HAS_MAC);
        if ($tw.wiki.filterTiddlers("[title[" + tiddler.fields.mac + "]listed[nics]first[]then[True]else[False]]")[0] === "True") {
            result.push(Hooks.HAS_NETWORK_PARENT);
        } else {
            result.push(Hooks.MISSING_NETWORK_PARENT);
        }
    } else {
        // Note - we cannot use the 'filter' operator. So, we just expand inline.
        if ($tw.wiki.filterTiddlers("[title[" + title + "]listed[ip_addresses]get[twit_class]addprefix[$:/plugins/opensecuritytools/twit/defs/twit_class/]can_connect[yes]first[]then[True]else[False]]")[0] === "True") {
            result.push(Hooks.HAS_NETWORK_PARENT);
        } else {
            result.push(Hooks.MISSING_NETWORK_PARENT);
        }
    }
    if (tiddler.fields.hosts) {
        result.push(Hooks.HAS_HOSTS);
    }
    if (tiddler.fields.network) {
        result.push(Hooks.HAS_NETWORK);
    }

    return result;
}

function get_dns_lookup_hooks(tiddler, title, options) {
    if ((tiddler === undefined) || (tiddler.fields === undefined) || (tiddler.fields.twit_class !== "dns_lookup")) {
        return [];
    }

    var result= [];

    if (tiddler.fields.annotations) {
        result.push(Hooks.HAS_ANNOTATIONS);
    }

    return result;
}

function get_nic_hooks(tiddler, title, options) {
    if ((tiddler === undefined) || (tiddler.fields === undefined) || (tiddler.fields.twit_class !== "nic")) {
        return [];
    }

    var result= [];

    if (tiddler.fields.annotations) {
        result.push(Hooks.HAS_ANNOTATIONS);
    }
    if (tiddler.fields.ip_addresses) {
        result.push(Hooks.HAS_IP_ADDRESS);
    }

    if ($tw.wiki.filterTiddlers("[title[" + title + "]listed[nics]first[]then[True]else[False]]")[0] === "True") {
        result.push(Hooks.HAS_NETWORK_PARENT);
    } else {
        result.push(Hooks.DOES_NOT_HAVE_NETWORK_PARENT);
    }

    return result;
}



function get_issue_hooks(tiddler, title, options) {
    if ((tiddler === undefined) || (tiddler.fields === undefined) || (tiddler.fields.twit_class !== "issue")) {
        return [];
    }

    var result= [];

    if (tiddler.fields.text) {
        result.push(Hooks.ISSUE_HAS_TEXT);
    }

    if ($tw.wiki.filterTiddlers("[title[" + title + "]days[0]then[True]else[False]]")[0] === "True") {
        result.push(Hooks.ISSUE_MODIFIED_TODAY);
    }

    if (tiddler.fields.is_flagged === "yes") {
        result.push(Hooks.ISSUE_IS_FLAGGED);
    } else {
        result.push(Hooks.ISSUE_IS_NOT_FLAGGED);
    }

    if (tiddler.fields.repeated_hit_count) {
        result.push(Hooks.ISSUE_HAS_HIT_COUNT);
    }

    if (!tiddler.fields.impact) {
        result.push(Hooks.ISSUE_MISSING_IMPACT);
    } else {
        result.push(Hooks.ISSUE_HAS_IMPACT);
    }

    if (tiddler.fields.reopened_count && parseInt(tiddler.fields.reopened_count) > 0) {
        result.push(Hooks.ISSUE_HAS_BEEN_REOPENED);
    }
    result.push(Hooks.IS_ISSUE);
    result.push(Hooks.ISSUE_CAN_BE_HIT);
    if (tiddler.fields.effort_hours) {
        result.push(Hooks.ISSUE_HAS_EFFORT_HOURS);
    }
    if (tiddler.fields.relates_to_hw === "yes") {
        result.push(Hooks.ISSUE_RELATES_TO_HW);
    } else {
        result.push(Hooks.ISSUE_DOES_NOT_RELATE_TO_HW);
    }
    if (tiddler.fields.relates_to_compliance === "yes") {
        result.push(Hooks.ISSUE_RELATES_TO_COMPLIANCE);
    } else {
        result.push(Hooks.ISSUE_DOES_NOT_RELATE_TO_COMPLIANCE);
    }
    if (tiddler.fields.closed) {
        result.push(Hooks.ISSUE_IS_CLOSED);
        if (!tiddler.fields.resolution) {
            result.push(Hooks.ISSUE_MISSING_RESOLUTION);
        } else {
            result.push(Hooks.ISSUE_HAS_RESOLUTION);
        }
        if (!tiddler.fields.effort_hours) {
            result.push(Hooks.ISSUE_MISSING_EFFORT_HOURS);
        }
        if (!tiddler.fields.proximity) {
            result.push(Hooks.ISSUE_MISSING_PROXIMITY);
        } else {
            result.push(Hooks.ISSUE_HAS_PROXIMITY);
        }

        if (tiddler.fields.proximity && tiddler.fields.impact) {
            result.push(Hooks.ISSUE_HAS_PRIORITY);
        }
    } else {
        result.push(Hooks.ISSUE_IS_OPEN);
        if (!tiddler.fields.proximity) {
            result.push(Hooks.ISSUE_MISSING_PROXIMITY);
        } else {
            result.push(Hooks.ISSUE_HAS_PROXIMITY);
        }

        if (tiddler.fields.proximity && tiddler.fields.impact) {
            result.push(Hooks.ISSUE_HAS_PRIORITY);
        }

    }

    return result;
}

var twit_class_contexts = {
    "issue": get_issue_hooks,
    "network": get_network_hooks,
    "ip_address": get_ip_address_hooks,
    "dns_lookup": get_dns_lookup_hooks,
    "nic": get_nic_hooks
}

exports.hook_names = function (source, operator, options) {
    var result = [];
    for (const [_, value] of Object.entries(Hooks)) {
        result.push(value);
    }
    return result;
}

exports.twit_hooks = function (source, operator, options) {
    var result = [];

    source(function(tiddler, title) {
        if ((tiddler) && (tiddler.fields) && (tiddler.fields.twit_class)) {
            var contextF = twit_class_contexts[tiddler.fields.twit_class];
            if (contextF) {
                result.push(...contextF(tiddler, title, options));
            }
        }
    });
    return result;
}

})();
