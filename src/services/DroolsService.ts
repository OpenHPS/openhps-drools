import { Service } from '@openhps/core';
import axios, { AxiosRequestConfig } from 'axios';
import { Git } from 'node-git-server';
import * as path from 'path';
import { Command } from '../commands/Command';

/**
 * Drools KIE service is a service to connect to a Drools server.
 */
export class DroolsService extends Service {
    readonly INFO = '/services/rest/server/';
    readonly CONTAINERS = '/services/rest/server/containers/';
    readonly SPACES = '/rest/spaces/';
    readonly JOBS = '/rest/jobs/';
    protected options: DroolsOptions;

    constructor(options?: DroolsOptions) {
        super();
        this.options = options;
    }

    protected get kieOptions(): AxiosRequestConfig {
        return {
            baseURL: this.options.kie.baseUrl,
            auth: {
                username: this.options.kie.username,
                password: this.options.kie.password,
            },
            headers: {
                'Content-Type': 'application/json',
                'X-KIE-ContentType': 'JSON',
                Accept: 'application/json',
            },
        };
    }

    protected get workbenchOptions(): AxiosRequestConfig {
        return {
            baseURL: this.options.workbench.baseUrl,
            auth: {
                username: this.options.workbench.username,
                password: this.options.workbench.password,
            },
            headers: {
                'Content-Type': 'application/json',
                'X-KIE-ContentType': 'JSON',
                Accept: 'application/json',
            },
        };
    }

    /**
     * Find all spaces
     *
     * @returns {Promise<Space[]>} Promise of all spaces
     */
    findAllSpaces(): Promise<Space[]> {
        return new Promise((resolve, reject) => {
            axios
                .get(this.SPACES, this.workbenchOptions)
                .then((result) => {
                    resolve(result.data);
                })
                .catch(reject);
        });
    }

    findSpaceByName(name: string): Promise<any> {
        return new Promise((resolve, reject) => {
            axios
                .get(this.SPACES + name, this.workbenchOptions)
                .then((result) => {
                    if (result.data.type === 'SUCCESS') {
                    } else {
                        reject(result.data.msg);
                    }
                })
                .catch(reject);
        });
    }

    createSpace(space: Space): Promise<Space> {
        return new Promise((resolve, reject) => {
            axios
                .post(this.SPACES, space, this.workbenchOptions)
                .then((result) => {
                    if (result.data.status === 'APPROVED') {
                        this.awaitJob(result.data.jobId)
                            .then(() => {
                                resolve(space);
                            })
                            .catch(reject);
                    } else {
                        reject(new Error(result.data.status));
                    }
                })
                .catch(reject);
        });
    }

    deleteSpace(spaceName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            axios
                .delete(this.SPACES + spaceName, this.workbenchOptions)
                .then((result) => {
                    if (result.data.status === 'APPROVED') {
                        this.awaitJob(result.data.jobId)
                            .then(() => {
                                resolve();
                            })
                            .catch(reject);
                    } else {
                        reject(new Error(result.data.status));
                    }
                })
                .catch(reject);
        });
    }

    createProject(spaceName: string, project: Project): Promise<Project> {
        return new Promise((resolve, reject) => {
            const tmpDir = path.join(__dirname, '../../tmp');
            const reposDir = path.join(tmpDir, 'repos');
            const repos = new Git(reposDir);

            repos.listen(
                7000,
                {
                    type: 'http',
                },
                () => {
                    axios
                        .post(
                            this.SPACES + spaceName + `/git/clone`,
                            {
                                name: 'OpenHPS',
                                description: 'OpenHPS Drools',
                                gitURL: 'http://host.docker.internal:7000/project',
                            },
                            this.workbenchOptions,
                        )
                        .then((result) => {
                            if (result.data.status === 'APPROVED') {
                                return this.awaitJob(result.data.jobId);
                            } else {
                                repos.close();
                                reject(new Error(result.data.status));
                            }
                        })
                        .then(() => {
                            return repos.close();
                        })
                        .then(() => {
                            resolve(project);
                        })
                        .catch((err) => {
                            repos.close();
                            reject(err);
                        });
                },
            );
        });
    }

    /**
     * Find all containers on the KIE server
     *
     * @returns {Container[]} Array with containers
     */
    findAllContainers(): Promise<Container[]> {
        return new Promise((resolve, reject) => {
            axios
                .get(this.CONTAINERS, this.kieOptions)
                .then((result) => {
                    if (result.data.type === 'SUCCESS') {
                        console.log(result.data.result['kie-containers']);
                        resolve(result.data.result['kie-containers']);
                    } else {
                        reject(result.data.msg);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Find a container by ID
     *
     * @param {string} id Container ID
     * @returns {Promise<Container>} Promise of a container if found
     */
    findContainerById(id: string): Promise<Container> {
        return new Promise((resolve, reject) => {
            axios
                .get(this.CONTAINERS + id, this.kieOptions)
                .then((result) => {
                    if (result.data.type === 'SUCCESS') {
                        resolve(result.data);
                    } else {
                        reject(result.data.msg);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Delete a container by ID
     *
     * @param {string} id Container ID
     * @returns {Promise<void>} Promise if the container is deleted
     */
    deleteContainer(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            axios
                .delete(this.CONTAINERS + id, this.kieOptions)
                .then((result) => {
                    if (result.data.type === 'SUCCESS') {
                        resolve();
                    } else {
                        reject(result.data.msg);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Create a new container
     *
     * @param {Container} container Container to create
     * @returns {Promise<Container>} Promise of the saved container
     */
    createContainer(container: Container): Promise<Container> {
        return new Promise((resolve, reject) => {
            axios
                .put(
                    this.CONTAINERS + container.id,
                    {
                        'container-id': container.id,
                        'release-id': {
                            'artifact-id': container.artifactId,
                            'group-id': container.groupId,
                            'version': container.version,
                        },
                    },
                    this.kieOptions,
                )
                .then((result) => {
                    if (result.data.type === 'SUCCESS') {
                        resolve(result.data);
                    } else {
                        reject(result.data.msg);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Find a job by id
     *
     * @param {string} jobId Job identifier
     * @returns {Promise<Job>} Promise of a job
     */
    findJob(jobId: string): Promise<Job> {
        return new Promise((resolve, reject) => {
            axios
                .get(this.JOBS + jobId, this.workbenchOptions)
                .then((result) => {
                    resolve(result.data);
                })
                .catch(reject);
        });
    }

    /**
     * Delete a job
     *
     * @param {string} jobId Job identifier
     * @returns {Promise<Job>} Job result
     */
    deleteJob(jobId: string): Promise<Job> {
        return new Promise((resolve, reject) => {
            axios
                .delete(this.JOBS + jobId, this.workbenchOptions)
                .then((result) => {
                    resolve(result.data);
                })
                .catch(reject);
        });
    }

    /**
     * Execute a Kie Session command
     *
     * @param {string} containerId Container ID to execute command on
     * @param {Command[]} commands Command(s) to execute
     * @returns 
     */
    executeCommand(containerId: string, ... commands: Command[]): Promise<void> {
        return new Promise((resolve, reject) => {
            axios.post(this.CONTAINERS + "instances/" + containerId, {
                commands: commands.map(command => command.toJSON())
            }).then((result) => {
                resolve(result.data);
            })
            .catch(reject);
        });
    }

    /**
     * Wait for a job to finish or fail
     *
     * @param {string} jobId Job identifier
     * @returns
     */
    protected awaitJob(jobId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const service = this;
            /**
             *
             */
            function checkStatus() {
                setTimeout(() => {
                    service
                        .findJob(jobId)
                        .then((job) => {
                            switch (job.status) {
                                case 'SUCCESS':
                                    return resolve(job.status);
                                case 'BAD_REQUEST':
                                case 'FAIL':
                                    return reject(new Error(job.result));
                                default:
                                    checkStatus();
                            }
                        })
                        .catch(reject);
                }, 1000);
            }
            checkStatus();
        });
    }

    /**
     * Get server information from the Drools KIE server
     *
     * @returns {ServerInfo} Server information
     */
    info(): Promise<ServerInfo> {
        return new Promise((resolve, reject) => {
            axios
                .get(this.INFO, this.kieOptions)
                .then((result) => {
                    if (result.data.type === 'SUCCESS') {
                        resolve(result.data.result['kie-server-info']);
                    } else {
                        reject(result.data.msg);
                    }
                })
                .catch(reject);
        });
    }
}

/**
 * KIE Server information
 */
export interface ServerInfo {
    /**
     * Server identifier
     */
    id: string;
    /**
     * KIE server version
     */
    version: string;
    /**
     * KIE server name
     */
    name: string;
    /**
     * KIE server URL
     */
    location: string;
}

export interface Container {
    id: string;
    /**
     * Container artifact id
     */
    artifactId: string;
    /**
     * Container group id
     */
    groupId: string;
    /**
     * Container version
     */
    version: string;
}

export interface DroolsOptions {
    kie: {
        baseUrl: string;
        username: string;
        password: string;
    };
    workbench: {
        baseUrl: string;
        username: string;
        password: string;
    };
}

export interface Space {
    owner: string;
    name: string;
    description: string;
    defaultGroupId: string;
}

export interface Project {
    /**
     * Name of the project (artifactId)
     */
    name: string;
    /**
     * Group identifier of the project
     */
    groupId: string;
    /**
     * Version of the project
     */
    version: string;
    publicURIs?: string[];
}

export interface Job {
    jobId: string;
    status: string;
    lastModified: number;
    result?: string;
}
