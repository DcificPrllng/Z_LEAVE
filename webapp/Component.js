jQuery.sap.declare("hcm.emp.myleaverequests.Z_HCM_LR_CRE.Component");

// use the load function for getting the optimized preload file if present
// sap.ui.component.load({
// 	name: "hcm.emp.myleaverequests",  
// 	url: jQuery.sap.getModulePath("hcm.emp.myleaverequests.Z_HCM_LR_CRE") + "/../hcm_lr_cre" // provide parent project url
// 	// we use a URL relative to our own component; might be different if
// 	// extension app is deployed with customer namespace
// });
sap.ui.component.load({
	name: "hcm.emp.myleaverequests",
	// Use the below URL to run the extended application when SAP-delivered application is deployed on SAPUI5 ABAP Repository
	url: "/sap/bc/ui5_ui5/sap/HCM_LR_CRE"
		// we use a URL relative to our own component
		// extension application is deployed with customer namespace
});

this.hcm.emp.myleaverequests.Component.extend("hcm.emp.myleaverequests.Z_HCM_LR_CRE.Component", {
	metadata: {
		version : "1.2",
		name : "My Leave Requests",
		config : {
			"sap.ca.i18Nconfigs": {
				"bundleName":"hcm.emp.myleaverequests.Z_HCM_LR_CRE.i18n.i18n"
			},
			"titleResource": 'My Leave Requests'
		},
		
		customizing: {
			"sap.ui.viewReplacements": {
				"hcm.emp.myleaverequests.view.S1": {
					viewName: "hcm.emp.myleaverequests.Z_HCM_LR_CRE.view.S1Custom",
					type: "XML"
				}
			},

			"sap.ui.controllerExtensions": {
				"hcm.emp.myleaverequests.view.S1": {
					controllerName: "hcm.emp.myleaverequests.Z_HCM_LR_CRE.view.S1Custom",
				},
				"hcm.emp.myleaverequests.view.S3": {
					controllerName: "hcm.emp.myleaverequests.Z_HCM_LR_CRE.view.S3Custom",
				},
				"hcm.emp.myleaverequests.view.S6B": {
					controllerName: "hcm.emp.myleaverequests.Z_HCM_LR_CRE.view.S6Custom",
				}
			}
		}			
	}
});