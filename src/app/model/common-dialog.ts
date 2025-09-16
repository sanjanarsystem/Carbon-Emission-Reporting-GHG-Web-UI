export interface CommonDialogData {
	title?: string;
	subtitle?: string;
	message?: string;
	contentTemplate?: any; // Pass in ng-template
	width?: string;
	disableClose?: boolean;
	hideCancel?: boolean;
	hideConfirm?: boolean;
	confirmText?: string;
	cancelText?: string;
	data?: any; // Custom data for template
}
