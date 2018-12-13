sap.ui.controller("hcm.emp.myleaverequests.Z_LEAVE1.view.S6Custom", {

    extHookChangeFooterButtons: function (buttons) {
        var _this = this;
        if (typeof buttons.buttonList !== 'undefined' && buttons.buttonList.length > 0) {
            buttons.buttonList[0].onBtnPressed = function () {
                _this.change.call(_this);
            }; // Bind new change event
        }
        buttons.buttonList.shift();
        return buttons;
    },

    /*
     Overwrite Withdraw Request
     */
    withdraw: function () {
        var _this = this,
            req = this.currntObj,
            oData = this.oApplicationFacade.getODataModel(),
            total, completed = 0;

        function process(empId, state, rid, ids) {
            total = ids.length;

            jQuery.each(ids, function (key, val) {
                if (rid === true) {
                    var url = '/LeaveRequestCollection(EmployeeID=\'' + empId + '\',RequestID=\'' + val + '\',ChangeStateID=\'' + state + '\',LeaveKey=\'\')';
                    oData.remove(url, {
                        success: success,
                        error: error
                    });
                } else {
                    oData.create('/LeaveRequestCollection', {
                        ActionCode: 3,
                        ChangeStateID: state,
                        EmployeeID: empId,
                        LeaveKey: val,
                        ProcessCheckOnlyInd: false,
                        RequestID: ''
                    }, {
                        success: success,
                        error: error
                    });
                }

            });
        }

        function success() {
            completed++;
            if (total === completed) {
                sap.ui.getCore().getEventBus().publish("hcm.emp.myleaverequests.LeaveCollection", "refresh");
                hcm.emp.myleaverequests.utils.UIHelper.setIsWithDrawn(_this.currntObj._navProperty);
                hcm.emp.myleaverequests.utils.UIHelper.setIsWithDrawAction(true);
                sap.m.MessageToast.show(_this.resourceBundle.getText("LR_WITHDRAWDONE"));
            }
        }

        function error(data) {
            var msg = 'Error, please try again.';
            if (data.response && data.response.body) {
                try {
                    var response = JSON.parse(data.response.body);
                    msg = response.error.message.value;
                } catch(e) {}
            } else if (data.message) {
                msg = data.message;
            }
            hcm.emp.myleaverequests.utils.UIHelper.errorDialog(msg);
        }


        // Withdraw Requests! (Handle incase issue with details.
        if (typeof req !== 'undefined' && typeof req.Ids !== 'undefined' && req.Ids.length > 0) {
            process(req.EmployeeID, req.ChangeStateID, req.rid, req.Ids);
        }
    },

    change: function () {
        var req = this.currntObj;

        hcm.emp.myleaverequests.utils.UIHelper.setIsChangeAction(true);

        this.oRouter.changeVal = req;

        this.oRouter.navTo("change", {
            requestID: 'change'
        });
    },



    _handleRouteMatched : function(oEvent) {

        if (oEvent.getParameter("name") === "detail") {


            hcm.emp.myleaverequests.utils.DataManager.init(this.oDataModel, this.resourceBundle);

            //TODO:
            oEvent.getParameter("arguments").contextPath = decodeURIComponent(oEvent.getParameter("arguments").contextPath);

            var _this = this;

            var contextPath = decodeURIComponent(oEvent.getParameter("arguments").contextPath);
            var indexVal = null;
            var  consolidatedLeaveRequestcollection=null;
            var setDetails = function (){
                hcm.emp.myleaverequests.utils.UIHelper.setRoutingProperty(consolidatedLeaveRequestcollection);
                consolidatedLeaveRequestcollection=hcm.emp.myleaverequests.utils.UIHelper.getRoutingProperty();

                if (consolidatedLeaveRequestcollection !== null) {
                    for ( var i = 0; i < consolidatedLeaveRequestcollection.length; i++) {
                        if (consolidatedLeaveRequestcollection[i]._navProperty === contextPath) {
                            indexVal = i;
                            break;
                        }
                    }
                }
                var curntLeaveRequest = consolidatedLeaveRequestcollection[indexVal];


                if(curntLeaveRequest){
                    _this.currntObj = curntLeaveRequest;


                    var cntrlObjectHeader = _this.byId("LRS6B_HEADER");
                    var cntrlNotesTab = _this.byId("LRS6B_ICNTABBAR");

                    var lblOrigDate = _this.byId("LRS6B_LBL_ORIGINAL_DATE");
                    var hdrStartDate = _this.byId("LRS6B_HEADER_START_DATE");
                    var hdrEndDate = _this.byId("LRS6B_HEADER_END_DATE");
                    var lblChngedDate = _this.byId("LRS6B_LBL_CHANGED_DATE");
                    var hdrNewStartDate = _this.byId("LRS6B_NEW_HEADER_START_DATE");
                    var hdrNewEndDate = _this.byId("LRS6B_NEW_HEADER_END_DATE");
                    var hdrStatus = _this.byId("LRS6B_HEADER_STATUS");
                    var hdrStatus2 = _this.byId("LRS6B_HEADER_STATUS2");

                    var cntrlNotesText = _this.byId("LRS6B_NOTESTEXT");

                    if (_this.currntObj.Notes === "") {
                        cntrlNotesTab.setVisible(false);
                    } else {
                        cntrlNotesTab.setVisible(true);
                    }

                    cntrlObjectHeader.setTitle(curntLeaveRequest.AbsenceTypeName);
                    cntrlObjectHeader.setNumber(hcm.emp.myleaverequests.utils.Formatters.DURATION(curntLeaveRequest.WorkingDaysDuration,curntLeaveRequest.WorkingHoursDuration));
                    cntrlObjectHeader.setNumberUnit(hcm.emp.myleaverequests.utils.Formatters.DURATION_UNIT(curntLeaveRequest.WorkingDaysDuration,curntLeaveRequest.WorkingHoursDuration));

                    lblOrigDate.setVisible(hcm.emp.myleaverequests.utils.Formatters.SET_RELATED_VISIBILITY(curntLeaveRequest.aRelatedRequests));
                    hdrStartDate.setText(hcm.emp.myleaverequests.utils.Formatters.DATE_ODATA_EEEdMMMyyyyLong(curntLeaveRequest.StartDate));
                    hdrEndDate.setText(hcm.emp.myleaverequests.utils.Formatters.FORMAT_ENDDATE_LONG(_this.resourceBundle.getText("LR_HYPHEN"),
                        curntLeaveRequest.WorkingDaysDuration,curntLeaveRequest.StartTime,curntLeaveRequest.EndDate,curntLeaveRequest.EndTime));
                    lblChngedDate.setVisible(hcm.emp.myleaverequests.utils.Formatters.SET_RELATED_VISIBILITY(curntLeaveRequest.aRelatedRequests));
                    hdrNewStartDate.setVisible(hcm.emp.myleaverequests.utils.Formatters.SET_RELATED_START_DATE_VISIBILITY(curntLeaveRequest.aRelatedRequests));
                    hdrNewStartDate.setText(hcm.emp.myleaverequests.utils.Formatters.FORMAT_RELATED_START_DATE_LONG(curntLeaveRequest.aRelatedRequests));
                    hdrNewEndDate.setVisible(hcm.emp.myleaverequests.utils.Formatters.SET_RELATED_END_DATE_VISIBILITY(curntLeaveRequest.aRelatedRequests));
                    hdrNewEndDate.setText(hcm.emp.myleaverequests.utils.Formatters.FORMAT_RELATED_END_DATE_LONG(_this.resourceBundle.getText("LR_HYPHEN"), curntLeaveRequest.aRelatedRequests));
                    hdrStatus.setText(curntLeaveRequest.StatusName);
                    hdrStatus.setState(hcm.emp.myleaverequests.utils.Formatters.State(curntLeaveRequest.StatusCode));
                    hdrStatus2.setText(hcm.emp.myleaverequests.utils.Formatters.FORMATTER_INTRO(curntLeaveRequest.aRelatedRequests));
                    hdrStatus2.setState("Error");
                    cntrlNotesText.setText(curntLeaveRequest.Notes);

                    _this._initState();
                }
            };
            consolidatedLeaveRequestcollection = hcm.emp.myleaverequests.utils.DataManager.getCachedModelObjProp("ConsolidatedLeaveRequests");
            if(consolidatedLeaveRequestcollection === undefined){
                hcm.emp.myleaverequests.utils.DataManager.getConsolidatedLeaveRequests(function(objResponse) {

                    consolidatedLeaveRequestcollection = hcm.emp.myleaverequests.utils.DataManager.groupLeaveRequest(objResponse.LeaveRequestCollection);

                    hcm.emp.myleaverequests.utils.DataManager.setCachedModelObjProp("ConsolidatedLeaveRequests",consolidatedLeaveRequestcollection);
                    setDetails();
                    hcm.emp.myleaverequests.utils.UIHelper.setIsLeaveCollCached(true);
                }, function(objResponse) {
                    hcm.emp.myleaverequests.utils.DataManager.parseErrorMessages(objResponse);
                });
            }
            else{
                setDetails();
            }

            /**
             * @ControllerHook Modify the loaded view
             * This hook method can be used to add or change UI and business logic
             * It is called when the route match to detail
             * @callback hcm.emp.myleaverequests.view.S6B~extHookDetailView
             */
            if(this.extHookDetailView) {
                this.extHookDetailView();
            }

            //sap.ca.ui.utils.busydialog.releaseBusyDialog();
        }

    }


});