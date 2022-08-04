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
    
    /**
     * Find all containers on the KIE server
     *
     * @returns {Container[]} Array with containers 
     */
    findAllContainers(): Promise<Container[]> {
        return new Promise((resolve, reject) => {
            axios.get(this.options.baseUrl + this.CONTAINERS, {
                auth: {
                    username: this.options.username,
                    password: this.options.password
                }
            }).then(result => {
                if (result.data.type === 'SUCCESS') {
                    console.log(result.data.result['kie-containers']);
                    resolve(result.data.result['kie-containers']);
                } else {
                    reject(result.data.msg);
                }
            }).catch(reject);
        });
    }

    /**
     * Get server information from the Drools KIE server
     *
     * @returns {ServerInfo} Server information 
     */
    info(): Promise<ServerInfo> {
        return new Promise((resolve, reject) => {
            axios.get(this.options.baseUrl + this.INFO, {
                auth: {
                    username: this.options.username,
                    password: this.options.password
                }
            }).then(result => {
                if (result.data.type === 'SUCCESS') {
                    resolve(result.data.result['kie-server-info']);
                } else {
                    reject(result.data.msg);
                }
            }).catch(reject);
        });
    }
}

export interface ServerInfo {
    id: string;
    version: string;
    name: string;
    location: string;
}

export interface Container {

}

export interface DroolsKIEOptions {
    baseUrl: string;
    username: string;
    password: string;
}

