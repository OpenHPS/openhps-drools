import { Service } from "@openhps/core";
import axios from 'axios';

/**
 * Drools KIE service is a service to connect to a Drools server. 
 */
export class DroolsKIEService extends Service {
    readonly INFO = '/services/rest/server/';
    readonly CONTAINERS = '/services/rest/server/containers/';
    protected options: DroolsKIEOptions;

    constructor(options?: DroolsKIEOptions) {
        super();
        this.options = options;
    }
    
    info(): Promise<string> {
        return new Promise((resolve, reject) => {
            axios.get(this.options.baseUrl + this.INFO, {
                
            }).then(result => {

            }).catch(reject);
        });
    }
}

export interface DroolsKIEOptions {
    baseUrl: string;
    username: string;
    password: string;
}

