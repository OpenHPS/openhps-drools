import 'mocha';
import { expect } from 'chai';
import { DataObjectGenerator } from '../../src/generator/DataObjectGenerator';
import { DataObject, DataSerializerUtils } from '@openhps/core';

describe('DataObjectGenerator', () => {
    describe('loadClasses()', () => {
        it('should generate a java class', (done) => {
            const javaClass = DataObjectGenerator.createJavaClass(
                DataSerializerUtils.getMetadata(DataObject));
            done();
        });
    });
});
