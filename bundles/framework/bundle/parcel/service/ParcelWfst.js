/**
 * @class Oskari.mapframework.bundle.parcel.service.ParcelWfst
 *
 * Transforms OpenLayers geometry to WFS Transactions
 */
Oskari.clazz.define('Oskari.mapframework.bundle.parcel.service.ParcelWfst',

/**
 * @method create called automatically on construction
 * @static
 * @param {Object} instance
 */
function(instance) {
    this.instance = instance;
    this.protocols = {};
    this.protocols['parcel'] = new OpenLayers.Protocol.WFS({
        version : '1.1.0',
        srsName : 'EPSG:3067',
        featureType : instance.conf.parcelFeatureType,
        featureNS : 'http://xml.nls.fi/ktjkiiwfs/2010/02',
        featurePrefix : 'ktjkiiwfs',
        url : instance.conf.queryUrl
    });
    this.protocols['registerUnit'] = new OpenLayers.Protocol.WFS({
        version : '1.1.0',
        srsName : 'EPSG:3067',
        featureType : instance.conf.registerUnitFeatureType,
        featureNS : 'http://xml.nls.fi/ktjkiiwfs/2010/02',
        featurePrefix : 'ktjkiiwfs',
        url : instance.conf.queryUrl
    });

    var urlCommit = instance.conf.transitionUrl || instance.conf.queryUrl;
    this.protocols['parcelCommit'] = new OpenLayers.Protocol.WFS({
        version : '1.1.0',
        srsName : 'EPSG:3067',
        featureType : this.instance.conf.parcelFeatureType,
        featureNS : 'http://xml.nls.fi/ktjkiiwfs/2010/02',
        featurePrefix : 'ktjkiiwfs',
        url : urlCommit
    });
    this.protocols['registerUnitCommit'] = new OpenLayers.Protocol.WFS({
        version : '1.1.0',
        srsName : 'EPSG:3067',
        featureType : this.instance.conf.registerUnitFeatureType,
        featureNS : 'http://xml.nls.fi/ktjkiiwfs/2010/02',
        featurePrefix : 'ktjkiiwfs',
        url : urlCommit
    });
}, {

    /**
     * @param Requires the downloaded feature as a parameter or undefined if error occurred.
     */
    loadParcel : function(fid, cb) {
        this._downloadFeature(fid, this.protocols['parcel'], cb);
    },
    /**
     * @param cb Requires the downloaded feature as a parameter or undefined if error occurred.
     */
    loadRegisterUnit : function(fid, cb) {
        this._downloadFeature(fid, this.protocols['registerUnit'], cb);
    },

    /**
     * @param cb Requires information about the success as boolean parameter.
     */
    saveParcel : function(layer, placeName, placeDescription, cb) {
        this._commitFeature(layer, placeName, placeDescription, this.protocols['parcelCommit'], cb);
    },
    /**
     * @param cb Requires information about the success as boolean parameter.
     */
    saveRegisterUnit : function(layer, placeName, placeDescription, cb) {
        this._commitFeature(layer, placeName, placeDescription, this.protocols['registerUnitCommit'], cb);
    },

    /**
     * @param cb Requires the downloaded feature as a parameter or undefined if error occurred.
     */
    _downloadFeature : function(fid, protocol, cb) {
        var me = this;
        var filter = new OpenLayers.Filter.FeatureId({
            fids : [fid]
        });
        var loc = this.instance.getLocalization('notification').placeLoading;
        var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
        dialog.show(loc.title, loc.message);
        protocol.read({
            filter : filter,
            callback : function(response) {
                dialog.close();
                if (response && response.features && response.features.length > 0) {
                    cb(response.features[0]);

                } else {
                    var locError = me.instance.getLocalization('notification')['error'];
                    me.instance.showMessage(locError.title, locError.loadPlace);
                    cb();
                }
            }
        });
    },

    /**
     * @param cb Requires information about the success as boolean parameter.
     */
    _commitFeature : function(layer, placeName, placeDescription, protocol, cb) {
        var me = this;

        // Set the place and description for the feature if they are given.
        // If they are not given, then do not set them.
        var feature = layer.features[0];
        if (feature && feature.attributes) {
            if (placeName) {
                // Here we suppose that server uses "nimi" property for the place name.
                feature.attributes.nimi = placeName;
            }
            if (placeDescription || typeof placeDescription === "string") {
                // Set the place description also if an empty string is given.
                // Here we suppose that server uses "kuvaus" property for the place description.
                feature.attributes.kuvaus = placeDescription;
            }
        }

        // Set correct state information for the commit.
        me._setCommitFeatureStates(layer);

        // Before commit, change the fid to be number.
        // Query server may give a prefix in fid but it is not wanted in commit.
        layer.features[0].fid = me._parseFidNumber(feature.fid);

        // Show dialog to inform about the asynchronous operation.
        var dialogAdding = Oskari.clazz.create('Oskari.userinterface.component.Popup');
        var loc = this.instance.getLocalization('notification').placeAdding;
        dialogAdding.show(loc.title, loc.message);
        // Commit feature to the server.
        protocol.commit(layer.features, {
            callback : function(response) {
                dialogAdding.close();
                var success = response && !response.error;
                if (!success) {
                    var locError = me.instance.getLocalization('notification')['error'];
                    me.instance.showMessage(locError.title, locError.savePlace);
                }
                // Callback requires information about the success.
                cb(success);
            }
        });
    },

    /**
     * Removes the possible string prefix from the given fid.
     *
     * @param {String} fid
     * @return {String} Parsed fid. Notice, this will return only positive numbers. "-" is also parsed away.
     */
    _parseFidNumber : function(fid) {
        var newFid = fid;
        if (newFid && ( typeof newFid) === "string" && newFid.length > 0 && !isNaN(newFid.substr(length - 1))) {
            // Get the number from the end of the string.
            // Possible string prefix is removed.
            newFid = parseInt(newFid.match(/(\d+)$/)[0], 10);
        }
        return newFid;
    },
    /**
     * Inits the state for features for the commit.
     * @param {Object} layer
     */
    _setCommitFeatureStates : function(layer) {
        // Insert feature to the server if transaction URL differs from the query URL that has given the feature.
        // Otherwise, update data if the query server is same as the transaction server.
        var state = (this.instance.conf.transactionUrl && this.instance.conf.queryUrl != this.instance.conf.transactionUrl) ? OpenLayers.State.INSERT : OpenLayers.State.UPDATE;
        for (var i = 0; i < layer.features.length; ++i) {
            var feature = layer.features[i];
            feature.toState(state);
            // just to be sure
            feature.state = state;
        }
    }
});
