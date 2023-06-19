/*\
created: 20220722215603976
title: $:/plugins/opensecuritytools/twit/modules/twit_actions.js
type: application/javascript
tags: 
modified: 20220723070445305
module-type: filteroperator
\*/

(function(){
"use strict";

var twit_utils = require("$:/plugins/opensecuritytools/twit/modules/twit_utils.js");

function _internal_get_operating_systems_for_os(tiddler, title, include_discretionary) {
    var result = [];
    if (!tiddler.fields.patching_strategy) {
        result.push("os_set_patching_strategy");
    }
    if (tiddler.fields.is_supported != "yes") {
        result.push("os_set_supported");
    }
    if (tiddler.fields.patching_strategy) {
        if (twit_utils.twit_patching_strategy_checks_version(tiddler.fields.patching_strategy)) {
            if (!tiddler.fields.target_version) {
                result.push("os_set_target_version");
            }
        }
        if (tiddler.fields.checked_date) {
            var check_days = parseInt($tw.wiki.filterTiddlers("[title[$:/plugins/opensecuritytools/twit/defs/patching_strategy/" + tiddler.fields.patching_strategy + "]get[check_days]]")[0]);
            if (check_days) {
                var daysSince = twit_utils.twit_days_since(tiddler.fields.checked_date);
                if (daysSince > check_days) {
                    result.push("os_set_checked");
                } else if (daysSince > Math.max(0, (check_days - 7))) {
                    result.push("os_nearly_set_checked");
                }
            }
        }
    }
    // Only offer to set checked if no other actions have been reported
    if (result.length == 0) {
        if (!tiddler.fields.checked_date) {
            result.push("os_set_checked")
        }
    }

    if (include_discretionary) {
        if (tiddler.fields.is_supported == "yes") {
            result.push("os_clear_supported");
        }
    
        if (tiddler.fields.checked_date) {
            if (!result.includes("os_set_checked")) {
                result.push("os_clear_checked")
                result.push("os_reset_checked")
            }
        }
    }
    return result;
}

function get_operating_system_actions_for_os(tiddler, title) {
    // Context - We know we are an operating system.
    var result = [];
    if (twit_utils.twit_operating_system_instances_are_hosted_on_compliant_hardware(title)) {
        result.push(..._internal_get_operating_systems_for_os(tiddler, title, true));
    }
    return result;
}

function get_operating_system_actions_for_os_instance(tiddler, title, options) {
    // Context - We know we should have an operating system
    var result = [];

    // If this operating system system is not in operation then only provide an action to put 
    // it back in operation.
    if (tiddler.fields.not_in_operation === "yes") {
        result.push("os_instance_put_in_operation");

        return result;
    }

    result.push("os_instance_take_out_of_operation");

    if (!tiddler.fields.operating_system) {
        result.push("os_instance_set_operating_system");

        // There isn't any point checking anything else...
        return result;
    }

    // We do a lot if this is hosted on something physical which needs to be compliant.
    var is_compliance = twit_utils.twit_parents_inclusive_any_entity_class_is_compliant(title);
    if (!is_compliance) {
        return result;
    }

    var os_needs_attention = false;

    if (tiddler.fields.operating_system) {
        var os_actions = _internal_get_operating_systems_for_os(options.wiki.getTiddler(tiddler.fields.operating_system), tiddler.fields.operating_system, false);
        // Add os_instance_ prefix to all of these...
        os_actions.forEach(function (item, index, arr) {
            result.push("os_instance_" + item);
            os_needs_attention = true;
        });
    }

    if (os_needs_attention) {
        return result;
    }

    var hasProblem = false;

    if (tiddler.fields.operating_system) {

        if (twit_utils.twit_operating_system_patching_strategy_checks_version(tiddler.fields.operating_system)) {

            var target_version = $tw.wiki.filterTiddlers("[title[" + tiddler.fields.operating_system + "]get[target_version]]");
            if (target_version) {
                target_version = target_version[0];
                if (target_version != tiddler.fields.installed_os_version) {
                    if (tiddler.fields.installed_os_version) {
                        result.push("os_instance_upgrade");
                        hasProblem = true;
                    } else {
                        result.push("os_instance_set_installed_os_version");
                        hasProblem = true;
                    }
                }
            }
        }

        // We can safely parse int (error conditions evaluate to false)
        var check_days = parseInt($tw.wiki.filterTiddlers("[title[" + tiddler.fields.operating_system + "]get[patching_strategy]addprefix[$:/plugins/opensecuritytools/twit/defs/patching_strategy/]get[check_days]]")[0]);
        if (check_days && tiddler.fields.checked_date) {
            var daysSince = twit_utils.twit_days_since(tiddler.fields.checked_date);
            if (daysSince > check_days) {
                result.push("os_instance_set_checked");
                hasProblem = true;
            } else if (daysSince > Math.max(0, (check_days - 7))) {
                result.push("os_instance_nearly_set_checked");
            }
        }
    }

    // Only offer to set the checked date if no other actions are reported
    if (!hasProblem) {
        if (!tiddler.fields.checked_date) {
            result.push("os_instance_set_checked")
        }
    }

    if (tiddler.fields.checked_date && !result.includes("os_instance_set_checked")) {
        result.push("os_instance_clear_checked")
        result.push("os_instance_reset_checked")
    }

    return result;
}

function get_operating_system_actions(tiddler, title, options) {
    var result = [];
    if (tiddler && tiddler.fields) {
        if (tiddler.fields.twit_class === "operating_system") {
            result.push(...get_operating_system_actions_for_os(tiddler, title));
        }
        if (twit_utils.twit_entity_class_has_operating_system(title)) {
            result.push(...get_operating_system_actions_for_os_instance(tiddler, title, options));
        }
    }
    return result;
}

function get_asset_actions(tiddler, title, options) {
    var result = [];
    if (!twit_utils.twit_entity_class_is_physical(title)) {
        return result;
    }
    if (!tiddler.fields.asset_model) {
        result.push("asset_set_asset_model");
    }
    if (!tiddler.fields.asset_owner) {
        result.push("asset_set_asset_owner");
    }
    if (!tiddler.fields.location) {
        result.push("asset_set_location");
    }
    if (!tiddler.fields.asset_owner) {
        return result;
    }
    if (!twit_utils.twit_entity_class_is_entity_compliant(title)) {
        return result;
    }

    if (tiddler.fields.labelled != "yes") {
        result.push("asset_set_labelled");
    } else {
        result.push("asset_clear_labelled");
    }
    return result;
}

function get_asset_model_actions(tiddler, title, options) {
    var result = [];
    if (tiddler && tiddler.fields) {

        if (tiddler.fields.twit_class !== "asset_model") {
            return result;
        }

        if (!tiddler.fields.manufacturer) {
            result.push("asset_model_set_manufacturer");
        }
        if (!tiddler.fields.model_number) {
            result.push("asset_model_set_model_number");
        }
        if (tiddler.fields.manufacturer && tiddler.fields.model_number) {
            var expectTitle = "Asset Model: " + tiddler.fields.manufacturer + " - " + tiddler.fields.model_number;
            if (title !== expectTitle) {
                result.push("asset_model_rename");
            }
        }
    }
    return result;
}

function get_owner_actions(tiddler, title, options) {
    var result = [];
    if (tiddler && tiddler.fields) {
        if (tiddler.fields.twit_class !== "owner") {
            return result;
        }
    
        if (tiddler.fields.compliance_tracking === "yes") {
            result.push("owner_disable_compliance_tracking");
        } else {
            result.push("owner_enable_compliance_tracking");
        }
    }
    return result;
}

const   ERROR_LEVEL_NONE = 0, 
        ERROR_LEVEL_WARNING = 1,
        ERROR_LEVEL_ERROR = 2;

function _get_max_error_for_compliance_field(tiddler, complianceField) {
    if (!tiddler.fields[complianceField]) {
        return ERROR_LEVEL_NONE;
    }

    var maxErrorLevel = ERROR_LEVEL_NONE,
        complianceBase = complianceField + "_",
        periodField = complianceBase + "period",
        assessmentField = complianceBase + "assessment",
        reviewedField = complianceBase + "reviewed";


    if (!tiddler.fields[periodField]) {
        maxErrorLevel = Math.max(maxErrorLevel, ERROR_LEVEL_ERROR);
    }
    if ((!tiddler.fields[assessmentField]) || (!tiddler.fields[reviewedField])) {
        maxErrorLevel = Math.max(maxErrorLevel, ERROR_LEVEL_ERROR);
    }

    if (tiddler.fields[periodField] && tiddler.fields[assessmentField] && tiddler.fields[reviewedField]) {
        var period = parseInt(tiddler.fields[periodField]);
        var assessment = tiddler.fields[assessmentField];
        // Check the assessment date...
        // We have the ingredients for testing a date.
        var daysSince = twit_utils.twit_days_since(tiddler.fields[reviewedField]);
        // console.log("tiddler " + tiddler.fields.title + ", compliance field = " + complianceField + ": daysSince = " + daysSince + ", period = " + period);
        if (daysSince >= period) {
            maxErrorLevel = Math.max(maxErrorLevel, ERROR_LEVEL_ERROR);
        } else if (daysSince >= (period - 7)) {
            maxErrorLevel = Math.max(maxErrorLevel, ERROR_LEVEL_WARNING);
        }

        if (assessment === "no") {
            maxErrorLevel = Math.max(maxErrorLevel, ERROR_LEVEL_ERROR);
        } else if (assessment === "partial") {
            maxErrorLevel = Math.max(maxErrorLevel, ERROR_LEVEL_WARNING);
        }
    }
    return maxErrorLevel;
}

function compliance_fields() {
    const indexMin = 1,
          indexMax = 4;
    var result = [];
    for (var i = indexMin; i <= indexMax; i++) {
        result.push("compliance" + i);
    }
    return result;
}



function does_tiddler_have_compliance_fields(tiddler) {
    // 'some' iterates and stops when first returns true.
    if (tiddler && tiddler.fields) {
        return compliance_fields().some(function(f) {
            return tiddler.fields[f];
        });
    }
}        

function calculate_status_for_compliance_field(tiddler, complianceField) {
    if (!tiddler) {
        return;
    }
    var complianceBase = complianceField + "_",
        periodField = complianceBase + "period",
        assessmentField = complianceBase + "assessment",
        reviewedField = complianceBase + "reviewed",
        period = parseInt(tiddler.fields[periodField]),
        assessment = tiddler.fields[assessmentField];

    if (!tiddler.fields[periodField]) {
        return "missing_period";
    }
    if (!tiddler.fields[assessmentField]) {
        return "missing_assessment";
    }

    // Check the assessment date...
    // We have the ingredients for testing a date.
    var daysSince = twit_utils.twit_days_since(tiddler.fields[reviewedField]),
        trailer = "";

    if (daysSince >= period) {
        trailer = "_expired";
    } else if (daysSince >= (period - 7)) {
        trailer = "_nearly_expired";
    }

    if (assessment === "no") {
        return "no" + trailer;
    }

    if (assessment === "partial") {
        return "partial" + trailer;
    }

    return "okay" + trailer;
}

function calculate_due_status_for_compliance_field(tiddler, complianceField) {
    var complianceBase = complianceField + "_",
        periodField = complianceBase + "period",
        assessmentField = complianceBase + "assessment",
        reviewedField = complianceBase + "reviewed",
        period = parseInt(tiddler.fields[periodField]),
        preamble = "Every " + period + " days";

    if (!tiddler.fields[periodField]) {
        return;
    }

    if (!tiddler.fields[assessmentField]) {
        return preamble + " (Due!)";
    }

    var daysSince = twit_utils.twit_days_since(tiddler.fields[reviewedField]);

    if (daysSince >= period) {
        return preamble + " (Due!)";
    }
    
    var daysUntil = period - daysSince;
    return preamble + " (Due in " + daysUntil + " days)"
}

function calculate_actions_for_compliance_field(tiddler, complianceField) {
    if (!tiddler.fields[complianceField]) {
        return [];
    }
    var result = [],
        complianceBase = complianceField + "_",
        periodField = complianceBase + "period",
        assessmentField = complianceBase + "assessment",
        period = parseInt(tiddler.fields[periodField]),
        assessment = tiddler.fields[assessmentField];

    if (period != 30) {
        result.push("set_period_30")
    }
    if (period != 90) {
        result.push("set_period_90")
    }
    if (period != 180) {
        result.push("set_period_180")
    }
    if (period != 365) {
        result.push("set_period_365")
    }

    if (assessment != "no") {
        result.push("set_assessment_no");
    }
    if (assessment != "yes") {
        result.push("set_assessment_yes");
    }
    if (assessment != "partial") {
        result.push("set_assessment_partial");
    }

    result.push("edit_comment");
    result.push("delete");
    return result;
}

function all_permutations_of_compliance_fields(tiddler, title, options) {
    var result = [];
    compliance_fields().forEach(function(f){
        if (tiddler.fields[f]) {
            result.push(f);
        }
    });
    return result;
}


function calculate_tiddlers_with_compliance_fields_for_root(tiddler, title) {
    var result = [];
    if (does_tiddler_have_compliance_fields(tiddler)) {
        result.push(title);
    }
    // Check items in the tags field for this tiddler
    $tw.wiki.filterTiddlers("[title[" + title + "]tagging[]]").forEach(function (tt) {
        var tv = $tw.wiki.getTiddler(tt);
        if (does_tiddler_have_compliance_fields(tv)) {
            result.push(tt);
        }
    });
    return result;
}        

function calculate_max_compliance_error_for_tiddler(tiddler) {
    if ((tiddler === undefined) || (tiddler.fields === undefined)) {
        return ERROR_LEVEL_NONE;
    }

    // Only twit entities can have compliance issues
    if (!tiddler.fields.twit_class) {
        return ERROR_LEVEL_NONE;
    }

    var maxError = ERROR_LEVEL_NONE;

    compliance_fields().forEach(function (f) {
        var e = _get_max_error_for_compliance_field(tiddler, f);
        // console.log("Max error for tiddler '" + tiddler.fields.title + "', field " + f + " = " + e);
        maxError = Math.max(maxError, e);
    });

    return maxError;
}


function calculate_compliance_actions_for_children(tiddler) {
    var result = [];
    var maxError = ERROR_LEVEL_NONE;

    maxError = Math.max(maxError, calculate_max_compliance_error_for_tiddler(tiddler));

    if (tiddler && tiddler.fields) {
        // Check items in the tags field for this tiddler
        $tw.wiki.filterTiddlers("[title[" + tiddler.fields.title + "]tagging[]]").forEach(function (tt) {
            var tv = $tw.wiki.getTiddler(tt);
            maxError = Math.max(maxError, calculate_max_compliance_error_for_tiddler(tv));
        });
    }

    if (maxError == ERROR_LEVEL_WARNING) {
        result.push("compliance_fix_warnings");
    } else if (maxError == ERROR_LEVEL_ERROR) {
        result.push("compliance_fix_errors");
    }

    return result;
}

function actions_filter_all(source, options) {
    var result = [];
    source(function(tiddler, title) {
        result.push(...get_operating_system_actions(tiddler, title, options));
        result.push(...get_asset_actions(tiddler, title, options));
        result.push(...get_asset_model_actions(tiddler, title, options));
        result.push(...get_owner_actions(tiddler, title, options));
        result.push(...calculate_compliance_actions_for_children(tiddler, title, options));
    });
    return result;
}

function actions_filter_operating_system(source, options) {
    var result = [];
    source(function(tiddler, title) {
        result.push(...get_operating_system_actions(tiddler, title, options));
    });
    return result;
}

function actions_filter_asset(source, options) {
    var result = [];
    source(function(tiddler, title) {
        result.push(...get_asset_actions(tiddler, title, options));
    });
    return result;
}

function actions_filter_asset_model(source, options) {
    var result = [];
    source(function(tiddler, title) {
        result.push(...get_asset_model_actions(tiddler, title, options));
    });
    return result;
}

function actions_filter_owner(source, options) {
    var result = [];
    source(function(tiddler, title) {
        result.push(...get_owner_actions(tiddler, title, options));
    });
    return result;
}

function actions_filter_compliance(source, options) {
    var result = [];
    source(function(tiddler, title) {
        result.push(...calculate_compliance_actions_for_children(tiddler, title, options));
    });
    return result;
}

var contexts = {
    "all": actions_filter_all,
    "operating_system": actions_filter_operating_system,
    "asset": actions_filter_asset,
    "asset_model": actions_filter_asset_model,
    "owner": actions_filter_owner,
    "compliance": actions_filter_compliance,
}

exports.twit_actions = function (source, operator, options) {
    var suffixes = operator.suffixes || [],
		context = (suffixes[0] || [])[0],
        contextFn = contexts[context] || contexts.all
    return contextFn(source, options);
}

exports.twit_compliance_field_actions = function(source, operator, options) {
    var suffixes = operator.suffixes || [],
		complianceField = (suffixes[0] || [])[0],
        result = [];

    source(function(tiddler, title) {
        result.push(...calculate_actions_for_compliance_field(tiddler, complianceField));
    });

    return result;
}

exports.twit_compliance_items = function(source, _, options) {
    var result = [];
    source(function(tiddler, title) {
        result.push(...calculate_tiddlers_with_compliance_fields_for_root(tiddler, title, options));
    });
    return result;
}

exports.twit_compliance_fields = function(source, _, options) {
    var result = [];
    source(function(tiddler, title) {
        result.push(...all_permutations_of_compliance_fields(tiddler, title, options));
    });
    return result;
}

exports.twit_compliance_field_status = function(source, operator, options) {
    var suffixes = operator.suffixes || [],
		complianceField = (suffixes[0] || [])[0],
        result = [];

    source (function(tiddler) {
        result.push(calculate_status_for_compliance_field(tiddler, complianceField));
    });
    return result;
}

exports.twit_compliance_field_due = function(source, operator, options) {
    var suffixes = operator.suffixes || [],
		complianceField = (suffixes[0] || [])[0],
        result = [];

    source (function(tiddler) {
        var due_status = calculate_due_status_for_compliance_field(tiddler, complianceField);
        if (due_status) {
            result.push(due_status);
        }
    });
    return result;
}

})();
