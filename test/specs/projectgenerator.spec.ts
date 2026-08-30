import 'mocha';
import { expect } from 'chai';
import { ProjectGenerator } from '../../src/generator/ProjectGenerator';
import '@openhps/geospatial';

describe('ProjectGenerator', () => {
    describe('loadClasses()', () => {
        it('should load all relevant objects', (done) => {
            expect(ProjectGenerator.loadClasses().length).to.be.greaterThan(10);
            done();
        });
    });

    describe('generateJavaClasses()', () => {
        it('should generate a java class array', (done) => {
            ProjectGenerator.generateJavaClasses().then((classes) => {
                expect(classes.size).to.be.greaterThan(10);
                done();
            });
        });
    });

    describe('buildProject()', () => {
        it('should generate a git project', (done) => {
            // Without the catch a rejection never called done(), so a real failure was
            // reported as a bare 20s timeout naming the file rather than the cause.
            ProjectGenerator.buildProject()
                .then(() => done())
                .catch(done);
        });
    });
});
