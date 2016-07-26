/**
 * Created by cmeyers on 7/20/16.
 */
import React, { Component, PropTypes } from 'react';
import { observer } from 'mobx-react';

/**
 * FavoritesProvider ensures that the current user's favorites
 * are loaded for any components which may need it.
 *
 * Components that require this data can simply wrap themselves in
 * FavoritesProvider which will ensure the store is updated correctly.
 */
@observer
export class FavoritesProvider extends Component {

    componentWillMount() {
        this._initialize(this.props);
    }

    componentWillReceiveProps(props) {
        this._initialize(props);
    }

    _initialize(props) {
        const { favoritesList } = props;
        const { user, favorites } = props.favoritesList;

        const shouldFetchUser = !user;
        const shouldFetchFavorites = user && !favorites;

        if (shouldFetchUser) {
            favoritesList.fetchCurrentUser()
                .then(() => {
                    favoritesList.fetchFavorites();
                });
        }
    }

    render() {
        return this.props.children ?
            React.cloneElement(this.props.children, { ...this.props }) :
            null;
    }
}

FavoritesProvider.propTypes = {
    children: PropTypes.node,
    favoritesList: PropTypes.object,
};

export default FavoritesProvider;
