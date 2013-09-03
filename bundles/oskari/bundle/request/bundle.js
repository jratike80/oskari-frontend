define(["oskari", 
			"./request",
			"./common/add-map-layer-request",
			"./common/remove-map-layer-request",
			"./common/map-move-request",
			"./common/show-map-layer-info-request",
			"./common/hide-map-marker-request",
			"./common/ctrl-key-down-request",
			"./common/ctrl-key-up-request",
			"./common/rearrange-selected-map-layer-request",
			"./common/change-map-layer-opacity-request",
			"./common/change-map-layer-style-request",
			"./common/highlight-map-layer-request",
			"./common/dim-map-layer-request"],function(Oskari) {
				
				Oskari.bundleCls('request-base');
				Oskari.bundleCls('request-map');
				Oskari.bundleCls('request-map-layer');
				
				
			});
