/**
 * Created by cmeyers on 7/25/16.
 */
import Immutable from 'immutable';
import fetch from 'isomorphic-fetch';
import { action, computed, observable, useStrict } from 'mobx';
useStrict(true);

import urlConfig from '../config';
urlConfig.loadConfig();

import { User } from '../model/User';
import { checkMatchingFavoriteUrls } from '../util/FavoriteUtils';

const { List } = Immutable;

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

function execFetch(url, options) {
    const fetchOptions = options || { ... defaultFetchOptions };

    return fetch(url, fetchOptions)
        .then(checkStatus)
        .then(parseJSON);
}

export class FavoritesList {

    @observable favorites = new List();
    user = null;
    _initializing = false;

    initialize() {
        const shouldFetchUser = !this.user;

        console.log('intialize()?', this._initializing);

        if (shouldFetchUser && !this._initializing) {
            this._initializing = true;
            this.fetchCurrentUser()
                .then(() => {
                    this.fetchFavorites()
                        .then(() => {
                            this._initializing = false;
                        });
                });
        }
    }

    fetchCurrentUser() {
        const baseUrl = urlConfig.blueoceanAppURL;
        const url = `${baseUrl}/rest/organizations/jenkins/user/`;

        return execFetch(url)
            .then((data) => {
                this.user = new User(data);
            });
    }

    fetchFavorites() {
        const baseUrl = urlConfig.blueoceanAppURL;
        const username = this.user.id;
        const url = `${baseUrl}/rest/users/${username}/favorites/`;

        return execFetch(url)
            .then(action((data) => {
                this.favorites = new List(data);
            }));
    }

    toggleFavorite(addFavorite, pipelineOrBranch) {
        const baseUrl = urlConfig.jenkinsRootURL;
        const url = `${baseUrl}${pipelineOrBranch._links.self.href}/favorite`;

        const fetchOptions = {
            ...defaultFetchOptions,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                { favorite: addFavorite }
            ),
        };

        return execFetch(url, fetchOptions)
            .then((favoritePayload) => {
                this._updateToggledFavorite(addFavorite, pipelineOrBranch, favoritePayload);
            });
    }

    @action
    _updateToggledFavorite(addFavorite, pipelineOrBranch, favoritePayload) {
        if (addFavorite) {
            this.favorites = this.favorites.push(favoritePayload);
        }

        const toggledBranchHref = pipelineOrBranch._links.self.href;
        // filter the list so that only favorites which didn't match the branch's href are returned
        this.favorites = this.favorites.filter(fav => {
            const favoritedBranch = fav.item;
            return !checkMatchingFavoriteUrls(
                favoritedBranch._links.self.href,
                toggledBranchHref,
            );
        });
    }

    @computed get count() {
        return this.favorites && this.favorites.length || 0;
    }
}
