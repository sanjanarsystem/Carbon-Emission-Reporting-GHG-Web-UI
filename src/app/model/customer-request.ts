export class CustomerRequest {
    masterClientId: string;
    customerName: string;
    date: string;
    currentStatus: string;

    constructor( id: string, masterClientId: string, customerName: string,
        date: string, currentStatus: string ) {

        this.masterClientId = masterClientId;
        this.customerName = customerName;
        this.date = date;
        this.currentStatus = currentStatus;

    }

}

export interface DisableClientRequest {
    configs: {
        master_client_id: string;
        is_reporting_enabled: boolean;
        action_taken_by: string;
    }[];
}
