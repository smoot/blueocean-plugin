/**
 * Created by cmeyers on 7/8/16.
 */
import React, { Component, PropTypes } from 'react';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';

import { Favorite } from '@jenkins-cd/design-language';

import PersonalizationStore from '../model/PersonalizationStore';
import { checkMatchingFavoriteUrls } from '../util/FavoriteUtils';

/**
 * A toggle button to favorite or unfavorite the provided item (pipeline or branch)
 * Contains all logic for rendering the current favorite status of that item
 * and toggling favorited state on the server.
 */
@observer
export class FavoritePipeline extends Component {

    constructor(props) {
        super(props);

        this.state = {
            favorite: false,
        };
    }

    componentWillMount() {
        this.favoritesList = PersonalizationStore.favoritesStore.favoritesList;
        this.favoritesList.initialize();
        this._unsubscribe = autorun(() => this.updateFavorite());
    }

    componentWillUnmount() {
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }

    updateFavorite() {
        const { pipeline } = this.props;
        let favorite = null;

        if (this.favoritesList.favorites) {
            favorite = this.favoritesList.favorites.find((fav) => {
                const favUrl = fav.item._links.self.href;
                const pipelineUrl = pipeline._links.self.href;

                return checkMatchingFavoriteUrls(favUrl, pipelineUrl);
            });
        }

        this.setState({
            favorite: !!favorite,
        });
    }

    _onFavoriteToggle() {
        const isFavorite = !this.state.favorite;
        this.setState({
            favorite: isFavorite,
        });

        debugger;

        if (this.favoritesList.toggleFavorite) {
            this.favoritesList.toggleFavorite(isFavorite, this.props.pipeline);
        }
    }

    render() {
        return (
            <Favorite checked={this.state.favorite} className={this.props.className}
              onToggle={() => this._onFavoriteToggle()}
            />
        );
    }
}

FavoritePipeline.propTypes = {
    className: PropTypes.string,
    pipeline: PropTypes.object,
};

FavoritePipeline.defaultProps = {
    favorite: false,
};

export default FavoritePipeline;
