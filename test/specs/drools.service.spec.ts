import 'mocha';
import { expect } from 'chai';
import { DroolsKIEService } from '../../src/services/DroolsKIEService';

describe('DroolsKIEService', () => {
    const service = new DroolsKIEService({
        baseUrl: "http://localhost/kie-server",
        username: "admin",
        password: "admin"
    });

    describe('info()', () => {
        it('should return a version number', (done) => {
            service.info().then(info => {
                expect(info.version).to.not.be.undefined;
                done();
            }).catch(done);
        });
    });
});
