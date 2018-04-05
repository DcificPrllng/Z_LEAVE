sap.ui.controller("hcm.emp.myleaverequests.Z_HCM_LR_CRE.view.S3Custom", {

    extHookChangeFooterButtons: function (buttons) {
        hcm.emp.myleaverequests.utils.DataManager.groupLeaveRequest = this.extHookLeaveRequestCollection;
        return buttons;
    },

    extHookLeaveRequestCollection: function (data) {
        var output = [],
            extra = [],
            current = null;

        function groupData(val) {
            var tomorrow;
            if (current === null) {
                current = val;
            } else {
                tomorrow = new Date(current.EndDate.getTime());
                tomorrow.setDate(current.EndDate.getDate() + 1);

                if (current.AbsenceTypeCode === val.AbsenceTypeCode && (parseFloat(current.WorkingHoursDuration)/current.Ids.length) === parseFloat(val.WorkingHoursDuration) && tomorrow.getTime() === val.StartDate.getTime()) {
                    current.EndDate = val.EndDate;
                    current.Ids.push(val.Ids[0]);
                    current.WorkingHoursDuration = (parseFloat(current.WorkingHoursDuration) + parseFloat(val.WorkingHoursDuration)).toString();
                } else {
                    current.WorkingDaysDuration = (current.Ids.length > 1) ? current.Ids.length.toString() : current.WorkingDaysDuration; // Fix working day duration
                    output.push(current);
                    current = val;
                }
            }
        }

        function objSort(a, b) {
            if (a.StatusCode === b.StatusCode) {
                if (a.AbsenceTypeCode === b.AbsenceTypeCode) {
                    if (a.StartDate.getTime() === b.StartDate.getTime()) {
                        return 0; // The Same - Shouldn't happen
                    } else {
                        // Check Date
                        return (a.StartDate.getTime() - b.StartDate.getTime());
                    }
                } else {
                    // Check types
                    return (a.AbsenceTypeCode < b.AbsenceTypeCode) ? -1 : 1;
                }
            } else {
                return (a.StatusCode > b.StatusCode) ? -1 : 1;
            }
        }

        function process(v) {
            var val = jQuery.extend({}, v);
            //val.StartDate = new Date(val.StartDate.getTime() + val.StartDate.getTimezoneOffset() * 60000);
            //val.EndDate = new Date(val.EndDate.getTime() + val.EndDate.getTimezoneOffset() * 60000);
            if (val.RequestID !== '') {
                val.Ids = [val.RequestID];
                val.rid = true;
            } else {
                val.Ids = [val.LeaveKey];
                val.rid = false;
            }

            // Stop Change on posted requests
            if (val.StatusCode === 'POSTED') {
                val.ActionModifyInd = false;
            }

            if (val.StartDate.getTime() !== val.EndDate.getTime()) {
                output.push(val);
            } else {
                extra.push(val);
            }
        }

        if (typeof data !== 'undefined' && data.length > 0) {
            data.forEach(process);
        }

        // Sort the dates by, person, type, date!
        extra.sort(objSort);

        // Loop through grouping
        extra.forEach(groupData);

        if (current !== null) {
            current.WorkingDaysDuration = (current.Ids.length > 1) ? current.Ids.length.toString() : current.WorkingDaysDuration; // Fix working day duration
            output.push(current);
        }

        // Sort list by date
        output.sort(function (a,b) {
            return b.StartDate - a.StartDate;
        });

        return output;
    }

});

// Fix For Duration
hcm.emp.myleaverequests.utils.Formatters.DURATION = function (days, hours) {
    if (days == undefined || hours == undefined) {
        return '';
    }
    return parseFloat(hours).toString();
};

hcm.emp.myleaverequests.utils.Formatters.DURATION_UNIT = function(sDays, sHours) {

    if (sDays == undefined || sHours == undefined) {
        return "";
    }

    return (sHours * 1 != 1) ? hcm.emp.myleaverequests.utils.Formatters.resourceBundle
        .getText("LR_HOURS")
        : hcm.emp.myleaverequests.utils.Formatters.resourceBundle.getText("LR_HOUR");
};