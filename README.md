# ka-mensa-api

[![CI](https://github.com/meyfa/ka-mensa-api/actions/workflows/main.yml/badge.svg)](https://github.com/meyfa/ka-mensa-api/actions/workflows/main.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9b1f9ce6f3bec49c26a1/test_coverage)](https://codeclimate.com/github/meyfa/ka-mensa-api/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/9b1f9ce6f3bec49c26a1/maintainability)](https://codeclimate.com/github/meyfa/ka-mensa-api/maintainability)


## Introduction

`ka-mensa-api` is one component in a three-part project whose goal it is to
aggregate, process and visualize the Studierendenwerk Karlsruhe's canteen plans
in ways superior to the official sources.

**Disclaimer:** This project is neither affiliated with nor endorsed by the
Studierendenwerk Karlsruhe or the Karlsruhe Institute of Technology.

The entire project is written in JavaScript+TypeScript and is composed as follows:

- [ka-mensa-fetch](https://github.com/meyfa/ka-mensa-fetch): library package
    responsible for the fetching of raw plan data and conversion into canonical,
    easily digestible JSON documents
- [ka-mensa-api](https://github.com/meyfa/ka-mensa-api): NodeJS server that
    utilizes the fetcher to continuously collect meal plans and makes them
    available via REST API
- [ka-mensa-ui](https://github.com/meyfa/ka-mensa-ui): single-page web app
    that loads meal plans from an API instance and displays them in a modern,
    responsive interface with filtering and color-coding capabilities


## Setup (standard)

### Prerequisites

Ensure Node and NPM are available on your system. Then clone this repository
somewhere and run `npm install` to load dependencies.

### Configuration

Open up `src/config.ts` and configure to your liking. Notice that network options
are rather limited. If you want HTTPS support or advanced embedding into existing
domain structures, you will need to set up a reverse proxy, such as nginx.

You might want to change the plan fetch source. This will not impact the API
behavior but only how data is retrieved. There are two options available:

- `'simplesite'` (the default)
- `'jsonapi'`

The simplesite source fetches plans from the Studierendenwerk's website, which
offers a view for the visually impaired that is quite easy to parse. It allows
for fetching plans far into the future and is relatively stable. That said, this
still breaks sometimes, e.g. when the Studierendenwerk renames lines or takes
other unpredictable actions.

The JSON API source is more reliable. It will basically never break. The
downside: it requires authentication (you will have to figure out how to obtain
credentials on your own).

In summary, both sources provide the same information but differ in stability
and auth requirements.

### Startup

To start the server, run `npm start`. It will immediately fetch the most recent
set of plans, then listen for API requests. Plan polling will continue
indefinitely with the interval set in `src/config.ts`.

Note that `npm start` is shortcut for `npm run build` followed by `npm run production`,
where the former compiles the TypeScript code and the latter executes it.
To start the server without compiling again, use `npm run production` only.

A fixup job will run at startup. This fills in missing data that might have
been missing at cache time but is now inferrable due to an updated data set.
Any plans that are considered complete, or that cannot be inferred further,
will not be changed.


## Setup with Docker

This project is available as a Docker image! See also
[https://hub.docker.com/r/meyfa/ka-mensa-api](https://hub.docker.com/r/meyfa/ka-mensa-api).

### Running the Container

If you just want to get going:

```sh
docker run --name mensa -p <host-port>:8080 -d meyfa/ka-mensa-api
```

If you would like to put the cache in a volume (highly recommended!) so it has
enough room to grow, is available after restarting the container and/or can be
accessed from the host: Mount to `/usr/src/app/cache` like so:

```sh
docker run \
        --name mensa \
        -p <host-port>:8080 \
        -v /path/on/host:/usr/src/app/cache \
        -d meyfa/ka-mensa-api
```

### CORS Headers

Perhaps you need to configure CORS for the API server - to enable displaying
the plans via an instance of `ka-mensa-ui` running on another domain, for
example. This can be done via the config file or by setting an environment
variable:

```
docker run \
        --name mensa \
        -p <host-port>:8080 \
        -v /path/on/host:/usr/src/app/cache \
        -e MENSA_CORS_ALLOWORIGIN=https://example.com \
        -d meyfa/ka-mensa-api
```

Specify a regular URL to only allow that one origin. Use `*` to allow all
origins.


## Environment Variables

Some options can be configured via environment variables. They are as follows:

- `MENSA_CACHE_DIRECTORY`: The path to a directory where downloaded plans
    should be stored, and where they should be served from.
    Defaults to a `cache/` directory inside the working directory.
- `MENSA_CORS_ALLOWORIGIN`: Set this to a specific URL to allow CORS requests
    from that URL, or set to `*` to allow all origins.
    Defaults to not serving any CORS headers.


## Development

Contributions are welcome. Guidelines:

- By contributing, you agree to make your changes available under the MIT
    license of this project.
- Please write unit tests for as much code as possible.
    * To run: `npm test`
    * With coverage: `npm run coverage`
- Make sure to adhere to JS standard style and proper usage of TypeScript.
    * Linter: `npm run lint`
    * Automatic fixing of most style issues: `npm run lint-fix`


## Documentation

A document outlining the API provided by this software is available:
[API_DOCUMENTATION.md](https://github.com/meyfa/ka-mensa-api/blob/master/API_DOCUMENTATION.md).
