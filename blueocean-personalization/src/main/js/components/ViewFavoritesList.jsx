/**
 * Created by cmeyers on 7/25/16.
 */
import React, { Component, PropTypes } from 'react';

import { observer } from 'mobx-react';

/**
 */
@observer class ViewFavoritesList extends Component {

    onFetch() {
        this.props.list.loadFavorites();
    }

    render() {
        return (
            <div>
                <div>{this.props.list.count}</div>
                <button onClick={() => this.onFetch()}>Fetch</button>
            </div>
        );
    }
}

ViewFavoritesList.propTypes = {
    list: PropTypes.object,
};

export default ViewFavoritesList;
