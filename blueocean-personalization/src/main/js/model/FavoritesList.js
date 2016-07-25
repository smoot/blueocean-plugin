/**
 * Created by cmeyers on 7/25/16.
 */
import { action, computed, observable, useStrict } from 'mobx';
import fetch from 'isomorphic-fetch';

useStrict(true);

import urlConfig from '../config';
urlConfig.loadConfig();

const defaultFetchOptions = {
    credentials: 'same-origin',
};

function checkStatus(response) {
    if (response.status >= 300 || response.status < 200) {
        const error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
    return response;
}

function parseJSON(response) {
    return response.json()
    // FIXME: workaround for status=200 w/ empty response body that causes error in Chrome
    // server should probably return HTTP 204 instead
        .catch((error) => {
            if (error.message === 'Unexpected end of JSON input') {
                return {};
            }
            throw error;
        });
}

export class FavoritesList {

    @observable favorites;

    constructor() {
        this._init();
    }

    @action
    _init() {
        this.favorites = [];
    }

    // TODO: determine why useStrict triggers an error here
    @action
    loadFavorites() {
        const baseUrl = urlConfig.blueoceanAppURL;
        const url = `${baseUrl}/rest/users/cmeyers/favorites/`;
        const fetchOptions = { ...defaultFetchOptions };

        fetch(url, fetchOptions)
            .then(checkStatus)
            .then(parseJSON)
            .then(action((json) => {
                this.favorites = json;
            }));
    }

    @computed get count() {
        return this.favorites && this.favorites.length || 0;
    }
}
