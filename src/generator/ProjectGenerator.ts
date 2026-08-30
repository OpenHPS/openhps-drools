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
        if (module === undefined || module === null) {
            // Use cache instead
            Object.values(require.cache).map((m) => this.loadModules(objects, m));
            return;
        }
        this._modules.add(module.id);
        // Walking require.cache reaches entries that have no exports object -- a module
        // still being evaluated, or one the coverage instrumentation registered. That
        // made Object.keys() throw "Cannot convert undefined or null to object", so the
        // suite passed under `npm test` and failed under `npm run cover:ci`.
        Object.keys(module.exports ?? {}).forEach((key) => {
            const childModule = module.exports[key];
            if (objects.includes(childModule)) {
                childModule.prototype._module = this.findModule(path.dirname(require.resolve(module.id)));
            }
        });
        (module.children ?? []).forEach((module) => {
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
                        const packageDir = path.join(srcDir, ...value[0].split('.'));
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
                            // The server must be closed on every path. Rejecting without
                            // closing left port 7000 listening, which kept the Node event
                            // loop alive: the CI job sat for the full 60 minute cap after
                            // mocha had already reported and uploaded its results.
                            const finish = (err?: Error) => {
                                repos
                                    .close()
                                    .then(() => (err ? reject(err) : resolve()))
                                    .catch(() => (err ? reject(err) : resolve()));
                            };
                            exec(
                                // Identity is passed per-command: a CI runner has no
                                // global user.name/user.email, so `git commit` failed
                                // there and took the whole suite down with it.
                                'git init && ' +
                                    'git add . && ' +
                                    'git -c user.name="OpenHPS CI" -c user.email="ci@openhps.org" ' +
                                    'commit -m "Initial commit" && ' +
                                    'git push http://localhost:7000/project master',
                                {
                                    cwd: projectDir,
                                },
                                (err) => finish(err ?? undefined),
                            );
                        },
                    );
                })
                .catch(reject);
        });
    }
}
