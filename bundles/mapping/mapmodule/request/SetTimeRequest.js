//  lisätään 3d-mapmoduleen metodi setTime(pvm, time)
//  lisätään 3d karttaan request: SetTimeRequest jolle voi antaa päivämäärän (oletus 1/6 ja formaatti numero/numero) + kellonajan (oletus 12:00 ja formaatti numero:numero)
// -> asettaa cesiumille päivämäärän ja kellonajan mapmodulen setTime():llä
//  kun pvm vaihtuu lähetetään event TimeChangedEvent jossa tulee päivämäärä ja kellonaika
//  jos requestissa tulevaa inputia ei saada parsittua -> tulostetaan konsoliin varoitus jossa ohjeistetaan oikeasta formaatista
//  Asetetaan request ja event sallituiksi RPC:n yli
//  Muista api-dokkarit + changelog
/**
 * @class SetTimeRequest
 * SetTime Request for Cesium Map
 */
Oskari.clazz.define('Oskari.mapframework.request.common.SetTimeRequest',
    /**
     * Creates a new SetTimeRequest
     * @param {*} date date string
     * @param {*} time time string
     */
    function (date, time, year) {
        this._date = date;
        this._time = time;
        this._year = year;
    }, {
        __name: 'SetTimeRequest',

        /**
         * @method getName
         * @return {String} request name
         */
        getName: function () {
            return this.__name;
        },

        /**
         * @method getDate
         * Valid format d/m
         * @return {String} date
         */
        getDate: function () {
            return this._date;
        },

        /**
         * @method getTime
         * @return {String} time
         */
        getTime: function () {
            return this._time;
        },

        /**
         * @method getYear
         * @return {Number} year
         */
        getYear: function () {
            return this._year || new Date().getFullYear();
        },

        /**
         * @method validateTime
         * @return {Bool} true if valid time
         */
        validateTime: function () {
            const regex = /^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/;
            return regex.test(this.getTime());
        },

        /**
         * @method validateDate
         * @return {Bool} true if valid date
         */
        validateDate: function () {
            const matches = /^(\d{1,2})[/](\d{1,2})$/.exec(this._date);
            if (matches === null) return false;
            const d = parseInt(matches[1]);
            const m = matches[2] - 1;
            const y = this.getYear();
            const date = new Date(y, m, d);
            // Check that inputted date is valid
            return date.getDate() === d && date.getMonth() === m;
        },

        /**
         * @method formatDate
         * @return {String} Time formatted to ISO standard 'YYYY-mm-ddTHH:mm:ss:mmmZ'
         */
        formatDate: function () {
            if (!this.validateTime() || !this.validateDate) {
                return false;
            }
            const dateArray = this.getDate().split('/');
            const timeArray = this.getTime().split(':');
            const date = new Date(this.getYear(), dateArray[1], dateArray[0], timeArray[0], timeArray[1]);
            return date.toISOString();
        }
    }, {
        protocol: ['Oskari.mapframework.request.Request']
    });
