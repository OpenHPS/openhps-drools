import 'mocha';
import { expect } from 'chai';
import { DroolsService } from '../../src/services/DroolsService';

describe('DroolsService', () => {
    const service = new DroolsService({
        kie: {
            baseUrl: 'http://localhost/kie-server',
            username: 'admin',
            password: 'admin',
        },
        // Keep the reachability probe short: CI has no KIE server, and an
        // unanswered request must not outlive the check that abandoned it.
        timeout: 2000,
        workbench: {
            baseUrl: 'http://localhost/business-central',
            username: 'admin',
            password: 'admin',
        },
    });

    // These are integration tests against a live Drools KIE server and Business
    // Central on localhost. There is no such server in CI, and the hook had no
    // rejection handler, so an unreachable server surfaced as a 20s timeout rather
    // than as what it is. Skip the suite instead, and keep it running for anyone
    // who does have the stack up.
    before(async function () {
        // findAllSpaces() hangs rather than rejecting when nothing is listening, so
        // the reachability check needs its own deadline.
        let timer: NodeJS.Timeout;
        const reachable = await Promise.race([
            service
                .findAllSpaces()
                .then((spaces) => spaces)
                .catch(() => undefined),
            new Promise<undefined>((resolve) => {
                // unref'd so this timer alone cannot hold the process open.
                timer = setTimeout(() => resolve(undefined), 2000);
                timer.unref();
            }),
        ]);
        clearTimeout(timer);
        if (reachable === undefined) {
            this.skip();
        }
        await Promise.all(reachable.map((space) => service.deleteSpace(space.name)));
    });

    describe('info()', () => {
        it('should return a version number', (done) => {
            service
                .info()
                .then((info) => {
                    expect(info.version).to.not.be.undefined;
                    done();
                })
                .catch(done);
        });
    });

    describe('createProject()', () => {
        before((done) => {
            service
                .createSpace({
                    name: 'Test1',
                    owner: 'admin',
                    defaultGroupId: 'org.openhps',
                    description: 'This is a test',
                })
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('should clone a project from git', (done) => {
            service
                .createProject('Test1', {
                    name: 'OpenHPS',
                    groupId: 'org.openhps',
                    version: '1.0.0',
                })
                .then(() => {
                    done();
                })
                .catch(done);
        });
    });

    describe('createSpace()', () => {
        it('should create a new space', (done) => {
            service
                .createSpace({
                    name: 'Test',
                    owner: 'admin',
                    defaultGroupId: 'org.openhps',
                    description: 'This is a test',
                })
                .then(() => {
                    done();
                })
                .catch(done);
        });
    });

    describe('findAllContainers()', () => {
        before((done) => {
            service
                .createSpace({
                    name: 'Test2',
                    owner: 'admin',
                    defaultGroupId: 'org.openhps',
                    description: 'This is a test',
                })
                .then(() => {
                    return service.createProject('Test2', {
                        name: 'OpenHPS',
                        groupId: 'org.openhps',
                        version: '1.0.0',
                    });
                })
                .then(() => {
                    return service.createContainer({
                        artifactId: 'OpenHPS-Drools',
                        groupId: 'org.openhps',
                        id: 'testcontainer',
                        version: '1.0.0-SNAPSHOT',
                    });
                })
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('should find all containers', (done) => {
            service
                .findAllContainers()
                .then((containers) => {
                    console.log(containers);
                    done();
                })
                .catch(done);
        });
    });
});
