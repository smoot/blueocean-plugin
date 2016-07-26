/**
 * Created by cmeyers on 7/26/16.
 */
import React, { Component, PropTypes } from 'react';
import FavoritesProvider from './FavoritesProvider';
import DashboardCards from './DashboardCards';


/**
 * Restyled version of FavoritePipeline component.
 */
class FavoritesDashboard extends Component {
    render() {
        if (!this.props.mobxStores ||
            !this.props.mobxStores.favoritesStore ||
            !this.props.mobxStores.favoritesStore.favoritesList) {
            return null;
        }

        const favoritesList = this.props.mobxStores.favoritesStore.favoritesList;

        return (
            <div>
                <FavoritesProvider favoritesList={favoritesList} />
                <DashboardCards favoritesList={favoritesList} />
            </div>
        );
    }
}

FavoritesDashboard.propTypes = {
    mobxStores: PropTypes.object,
};

export default FavoritesDashboard;
