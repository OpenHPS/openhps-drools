import {
    ArrayTypeDescriptor,
    ConcreteTypeDescriptor,
    DataSerializerUtils,
    ObjectMetadata,
    SerializableMemberOptions,
    TypeDescriptor,
} from '@openhps/core';
import { Project } from '..';

/**
 * Decision manager Data Object asset generator.
 */
export class DataObjectGenerator {
    protected static javaTypeMapping(type: TypeDescriptor): string {
        switch (type.ctor) {
            case String:
                return 'java.lang.String';
            case Number:
                return 'java.lang.Double';
            case Boolean:
                return 'java.lang.Boolean';
            case Object:
            case Function:
                return 'java.lang.Object';
            case Array:
                return `java.util.List<${this.javaTypeMapping((type as ArrayTypeDescriptor).elementType)}>`;
            case Map:
            case Set:
                // Non-serializable types
                return undefined;
            default:
                if (type.ctor.name !== '') {
                    const packageStr =
                        `org.openhps.` +
                        (type.ctor.prototype._module && type.ctor.prototype._module.startsWith('@openhps/')
                            ? type.ctor.prototype._module.split('/')[1]
                            : 'drools');
                    return `${packageStr}.${type.ctor.name}`;
                }
        }
        return undefined;
    }

    static createJavaClass(object: ObjectMetadata, version = 1): [string, string] {
        // Get super class
        const superConstructor = Object.getPrototypeOf(object.classType);
        const metadata = DataSerializerUtils.getOwnMetadata(superConstructor);
        const superClass = metadata ? this.javaTypeMapping(new ConcreteTypeDescriptor(superConstructor)) : undefined;
        const dataMembers = Array.from(object.dataMembers.values());
        const hasPrimaryKey =
            dataMembers.filter((member) => (member.options as SerializableMemberOptions).primaryKey).length > 0 ||
            superClass !== undefined;
        const packageStr =
            `org.openhps.` +
            (object.classType.prototype._module && object.classType.prototype._module.startsWith('@openhps/')
                ? object.classType.prototype._module.split('/')[1]
                : 'drools');

        return [packageStr, (
            `package ${packageStr};\n\n` +
            `/**\n` +
            ` * Generated using @openhps/drools\n` +
            ` **/\n` +
            `@javax.persistence.Entity\n` +
            `@javax.persistence.Table(name = "${object.classType.name}")\n` +
            `public class ${object.classType.name}${
                superClass ? ` extends ${superClass}` : ''
            } implements java.io.Serializable {\n` +
            `	static final long serialVersionUID = ${version}L;\n\n` +
            (!hasPrimaryKey
                ? `	@javax.persistence.GeneratedValue(strategy = javax.persistence.GenerationType.AUTO, generator = "${object.classType.name.toUpperCase()}_ID_GENERATOR")\n` +
                  `	@javax.persistence.Id\n` +
                  `	@javax.persistence.SequenceGenerator(name = "${object.classType.name.toUpperCase()}_ID_GENERATOR", sequenceName = "${object.classType.name.toUpperCase()}_ID_SEQ")\n` +
                  `	private java.lang.Long id;\n\n`
                : ``) +
            dataMembers
                .map((member) => {
                    const type = this.javaTypeMapping(member.type());
                    if (!type) {
                        return undefined;
                    }
                    const options: SerializableMemberOptions = member.options;
                    return (
                        `\t@org.kie.api.definition.type.Label(value = "${member.name}")\n` +
                        (options.primaryKey ? `\t@javax.persistence.Id\n` : ``) +
                        (options.unique ? `\t@javax.persistence.Column(unique = true)` : ``) +
                        `\tprivate ${type} ${member.name};`
                    );
                })
                .filter((value) => value !== undefined)
                .join('\n') +
            `\n\n` +
            dataMembers
                .map((member) => {
                    const type = this.javaTypeMapping(member.type());
                    if (!type) {
                        return undefined;
                    }
                    const functionName = member.name.substring(0, 1).toUpperCase() + member.name.substring(1);
                    return (
                        `\tpublic ${type} get${functionName}() {\n` +
                        `\t\treturn this.${member.name};\n` +
                        `\t}\n\n` +
                        `\tpublic void set${functionName}(${type} ${member.name}) {\n` +
                        `\t\tthis.${member.name} = ${member.name};\n` +
                        `\t}\n`
                    );
                })
                .filter((value) => value !== undefined)
                .join('\n') +
            `\n` +
            `}`
        )];
    }
}
