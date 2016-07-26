/**
 * Created by cmeyers on 7/25/16.
 */
import { FavoritesList } from './FavoritesList';

class PersonalizationStore {

    favoritesList = null;

    constructor() {
        this.favoritesList = new FavoritesList();
    }
}


export default {
    favoritesStore: new PersonalizationStore(),
};
