import { ProjectGenerator } from '../generator/ProjectGenerator';

ProjectGenerator.buildProject().then(() => {
    console.log('ready');
});
