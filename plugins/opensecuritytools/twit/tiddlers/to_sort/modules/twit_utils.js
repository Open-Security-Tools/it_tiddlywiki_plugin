/*\
created: 20220722215603976
title: $:/plugins/opensecuritytools/twit/modules/twit_utils.js
type: application/javascript
tags: 
modified: 20220723070445305
module-type: library
\*/

(function(){
"use strict";

var TWIT_CLASS_PREFIX = "$:/plugins/opensecuritytools/twit/defs/twit_class/";
var PATCH_STRATEGY_PREFIX = "$:/plugins/opensecuritytools/twit/defs/patching_strategy/";

function construct_twit_class_field_value_filter(title, field, value) {
    return "[title[" + title + "]get[twit_class]addprefix[" + TWIT_CLASS_PREFIX + "]" + field + "[" + value + "]then[True]else[False]]";
}

function days_since(value) {
    var today = (new Date()).setHours(0, 0, 0, 0);
    var reviewed = (new Date(($tw.utils.parseDate(value)))).setHours(0, 0, 0, 0);
    return Math.round((today - reviewed) / (1000*60*60*24));
}

function tw_filter_to_bool(filter) {
    // console.log(filter);
    return $tw.wiki.filterTiddlers(filter)[0] === "True";
}

function entity_class_has_field_value(title, field, value) {
    return tw_filter_to_bool(construct_twit_class_field_value_filter(title, field, value));
}

function entity_class_is_entity_compliant(title) {
    return tw_filter_to_bool(
        "[title[" + title + "]has[twit_class]get[asset_owner]compliance_tracking[yes]then[True]else[False]]"
    )
}

function patching_strategy_checks_version(title) {
    return tw_filter_to_bool("[title[" + title + "]addprefix[" + PATCH_STRATEGY_PREFIX + "]check_version[yes]then[True]else[False]]");
}

function operating_system_patching_strategy_checks_version(title) {
    return tw_filter_to_bool("[title[" + title + "]twit_class[operating_system]get[patching_strategy]addprefix[" + PATCH_STRATEGY_PREFIX + "]check_version[yes]then[True]else[False]]");
}

function entity_class_has_operating_system(title) {
    return entity_class_has_field_value(title, "has_operating_system", "yes");
}

function entity_class_can_host(title) {
    return entity_class_has_field_value(title, "can_host", "yes");
}

function entity_class_is_hosted(title) {
    return entity_class_has_field_value(title, "is_hosted", "yes");
}

function entity_class_is_physical(title) {
    return entity_class_has_field_value(title, "type", "physical");
}

function entity_class_get_hosts_children(title) {
    var result = [];

    var to_process = [title, ];

    while (to_process.length > 0) {
        var t = to_process.pop();

        // Can it host?
        if (entity_class_can_host(t)) {

            var hosts = $tw.wiki.filterTiddlers("[list[" + t + "!!hosts]]");

            // Avoid recursion...
            hosts = hosts.filter(function(el) {
                return result.indexOf( el ) < 0;
            });

            if (hosts.length > 0) {
                result.push(...hosts);
                to_process.push(...hosts);
            }
        }
    }
    return result;
}

function entity_class_get_hosts_parents_inclusive(title) {
    var result = [];
    var to_process = [title, ];

    while (to_process.length > 0) {
        var t = to_process.pop();

        result.push(t);
        
        // Can it host?
        if (entity_class_is_hosted(t)) {

            var hosts = $tw.wiki.filterTiddlers("[title[" + t + "]listed[hosts]]");

            // Avoid recursion...
            hosts = hosts.filter( function( el ) {
                return result.indexOf( el ) < 0;
                } );
            if (hosts.length > 0) {
                to_process.push(...hosts);
            }
        }
    }
    return result;
}

function parents_inclusive_any_entity_class_is_compliant(title) {
    var hosts = entity_class_get_hosts_parents_inclusive(title);
    var hostLength = hosts.length;
    var is_compliant = false;
    for (var i = 0; i < hostLength; i++) {
        var host = hosts[i];
        if (entity_class_is_entity_compliant(host)) {
            is_compliant = true;
            break;
        }
    }
    // console.log("parents_inclusive_any_entity_class_is_compliant(" + title + ") = " + is_compliant);
    return is_compliant;
}

function operating_system_instances_are_hosted_on_compliant_hardware(operating_system) {
    var instances = $tw.wiki.filterTiddlers("[field:operating_system[" + operating_system + "]has[twit_class]!not_in_operation[yes]]");
    var instance_count = instances.length;
    var is_compliant = false;
    for (var i = 0; i < instance_count; i++) {
        if (parents_inclusive_any_entity_class_is_compliant(instances[i])) {
            // console.log("->operating_system_instances_are_hosted_on_compliant_hardware: positive for " + instances[i])
            is_compliant = true;
            break;
        }
    }
    // console.log("operating_system_instances_are_hosted_on_compliant_hardware(" + operating_system + ") = " + is_compliant);
    return is_compliant;
}

// Exports
exports.twit_entity_class_get_hosts_parents_inclusive = entity_class_get_hosts_parents_inclusive;
exports.twit_entity_class_get_hosts_children = entity_class_get_hosts_children;
exports.twit_entity_class_is_entity_compliant = entity_class_is_entity_compliant;
exports.twit_entity_class_has_operating_system = entity_class_has_operating_system;
exports.twit_entity_class_can_host = entity_class_can_host;
exports.twit_entity_class_is_hosted = entity_class_is_hosted;
exports.twit_entity_class_is_physical = entity_class_is_physical;
exports.twit_parents_inclusive_any_entity_class_is_compliant = parents_inclusive_any_entity_class_is_compliant;
exports.twit_operating_system_instances_are_hosted_on_compliant_hardware = operating_system_instances_are_hosted_on_compliant_hardware;
exports.twit_patching_strategy_checks_version = patching_strategy_checks_version
exports.twit_operating_system_patching_strategy_checks_version = operating_system_patching_strategy_checks_version
exports.twit_days_since = days_since

})();
