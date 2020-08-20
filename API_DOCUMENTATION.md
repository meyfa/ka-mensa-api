# API Documentation

This document describes the API provided by `ka-mensa-api`. Refer to the
[README](https://github.com/meyfa/ka-mensa-api/blob/master/README.md)
for general project information.

**Table of Contents**

<!-- TOC depthFrom:2 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [General Information](#general-information)
	- [Success Responses](#success-responses)
	- [Error Responses](#error-responses)
- [Endpoints](#endpoints)
	- [`GET /`](#get-)
	- [`GET /meta/legend`](#get-metalegend)
	- [`GET /canteens`](#get-canteens)
	- [`GET /canteens/{canteen}`](#get-canteenscanteen)
	- [`GET /canteens/{canteen}/lines`](#get-canteenscanteenlines)
	- [`GET /canteens/{canteen}/lines/{line}`](#get-canteenscanteenlinesline)
	- [`GET /plans/{date}`](#get-plansdate)

<!-- /TOC -->


## General Information

The API loosely adheres to REST principles with all data structured as JSON.
No authentication is required.

### Success Responses

Successful responses are indicated by HTTP status code `200 OK` and include a
JSON response body with fields `success` and `data`. Example:

```js
{
  "success": true,
  "data": {}
}
```

### Error Responses

Errors are indicated by HTTP status codes matching the type of error and include
a JSON response body detailing the cause. Example:

```js
{
  "success": false,
  "error": "plan not found"
}
```


## Endpoints

The example responses in this section are not necessarily complete, but should
serve as an overview of what to expect.


### `GET /`

This is the base endpoint, used to check for service availability.

**Sample request:**

```sh
$ curl http://my-api-domain
```

**Response:**

A success message with an empty data object. Example:

```js
{
  "success": true,
  "data": {}
}
```

**Possible errors:**

none

---

### `GET /meta/legend`

This endpoint is used to obtain information on classifiers and additives, which
are used in short form throughout the system.

**Sample request:**

```sh
$ curl http://my-api-domain/meta/legend
```

**Response:**

An array of classifier and additive descriptors, each containing a unique short
symbol and human-readable label. Example:

```js
{
  "success": true,
  "data": [
    { "short": "1", "label": "mit Farbstoff" },
    { "short": "2", "label": "mit Konservierungsstoff" },
    // ...
  ]
}
```

**Possible errors:**

none

---

### `GET /canteens`

This endpoint retrieves information on all available canteens.

**Sample request:**

```sh
$ curl http://my-api-domain/canteens
```

**Response:**

An array of all known canteens with id, name and array of lines; each of which
containing an id, name, and (potentially) alias names. Example:

```js
{
  "success": true,
  "data": [
    {
      "id": "adenauerring",
      "name": "Mensa Am Adenauerring",
      "lines": [
        { "id": "l1", "name": "Linie 1" },
        { "id": "aktion", "name": "[kœri]werk", "alternativeNames": ["[kœri]werk 11-14 Uhr"] },
        // ...
      ]
    },
    {
      "id": "moltke",
      "name": "Mensa Moltke",
      "lines": [
        // ...
      ]
    },
    // ...
  ]
}
```

**Possible errors:**

none

---

### `GET /canteens/{canteen}`

This endpoint retrieves information on a single canteen by id.

**Sample request:**

```sh
$ curl http://my-api-domain/canteens/adenauerring
```

**Response:**

An object describing the canteen with id, name and array of lines; each of which
containing an id, name, and (potentially) alias names. Example:

```js
{
  "success": true,
  "data": {
    "id": "adenauerring",
    "name": "Mensa Am Adenauerring",
    "lines": [
      { "id": "l1", "name": "Linie 1" },
      { "id": "aktion", "name": "[kœri]werk", "alternativeNames": ["[kœri]werk 11-14 Uhr"] },
      // ...
    ]
  }
}
```

**Possible errors:**

- `404 Not Found` - if the canteen id is invalid

---

### `GET /canteens/{canteen}/lines`

This endpoint retrieves the array of lines for a given canteen.

**Sample request:**

```sh
$ curl http://my-api-domain/canteens/adenauerring/lines
```

**Response:**

An array of lines, each containing an id, name, and (potentially) alias names.
Example:

```js
{
  "success": true,
  "data": [
    { "id": "l1", "name": "Linie 1" },
    { "id": "aktion", "name": "[kœri]werk", "alternativeNames": ["[kœri]werk 11-14 Uhr"] },
    // ...
  ]
}
```

**Possible errors:**

- `404 Not Found` - if the canteen id is invalid

---

### `GET /canteens/{canteen}/lines/{line}`

This endpoint retrieves information on a single line.

**Sample request:**

```sh
$ curl http://my-api-domain/canteens/adenauerring/lines/aktion
```

**Response:**

An object describing the line with id, name, and (potentially) alias names.
Example:

```js
{
  "success": true,
  "data": {
    "id": "aktion",
    "name": "[kœri]werk",
    "alternativeNames": ["[kœri]werk 11-14 Uhr"]
  }
}
```

**Possible errors:**

- `404 Not Found` - if the canteen id is invalid, or if the line id is invalid

---

### `GET /plans/{date}`

This endpoint retrieves the plan for the given date for all available canteens.

**Sample request:**

```sh
$ curl http://my-api-domain/plans/2020-08-20
```

**Response:**

An array of plan descriptions, one for each canteen. Each entry consists of the
date stamp (months are 0-indexed), a canteen descriptor, and an array of lines.
Each entry in the lines array consists of the line id, name (which may be one
of the line's alias names) and meals. Each entry in the meals array consists of
a name, price, a classifiers array and an additives array.

Canteens or lines might be missing from the response, which indicates lack of
data (closed lines are returned with an empty `meals` array). Use other
endpoints to obtain an exhaustive list of canteens and canteen lines.

Example:

```js
{
  "success": true,
  "data": [
    {
      "date": { "day": 20, "month": 7, "year": 2020 },
      "canteen": { "id": "adenauerring", "name": "Mensa Am Adenauerring" },
      "lines": [
        {
          "id": "l1",
          "name": "Linie 1",
          "meals": []
        },
        {
          "id": "aktion",
          "name": "[kœri]werk 11-14 Uhr",
          "meals": [
            {
              "name": "Reine Kalbsbratwurst mit Currysoße und Baguette",
              "price": "2,00 €",
              "classifiers": ["R"],
              "additives": ["Sn", "Se", "We"]
            },
            // ...
          ]
        },
        // ...
      ]
    },
    {
      "date": { "day": 20, "month": 7, "year": 2020 },
      "canteen": { "id": "moltke", "name": "Mensa Moltke" },
      "lines": [
        // ...
      ]
    }
  ]
}
```

**Possible errors:**

- `400 Bad Request` - if the date is malformed
- `404 Not Found` - if there is no plan for that date
