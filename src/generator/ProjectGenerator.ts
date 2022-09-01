import { DataSerializer, DataSerializerUtils, ObjectMetadata, Serializable } from '@openhps/core';
import { Project } from '../services/DroolsService';
import { DataObjectGenerator } from './DataObjectGenerator';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { Git } from 'node-git-server';

export class ProjectGenerator extends DataSerializer {
    private static _modules: Set<string> = new Set();

    static findModule(dir: string): string {
        const packageFile = path.join(dir, 'package.json');
        if (fs.existsSync(packageFile)) {
            const packageJson = JSON.parse(fs.readFileSync(packageFile, { encoding: 'utf-8' }));
            return packageJson.name;
        } else {
            const completeDir = dir.split(path.sep);
            completeDir.pop();
            return this.findModule(completeDir.join(path.sep));
        }
    }

    static loadModules(objects: Array<Serializable<any>>, module: NodeModule = require.main) {
        if (module === undefined) {
            // Use cache instead
            Object.values(require.cache).map((m) => this.loadModules(objects, m));
            return;
        }
        this._modules.add(module.id);
        Object.keys(module.exports).forEach((key) => {
            const childModule = module.exports[key];
            if (objects.includes(childModule)) {
                childModule.prototype._module = this.findModule(path.dirname(require.resolve(module.id)));
            }
        });
        module.children.forEach((module) => {
            if (!this._modules.has(module.id)) {
                this.loadModules(objects, module);
            }
        });
    }

    static loadClasses(): Array<ObjectMetadata> {
        const declarations: Array<ObjectMetadata> = [];
        this.knownTypes.forEach((value) => {
            const metadata = DataSerializerUtils.getOwnMetadata(value);
            const metadataClone = { ...metadata };
            if (metadata) {
                const superConstructor = Object.getPrototypeOf(metadata.classType);
                const superMetadata = DataSerializerUtils.getRootMetadata(superConstructor);
                if (superMetadata) {
                    superMetadata.dataMembers.forEach((_, key) => {
                        metadataClone.dataMembers.delete(key);
                    });
                }
                declarations.push(metadataClone as ObjectMetadata);
            }
        });
        this.loadModules(declarations.map((d) => d.classType));
        return declarations;
    }

    static generateJavaClasses(): Promise<Map<string, [string, string]>> {
        return new Promise((resolve) => {
            const classes = new Map();
            this.loadClasses().forEach((objectMetadata) => {
                const javaClass = DataObjectGenerator.createJavaClass(objectMetadata);
                classes.set(objectMetadata.classType.name, javaClass);
            });
            resolve(classes);
        });
    }

    static buildProject(): Promise<void> {
        return new Promise((resolve, reject) => {
            const tmpDir = path.join(__dirname, '../../tmp');
            const projectDir = path.join(tmpDir, 'project');
            const reposDir = path.join(tmpDir, 'repos');
            const srcDir = path.join(projectDir, 'src/main/java/');
            const templateDir = path.join(__dirname, '../../template');

            // Prepare directories
            if (fs.existsSync(tmpDir)) {
                fs.rmSync(tmpDir, { recursive: true });
            }
            fs.mkdirSync(tmpDir, { recursive: true });
            // Copy template
            fs.copySync(templateDir, projectDir);

            // Get all class sources
            ProjectGenerator.generateJavaClasses()
                .then((classes) => {
                    classes.forEach((value, key) => {
                        const packageDir = path.join(srcDir, ...value[0].split("."));
                        if (!fs.existsSync(packageDir)) {
                            fs.mkdirsSync(packageDir);
                        }
                        fs.writeFileSync(path.join(packageDir, key + '.java'), value[1], {
                            encoding: 'utf-8',
                        });
                    });

                    const repos = new Git(reposDir, {
                        autoCreate: true,
                    });
                    repos.listen(
                        7000,
                        {
                            type: 'http',
                        },
                        () => {
                            exec(
                                'git init && ' +
                                    'git add . && ' +
                                    'git commit -m "Initial commit" && ' +
                                    'git push http://localhost:7000/project master',
                                {
                                    cwd: projectDir,
                                },
                                (err) => {
                                    if (err) {
                                        return reject(err);
                                    }
                                    repos
                                        .close()
                                        .then(() => {
                                            resolve();
                                        })
                                        .catch(reject);
                                },
                            );
                        },
                    );
                })
                .catch(reject);
        });
    }
}
