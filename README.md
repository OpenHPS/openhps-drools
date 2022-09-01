<h1 align="center">
  <img alt="OpenHPS" src="https://openhps.org/images/logo_text-512.png" width="40%" /><br />
  @openhps/core
</h1>
<p align="center">
    <a href="https://github.com/OpenHPS/openhps-drools-kie/actions/workflows/main.yml" target="_blank">
        <img alt="Build Status" src="https://github.com/OpenHPS/openhps-drools-kie/actions/workflows/main.yml/badge.svg">
    </a>
    <a href="https://codecov.io/gh/OpenHPS/openhps-drools-kie">
        <img src="https://codecov.io/gh/OpenHPS/openhps-drools-kie/branch/master/graph/badge.svg"/>
    </a>
    <a href="https://codeclimate.com/github/OpenHPS/openhps-drools-kie/" target="_blank">
        <img alt="Maintainability" src="https://img.shields.io/codeclimate/maintainability/OpenHPS/openhps-core">
    </a>
    <a href="https://badge.fury.io/js/@openhps%2Fdrools-kie">
        <img src="https://badge.fury.io/js/@openhps%2Fdrools-kie.svg" alt="npm version" height="18">
    </a>
    <a href="https://app.fossa.com/projects/git%2Bgithub.com%2FOpenHPS%2Fopenhps-drools-kie?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2FOpenHPS%2Fopenhps-drools-kie.svg?type=shield"/></a>
</p>

<h3 align="center">
    <a href="https://openhps.org/docs/getting-started">Getting Started</a> &mdash; <a href="https://openhps.org/docs/examples">Examples</a> &mdash; <a href="https://openhps.org/docs/drools-kie">API</a>
</h3>

<br />

OpenHPS is a open source hybrid positioning system that offers multiple modules for creating a production ready positioning system.

This repository contains the Drools KIE client component for OpenHPS. Drools is a Business Rules Management System (BRMS) solution with a REST API server to trigger events. This module will create custom events that can trigger rules configured on a KIE server.

## Getting Started
If you have [npm installed](https://www.npmjs.com/get-npm), start using @openhps/drools-kie with the following command.
```bash
npm install @openhps/drools --save
```

## Usage

```ts
ModelBuilder.create()
    .addService(new DroolsKIEService({
        baseUrl: "http://localhost/kie-server",
        username: "admin",
        password: "admin"
    }))
    .build();
```

## Contributors
The framework is open source and is mainly developed by PhD Student Maxim Van de Wynckel as part of his research towards *Hybrid Positioning and Implicit Human-Computer Interaction* under the supervision of Prof. Dr. Beat Signer.

## Contributing
Use of OpenHPS, contributions and feedback is highly appreciated. Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## License
Copyright (C) 2019-2022 Maxim Van de Wynckel & Vrije Universiteit Brussel

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.