import 'mocha';
import { expect } from 'chai';
import { DroolsService } from '../../src/services/DroolsService';

describe('DroolsService', () => {
    const service = new DroolsService({
        kie: {
            baseUrl: "http://localhost/kie-server",
            username: "admin",
            password: "admin"
        },
        workbench: {
            baseUrl: "http://localhost/business-central",
            username: "admin",
            password: "admin"
        }
    });

    before((done) => {
        service.findAllSpaces().then(spaces => {
            return Promise.all(spaces.map(space => service.deleteSpace(space.name)));
        }).then(() => {
            done();
        });
    });

    describe('info()', () => {
        it('should return a version number', (done) => {
            service.info().then(info => {
                expect(info.version).to.not.be.undefined;
                done();
            }).catch(done);
        });
    });

    describe('createProject()', () => {
        
        before((done) => {
            service.createSpace({
                name: "Test1",
                owner: "admin",
                defaultGroupId: "org.openhps",
                description: "This is a test"
            }).then(() => {
                done();
            }).catch(done);
        });

        it('should clone a project from git', (done) => {
            service.createProject("Test1", {
                name: 'OpenHPS',
                groupId: 'org.openhps',
                version: '1.0.0',
            }).then(() => {
                done();
            }).catch(done);
        });

    });

    describe('createSpace()', () => {
        
        it('should create a new space', (done) => {
            service.createSpace({
                name: "Test",
                owner: "admin",
                defaultGroupId: "org.openhps",
                description: "This is a test"
            }).then(() => {
                done();
            }).catch(done);
        });

    });

    describe('findAllContainers()', () => {
        before(done => {
            service.createSpace({
                name: "Test2",
                owner: "admin",
                defaultGroupId: "org.openhps",
                description: "This is a test"
            }).then(() => {
                return service.createProject("Test2", {
                    name: 'OpenHPS',
                    groupId: 'org.openhps',
                    version: '1.0.0',
                });
            }).then(() => {
                return service.createContainer({
                    artifactId: "OpenHPS-Drools",
                    groupId: "org.openhps",
                    id: "testcontainer",
                    version: "1.0.0-SNAPSHOT"
                });
            }).then(() => {
                done();
            }).catch(done);
        });

        it('should find all containers', (done) => {
            service.findAllContainers().then(containers => {
                console.log(containers);
                done();
            }).catch(done);
        });
    });
});
