jQuery.sap.require('sap.ui.model.FilterOperator');

sap.ui.controller("hcm.emp.myleaverequests.Z_LEAVE1.view.S1Custom", {
	
	publicHolidays: [],

	_getCalLabelsOK : function(oCalEvents) {

		var _this = hcm.emp.myleaverequests.utils.UIHelper.getControllerInstance();

		if (!!oCalEvents.REJECTED && oCalEvents["REJECTED"].length > 0) {
			_this.cale.toggleDatesType(oCalEvents["REJECTED"], sap.me.CalendarEventType.Type07, true);
			_this.cale.toggleDatesType(oCalEvents["REJECTED"], sap.me.CalendarEventType.Type04, false);
			_this.cale.toggleDatesType(oCalEvents["REJECTED"], sap.me.CalendarEventType.Type01, false);
		}
		if (!!oCalEvents.SENT && oCalEvents["SENT"].length > 0) {
			_this.cale.toggleDatesType(oCalEvents["SENT"], sap.me.CalendarEventType.Type07, false);
			_this.cale.toggleDatesType(oCalEvents["SENT"], sap.me.CalendarEventType.Type04, true);
			_this.cale.toggleDatesType(oCalEvents["SENT"], sap.me.CalendarEventType.Type01, false);
		}
		if (!!oCalEvents.APPROVED && oCalEvents["APPROVED"].length > 0) {
			_this.cale.toggleDatesType(oCalEvents["APPROVED"], sap.me.CalendarEventType.Type07, false);
			_this.cale.toggleDatesType(oCalEvents["APPROVED"], sap.me.CalendarEventType.Type04, false);
			_this.cale.toggleDatesType(oCalEvents["APPROVED"], sap.me.CalendarEventType.Type01, true);
		}
		if (!!oCalEvents.POSTED && oCalEvents["POSTED"].length > 0) {
			_this.cale.toggleDatesType(oCalEvents["POSTED"], sap.me.CalendarEventType.Type07, false);
			_this.cale.toggleDatesType(oCalEvents["POSTED"], sap.me.CalendarEventType.Type04, false);
			_this.cale.toggleDatesType(oCalEvents["POSTED"], sap.me.CalendarEventType.Type01, true);
		}
		if (!!oCalEvents.WEEKEND && oCalEvents["WEEKEND"].length > 0) {
			_this.cale.toggleDatesType(oCalEvents["WEEKEND"], sap.me.CalendarEventType.Type00, true);
		}
		if (!!oCalEvents.PHOLIDAY && oCalEvents["PHOLIDAY"].length > 0) {
			_this.cale.toggleDatesType(oCalEvents["PHOLIDAY"], sap.me.CalendarEventType.Type06, true);

			// Custom Code Extension
			var holidays = $.merge(oCalEvents.PHOLIDAY, _this.publicHolidays),
				newHolidays = [];
			$.each(holidays, function(i, el){
				if($.inArray(el, newHolidays) === -1) newHolidays.push(el);
			});
			_this.publicHolidays = newHolidays;
			// End Custom Code
		}
		if (!!oCalEvents.WORKDAY && oCalEvents["WORKDAY"].length > 0) {
			if (sap.me.CalendarEventType.Type10) {
				_this.cale.toggleDatesType(oCalEvents["WORKDAY"], sap.me.CalendarEventType.Type10, true);
			} else {
				_this.cale.toggleDatesType(oCalEvents["WORKDAY"], "", true);
			}
		}

	},

	_weekHasHoliday: function (day) {

		var curr = new Date(day); // get current date
		var first = curr.getDate() - curr.getDay(); //to set first day on monday, not on sunday, first+1 :
		var hasHoliday = false;
		
		for (var i = 1; i<7; i++){
		    var next = new Date(curr.getTime());
		    next.setDate(first + i);
		    if (this.publicHolidays.indexOf(next.toDateString()) > -1) {
		    	hasHoliday = true;
		    	break;
		    }
		}
		
		return hasHoliday;
	},

	onScheduleChange: function (oControl) {
		if (oControl.getParameters().selectedItem.getKey() === 'other') {
			this.byId('TEXT_HOURS_REQUIRED').setVisible(false);
			this.byId('INPUT_HOURS_MULTIPLE').setVisible(true);
			this.byId('INPUT_HOURS_MULTIPLE').setValue('');
		} else {
			this.byId('TEXT_HOURS_REQUIRED').setVisible(true);
			this.byId('INPUT_HOURS_MULTIPLE').setVisible(false);
			this.setNumberOfHours();
		}
	},

	setNumberOfHours: function () {
		var self = this,
			hours = 0,
			dates = this.cale.getSelectedDates(),
			schedule = this.getView().byId('SCHEDULE_TYPE').getSelectedKey();

		// Loop through days
		jQuery.each(dates, function (key, val) {
			var day = val.split(' ')[0];
			var hasHoliday = self._weekHasHoliday(val);

			if (day !== 'Sat' && day !== 'Sun' && self.publicHolidays.indexOf(val) === -1) {
				if (schedule === 'flex' && !hasHoliday) {
					if (day === 'Fri') {
						hours += 4;
					} else {
						hours += 9;
					}
				} else {
					hours += 8;
				}
			}
		});

		this.byId('TEXT_HOURS_REQUIRED').setText(hours + ' hours');
		this.setBtnEnabled("LRS4_BTN_SEND", (hours !== 0));
	},

	/*
		Extension - When Day is clicked
		(Adjust Visible Boxes from UI)
	 */
	extHookTapOnDate: function () {
		var _aSelction = this.cale.getSelectedDates();

		// If not change clear!
		/*
		if (false) {
			this.byId('INPUT_HOURS_SINGLE').setValue('');
			this.byId('INPUT_HOURS_STANDARD').setValue('');
		}
		*/

		if (_aSelction.length > 1) {
			this.byId('LRS4_HOURS_SET').setVisible(false);
			this.byId('LRS4_SCHEDULE_SELECT').setVisible(true);
			this.setNumberOfHours();
		} else if (_aSelction.length == 0) {
			this.byId('LRS4_HOURS_SET').setVisible(false);
			this.byId('LRS4_SCHEDULE_SELECT').setVisible(false);
		} else {
			this.byId('LRS4_HOURS_SET').setVisible(true);
			this.byId('LRS4_SCHEDULE_SELECT').setVisible(false);
		}
	},


	onSendClick: function () {
		var _this = hcm.emp.myleaverequests.utils.UIHelper.getControllerInstance();
		var dates = this.cale.getSelectedDates();
		var schedule = _this.byId('SCHEDULE_TYPE').getSelectedKey();
		var totalDays = 0;
		var totalHours = 0;
		var enableSendButton = true;
		
		var outputMsg = '';

		if (dates.length === 1) {
			var day = dates[0].split(' ')[0];
			totalHours = parseFloat(_this.byId('INPUT_HOURS_SINGLE').getValue());

			if (_this.byId('INPUT_HOURS_SINGLE').getValue() === "" || isNaN(totalHours)) {
				outputMsg = 'Please enter the required number of hours.';
				enableSendButton = false;
			} else if (day === 'Sat' || day === 'Sun' || this.publicHolidays.indexOf(dates[0]) > -1) {
				outputMsg = 'The selected day is a non work day.';
				enableSendButton = false;
			} else {
				outputMsg = 'You\'ve requested ' + totalHours + ' hours, are you sure this is correct?';
			}
			
		} else {

			if (schedule === 'other') {
				totalDays = 0;
				jQuery.each(dates, function (key, val) {
					var day = val.split(' ')[0];
					if (day !== 'Sat' && day !== 'Sun' && _this.publicHolidays.indexOf(val) === -1) {
						totalDays++;
					}
				});
				totalHours = parseFloat(_this.byId('INPUT_HOURS_MULTIPLE').getValue());
				if (totalDays > 0) {
					if (totalHours > 0) {
						outputMsg = 'You\'ve requested ' + totalHours + ' hours over this ' + totalDays + ' day period, are you sure this is correct?';
					} else {
						outputMsg = 'Please enter the required number of hours.';
						enableSendButton = false;
					}
				} else {
					outputMsg = 'You have either selected weekend or public holidays, please try again.';
					enableSendButton = false;
				}
			} else {
				jQuery.each(dates, function (key, val) {

					var day = val.split(' ')[0];
					var hours = 0;

					var hasHoliday = _this._weekHasHoliday(val);

					if (day !== 'Sat' && day !== 'Sun' && _this.publicHolidays.indexOf(val) === -1) {
						if (schedule === 'flex' && !hasHoliday) {
							if (day === 'Fri') {
								hours = 4;
							} else {
								hours = 9;
							}
						} else {
							hours = 8;
						}

						totalDays++;
						totalHours += hours;
					}

				});

				outputMsg = 'You\'ve requested ' + totalHours + ' hours over this ' + totalDays + ' day period, are you sure this is correct?';
			}

		}
		
		var confirmBox = new sap.m.Dialog({
			title: 'Confirm Request',
			type: sap.m.DialogType.Message,
			content: new sap.ui.layout.VerticalLayout({
				content: [
					new sap.m.Text({
						text: outputMsg
					}),
					new sap.m.Text(),
					new sap.m.Text({
						visible: (enableSendButton && ( this.leaveType.AbsenceTypeCode === '0100' || this.leaveType.AbsenceTypeCode === 'NG01')),
						text: '*If my employment is ended from the company with a negative vacation balance, the value of this vacation balance will be deducted from my paycheck or I will remit payment to the company.'
					})
				]
			}),
			leftButton: new sap.m.Button({
				text: 'Cancel',
				press: function () {
					confirmBox.close();
				}
			}),
			rightButton: new sap.m.Button({
				enabled: enableSendButton,
				type: 'Emphasized',
				text: 'Submit',
				press: function () {
					confirmBox.close();
					_this.handleChange(_this.submit);

				}
			})
		});
		confirmBox.open();
	},


	handleChange: function (cb) {
		var _this = this,
			req = this.oRouter.changeVal,
			oData = this.oApplicationFacade.getODataModel(),
			total, completed = 0;

		function process(empId, state, ids) {
			total = ids.length;
			jQuery.each(ids, function (key, val) {
				var url = '/LeaveRequestCollection(EmployeeID=\'' + empId + '\',RequestID=\'' + val + '\',ChangeStateID=\'' + state + '\',LeaveKey=\'\')';
				oData.remove(url, {
					success: success,
					error: error
				});
			});
		}

		function success() {
			completed++;
			if (total === completed) {
				delete _this.oRouter.changeVal;
				cb.call(_this);
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
			process(req.EmployeeID, req.ChangeStateID, req.Ids);
		} else {
			cb.call(this);
		}
	},

	submit : function() {
		// This method is called when the "send" button is tapped after entering a new leave request
		// or changing an existing one.
		// The method is called two times during one "submit" event. The first time it is called by the
		// tap event handler of the submit button. This call is done with parameter isSimulation=true. This
		// parameter is passed on to the backend where the data is checked. If the check has a positive result
		// a confirmation popup with a summary of the lr data is show. When the user confirmr this popup this function
		// is called the second time this time not in simulate mode

		var _this = hcm.emp.myleaverequests.utils.UIHelper.getControllerInstance();
		var self = this;
		var sStartDate, sEndDate;
		// reset globals
		this.bApproverOK = null;
		this.bSubmitOK = null;
		this.oSubmitResult = {};
		this.bSimulation = false; //isSimulation;

		var totalDays = 0,
			completedDays = 0;

		var AbsenceTypeCode = this.leaveType.AbsenceTypeCode;
		var hours;


		function onComplete (oResult, oMsgHeader) {
			completedDays++;
			if (totalDays === completedDays) {
				_this.byId('INPUT_HOURS_SINGLE').setValue('');
				_this.byId('INPUT_HOURS_MULTIPLE').setValue('');
				_this.byId('LRS4_HOURS_SET').setVisible(false);
				_this.byId('LRS4_SCHEDULE_SELECT').setVisible(false);
				_this._isLocalReset = true;

				oResult.StartDate = _oStartEndDates.startDate;
				oResult.EndDate = _oStartEndDates.endDate;

				_this.sApprover = oResult.ApproverEmployeeName;
				_this.onSubmitLRCsuccess(oResult, oMsgHeader);
			}
		}

		function submitData(sStartDate, sEndDate, hours, sAbsenceTypeCode, sNotes,
							bProcessCheckOnlyInd, successCallback, errorCallback) {
			var sBody = {};

			sBody.StartDate = sStartDate;
			sBody.Notes = sNotes;
			sBody.ProcessCheckOnlyInd = (bProcessCheckOnlyInd ? true : false);
			sBody.AbsenceTypeCode = sAbsenceTypeCode;
			sBody.EndDate = sEndDate;
			sBody.WorkingHoursDuration = hours.toString();

			self.oDataModel.create('/LeaveRequestCollection?rand=' + Math.random(), sBody, {
				success: successCallback,
				error: errorCallback,
				async: true
			});
		}


		function onError(data) {
			var msg = 'Error, please try again.';

			if (data.response && data.response.body) {
				try {
					var response = JSON.parse(data.response.body);
					msg = [];
					if (response.error.message.value) {msg.push(response.error.message.value);}
					if (response.error.innererror.errordetails instanceof Array) {
						response.error.innererror.errordetails.forEach(function (val) {
							msg.push(val.message);
						});
					}
				} catch(e) {}
			} else if (data.message) {
				msg = data.message;
			}
			_this.onSubmitLRCfail(msg);
		}

		if (this.cale) {
			var _oStartEndDates = this._getStartEndDate(this.cale.getSelectedDates()),
				dates = this.cale.getSelectedDates();

			// submit leave request
			if (!this.oBusy) {
				this.oBusy = new sap.m.BusyDialog();
			}
			this.oBusy.open();
			var notes = "";
			if (this.note) { // App Designer specific: in case note field was removed
				notes = this.note.getValue();
			}

			// collect data for submit
			//if (this.timeFrom && this.timeTo && this.leaveType.AllowedDurationPartialDayInd) {
			if (dates.length === 1) {
				hours = parseFloat(_this.byId('INPUT_HOURS_SINGLE').getValue());

				sStartDate = hcm.emp.myleaverequests.utils.Formatters.DATE_YYYYMMdd(_oStartEndDates.startDate) + 'T00:00:00';
				sEndDate = hcm.emp.myleaverequests.utils.Formatters.DATE_YYYYMMdd(_oStartEndDates.endDate) + 'T00:00:00';

				totalDays = 1; // For Completion check

				submitData(sStartDate, sEndDate, hours, AbsenceTypeCode, notes, false, onComplete, onError);

			} else {

				var requestedData = [];
				var checkCompleted = 0;

				function onCheckComplete() {
					checkCompleted++;
					if (checkCompleted === totalDays) {
						jQuery.each(requestedData, function (key, val) {
							submitData(val.date, val.date, val.hours, AbsenceTypeCode, notes, false, onComplete, onError);
						});
					}
				}

				jQuery.each(dates, function (key, val) {
					var day = val.split(' ')[0];
					if (day !== 'Sat' && day !== 'Sun' && _this.publicHolidays.indexOf(val) === -1) {
						totalDays++;
					}
				});


				jQuery.each(dates, function (key, val) {
					var dayDate = new Date(val);
					var day = val.split(' ')[0];
					var hours;
					var schedule = _this.byId('SCHEDULE_TYPE').getSelectedKey();
					var hasHoliday = _this._weekHasHoliday(val);

					if (day !== 'Sat' && day !== 'Sun' && _this.publicHolidays.indexOf(val) === -1) {
						if (schedule === 'other') {
							hours = parseFloat(_this.byId('INPUT_HOURS_MULTIPLE').getValue()) / totalDays;
						} else if (schedule === 'flex' && !hasHoliday) {
							if (day === 'Fri') {
								hours = 4;
							} else {
								hours = 9;
							}
						} else {
							hours = 8;
						}

						sStartDate = hcm.emp.myleaverequests.utils.Formatters.DATE_YYYYMMdd(dayDate) + 'T00:00:00';
						sEndDate = hcm.emp.myleaverequests.utils.Formatters.DATE_YYYYMMdd(dayDate) + 'T00:00:00';

						requestedData.push({
							date: sStartDate,
							hours: hours
						});

						submitData(sStartDate, sEndDate, hours, AbsenceTypeCode, notes, true, onCheckComplete, onError); // Simulated data check!
					}

				});

			
			}
		
		}
		
		
		/**
     * @ControllerHook Extend behavior of submit
     * This hook method can be used to add UI or business logic 
     * It is called when the submit method executes
     * @callback hcm.emp.myleaverequests.view.S1~extHookSubmit
     */
		if(this.extHookSubmit) {
			this.extHookSubmit();
		}
		
	},

	onCancelClick: function() {
		if (this.oRouter.changeVal) {
			delete this.oRouter.changeVal;
		}

		this.byId('INPUT_HOURS_SINGLE').setValue('');
		this.byId('INPUT_HOURS_MULTIPLE').setValue('');
		this.byId('LRS4_HOURS_SET').setVisible(false);
		this.byId('LRS4_SCHEDULE_SELECT').setVisible(false);

		if (!this.changeMode) {
			this._isLocalReset = true;
			this._clearData();
			hcm.emp.myleaverequests.utils.CalendarTools.clearCache();
			this._setHighlightedDays(this.cale.getCurrentDate());
		} else {
			this.oRouter.navTo("master");
		}
	},


	// Handle Change Feature
	extHookRouteMatchedChange: function () {
		var req = this.oRouter.changeVal;

		if (typeof req !== 'undefined') {

			this.objHeaderFooterOptions.sI18NFullscreenTitle = "LR_TITLE_CHANGE_VIEW";
			this.setHeaderFooterOptions(this.objHeaderFooterOptions);

			// Set-up Leave Type
			this._setUpLeaveTypeData(req.AbsenceTypeCode);

			// Set-up Data
			this.oChangeModeData = {};
			this.changeMode = true;
			this._clearData();

			this.oChangeModeData.leaveTypeCode = req.AbsenceTypeCode;
			this.oChangeModeData.startDate = req.StartDate.toString();
			this.oChangeModeData.endDate = req.EndDate.toString();
			this.oChangeModeData.startTime = req.StartTime;
			this.oChangeModeData.endTime = req.EndTime;
			this.oChangeModeData.noteTxt = req.Notes;
			this.oChangeModeData.employeeID = req.EmployeeID;
			this.oChangeModeData.changeStateID = req.ChangeStateID;
			this.oChangeModeData.leaveKey = req.LeaveKey;
			this.oChangeModeData.evtType = this._getCaleEvtTypeForStatus(req.StatusCode);

			this._copyChangeModeData();

			this.extHookTapOnDate();

			// Update Input Boxes
			if (req.Ids.length > 1) {
				this.getView().byId('INPUT_HOURS_STANDARD').setValue(parseFloat(req.WorkingHoursDuration)/req.Ids.length);
				this.setNumberOfHours();
			} else {
				this.getView().byId('INPUT_HOURS_SINGLE').setValue(parseFloat(req.WorkingHoursDuration));
			}

		}


	},


	extHookChangeFooterButtons: function (buttons) {
		buttons.buttonList.splice(1, 1); // Remove entitlements button
		return buttons;
	},

	onHistoryClick: function() {
		this.oRouter.navTo("master", {});
		sap.ui.getCore().getEventBus().publish("hcm.emp.myleaverequests.LeaveCollection", "refresh");
	}

});