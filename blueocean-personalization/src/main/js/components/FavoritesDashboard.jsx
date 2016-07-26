/**
 * Created by cmeyers on 7/26/16.
 */
import React, { Component, PropTypes } from 'react';
import DashboardCards from './DashboardCards';
import PersonalizationStore from '../model/PersonalizationStore';

/**
 * Top-level component bound to extension point that passes down store to child components.
 */
class FavoritesDashboard extends Component {
    render() {
        const favoritesList = PersonalizationStore.favoritesStore.favoritesList;
        favoritesList.initialize();

        return (
            <div>
                <DashboardCards favoritesList={favoritesList} />
            </div>
        );
    }
}

export default FavoritesDashboard;
