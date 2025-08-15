/* tslint:disable */
import { Injectable, NgModule } from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface Dictionary<V> {
    [key: string]: V;
}



export class GitlabUser {
    email: string;
    id: number;
    name: string;
    state: string;
    username: string;
    avatar_url: string;
    web_url: string;
}

export class Project {
    id: string;
    name: string;
    userIds: string[];
}

export class SourceCodeDto {
    code: string;
    fileName: string;
    fileUrl: string;
    compilable: boolean;
    stdout: string;
    stderr: string;
}

export class SourceFile {
    id: string;
    fileName: string;
    project: Project;
    code: string;
}

export function registerDefaultSerializers(config: ApinaConfig) {


    config.registerClassSerializer('GitlabUser', {
        'email': 'string',
        'id': 'number',
        'name': 'string',
        'state': 'string',
        'username': 'string',
        'avatar_url': 'string',
        'web_url': 'string'
    });

    config.registerClassSerializer('Project', {
        'id': 'string',
        'name': 'string',
        'userIds': 'string[]'
    });

    config.registerClassSerializer('SourceCodeDto', {
        'code': 'string',
        'fileName': 'string',
        'fileUrl': 'string',
        'compilable': 'boolean',
        'stdout': 'string',
        'stderr': 'string'
    });

    config.registerClassSerializer('SourceFile', {
        'id': 'string',
        'fileName': 'string',
        'project': 'Project',
        'code': 'string'
    });

}

export interface RequestData {
    uriTemplate: string;
    method: string;
    pathVariables?: any;
    requestParams?: any;
    requestBody?: any;
    responseType?: string;
}

export interface Serializer {
    serialize(o: any): any;
    deserialize(o: any): any;
}

const identitySerializer: Serializer = {
    serialize(o) {
        return o;
    },
    deserialize(o) {
        return o;
    }
};

function enumSerializer(enumObject: any): Serializer {
    return {
        serialize(o) {
            if (o === null || o === undefined)
                return o;
            else
                return enumObject[o];
        },
        deserialize(o) {
            if (o === null || o === undefined)
                return o;
            else
                return enumObject[o];
        }
    }
}

interface SerializerMap {
    [name: string]: Serializer;
}

@Injectable()
export class ApinaConfig {

    /** Prefix added for all API calls */
    baseUrl: string = "";

    private serializers: SerializerMap = {
        any: identitySerializer,
        string: identitySerializer,
        number: identitySerializer,
        boolean: identitySerializer
    };

    constructor() {
        registerDefaultSerializers(this);
    }

    serialize(value: any, type: string): any {
        return this.lookupSerializer(type).serialize(value);
    }

    deserialize(value: any, type: string): any {
        return this.lookupSerializer(type).deserialize(value);
    }

    registerSerializer(name: string, serializer: Serializer) {
        this.serializers[name] = serializer;
    }

    registerEnumSerializer(name: string, enumObject: any) {
        this.registerSerializer(name, enumSerializer(enumObject));
    }

    registerClassSerializer(name: string, fields: any) {
        this.registerSerializer(name, this.classSerializer(fields));
    }

    registerIdentitySerializer(name: string) {
        this.registerSerializer(name, identitySerializer);
    }

    private classSerializer(fields: any): Serializer {
        function mapProperties(obj: any, propertyMapper: (value: any, type: string) => any) {
            if (obj === null || obj === undefined) {
                return obj;
            }

            const result: any = {};

            for (const name in fields) {
                if (fields.hasOwnProperty(name)) {
                    const value: any = obj[name];
                    const type: string = fields[name];
                    result[name] = propertyMapper(value, type);
                }
            }

            return result;
        }

        const serialize = this.serialize.bind(this);
        const deserialize = this.deserialize.bind(this);
        return {
            serialize(obj) {
                return mapProperties(obj, serialize);
            },
            deserialize(obj) {
                return mapProperties(obj, deserialize);
            }
        };
    }

    private lookupSerializer(type: string): Serializer {
        if (!type) throw new Error("no type given");

        if (type.indexOf('[]', type.length - 2) !== -1) { // type.endsWith('[]')
            const elementType = type.substring(0, type.length - 2);
            const elementSerializer = this.lookupSerializer(elementType);
            return arraySerializer(elementSerializer);
        }
        const serializer = this.serializers[type];
        if (serializer) {
            return serializer;
        } else {
            throw new Error(`could not find serializer for type '${type}'`);
        }
    }
}

export abstract class ApinaEndpointContext {

    constructor(protected config: ApinaConfig) {
    }

    abstract request(data: RequestData): Observable<any>

    serialize(value: any, type: string): any {
        return this.config.serialize(value, type);
    }

    deserialize(value: any, type: string): any {
        return this.config.deserialize(value, type);
    }

    protected buildUrl(uriTemplate: String, pathVariables: any): string {
        return this.config.baseUrl + uriTemplate.replace(/{([^}]+)}/g, (match, name) => pathVariables[name]);
    }
}

@Injectable()
export class DefaultApinaEndpointContext extends ApinaEndpointContext {

    constructor(private httpClient: HttpClient, config: ApinaConfig) {
        super(config);
    }

    request(data: RequestData): Observable<any> {
        const url = this.buildUrl(data.uriTemplate, data.pathVariables);

        const requestParams = data.requestParams;
        let params: HttpParams | undefined = undefined;
        if (requestParams != null) {
            const filteredParams: { [key: string]: any }  = {};
            for (const key of Object.keys(requestParams)) {
                const value = requestParams[key];
                if (value != null)
                    filteredParams[key] = value;
            }

            params = new HttpParams({fromObject: filteredParams});
        }


        return this.httpClient.request(data.method, url, { params: params, body: data.requestBody })
            .pipe(map(r => data.responseType ? this.config.deserialize(r, data.responseType) : r));
    }
}

function arraySerializer(elementSerializer: Serializer): Serializer {
    function safeMap(value: any[], mapper: (a: any) => any) {
        if (!value)
            return value;
        else
            return value.map(mapper);
    }

    return {
        serialize(value) {
            return safeMap(value, elementSerializer.serialize.bind(elementSerializer));
        },
        deserialize(value) {
            return safeMap(value, elementSerializer.deserialize.bind(elementSerializer));
        }
    }
}

@Injectable()
export class DarkModeEndpoint {
    constructor(private context: ApinaEndpointContext) {
    }

    darkModeEnabled(): Observable<boolean> {
        return this.context.request({
            'uriTemplate': '/dark-mode/',
            'method': 'GET',
            'responseType': 'boolean'
        });
    }

    toggleDarkMode(): Observable<void> {
        return this.context.request({
            'uriTemplate': '/dark-mode/toggle',
            'method': 'GET'
        });
    }

}

@Injectable()
export class ProjectEndpoint {
    constructor(private context: ApinaEndpointContext) {
    }

    getProjects(): Observable<Project[]> {
        return this.context.request({
            'uriTemplate': '/project/',
            'method': 'GET',
            'responseType': 'Project[]'
        });
    }

    createProject(project: Project): Observable<Project> {
        return this.context.request({
            'uriTemplate': '/project/',
            'method': 'POST',
            'requestBody': this.context.serialize(project, 'Project'),
            'responseType': 'Project'
        });
    }

    getProject(projectId: string): Observable<Project> {
        return this.context.request({
            'uriTemplate': '/project/{projectId}',
            'method': 'GET',
            'pathVariables': {
                'projectId': this.context.serialize(projectId, 'string')
            },
            'responseType': 'Project'
        });
    }

    updateProject(projectId: string, project: Project): Observable<Project> {
        return this.context.request({
            'uriTemplate': '/project/{projectId}',
            'method': 'PUT',
            'pathVariables': {
                'projectId': this.context.serialize(projectId, 'string')
            },
            'requestBody': this.context.serialize(project, 'Project'),
            'responseType': 'Project'
        });
    }

    deleteProject(projectId: string): Observable<void> {
        return this.context.request({
            'uriTemplate': '/project/{projectId}',
            'method': 'DELETE',
            'pathVariables': {
                'projectId': this.context.serialize(projectId, 'string')
            }
        });
    }

    getFilesForProject(projectId: string): Observable<SourceFile[]> {
        return this.context.request({
            'uriTemplate': '/project/{projectId}/file',
            'method': 'GET',
            'pathVariables': {
                'projectId': this.context.serialize(projectId, 'string')
            },
            'responseType': 'SourceFile[]'
        });
    }

    addFileToProject(projectId: string, sourceFile: SourceFile): Observable<SourceFile> {
        return this.context.request({
            'uriTemplate': '/project/{projectId}/file',
            'method': 'POST',
            'pathVariables': {
                'projectId': this.context.serialize(projectId, 'string')
            },
            'requestBody': this.context.serialize(sourceFile, 'SourceFile'),
            'responseType': 'SourceFile'
        });
    }

    shareProjectWithUser(projectId: string, user: GitlabUser): Observable<Project> {
        return this.context.request({
            'uriTemplate': '/project/{projectId}/share',
            'method': 'PUT',
            'pathVariables': {
                'projectId': this.context.serialize(projectId, 'string')
            },
            'requestBody': this.context.serialize(user, 'GitlabUser'),
            'responseType': 'Project'
        });
    }

}

@Injectable()
export class SourceFileEndpoint {
    constructor(private context: ApinaEndpointContext) {
    }

    updateFile(fileId: string, sourceFile: SourceFile): Observable<SourceFile> {
        return this.context.request({
            'uriTemplate': '/file/{fileId}',
            'method': 'PUT',
            'pathVariables': {
                'fileId': this.context.serialize(fileId, 'string')
            },
            'requestBody': this.context.serialize(sourceFile, 'SourceFile'),
            'responseType': 'SourceFile'
        });
    }

    deleteFile(fileId: string): Observable<void> {
        return this.context.request({
            'uriTemplate': '/file/{fileId}',
            'method': 'DELETE',
            'pathVariables': {
                'fileId': this.context.serialize(fileId, 'string')
            }
        });
    }

}

@Injectable()
export class CompilerEndpoint {
    constructor(private context: ApinaEndpointContext) {
    }

    compile(sourceCode: SourceCodeDto): Observable<SourceCodeDto> {
        return this.context.request({
            'uriTemplate': '/compile/',
            'method': 'POST',
            'requestBody': this.context.serialize(sourceCode, 'SourceCodeDto'),
            'responseType': 'SourceCodeDto'
        });
    }

    getLanguages(): Observable<string[]> {
        return this.context.request({
            'uriTemplate': '/compile/langs',
            'method': 'GET',
            'responseType': 'string[]'
        });
    }

}

@Injectable()
export class AuthEndpoint {
    constructor(private context: ApinaEndpointContext) {
    }

}


@NgModule({
    imports: [HttpClientModule],
    providers: [
        DarkModeEndpoint,
        ProjectEndpoint,
        SourceFileEndpoint,
        CompilerEndpoint,
        AuthEndpoint,
        { provide: ApinaEndpointContext, useClass: DefaultApinaEndpointContext },
        ApinaConfig
    ]
})
export class ApinaModule {}
export type MultipartFile = {};
