// Source: https://github.com/JasonSanford/GeoJSON-to-Google-Maps
var GeoJSON = function( geojson, options ){
  var _geometryToGoogleMaps = function( geojsonGeometry, opts, geojsonProperties ){
    
    var googleObj;

    switch ( geojsonGeometry.type ){
      case "Point":
        opts.position = new google.maps.LatLng(geojsonGeometry.coordinates[1], geojsonGeometry.coordinates[0]);
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(opts.position);
        googleObj = new google.maps.Marker(opts);
        googleObj.set('bounds', bounds);
        if (geojsonProperties) {
          googleObj.set("geojsonProperties", geojsonProperties);
        }
        break;
        
      case "MultiPoint":
        googleObj = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
          opts.position = new google.maps.LatLng(geojsonGeometry.coordinates[i][1], geojsonGeometry.coordinates[i][0]);
          bounds.extend(opts.position);
          googleObj.push(new google.maps.Marker(opts));
        }
        if (geojsonProperties) {
          for (var k = 0; k < googleObj.length; k++){
            googleObj[k].set("geojsonProperties", geojsonProperties);
          }
        }
        for (var k = 0; k < googleObj.length; k++) {
          googleObj[k].set('bounds', bounds);
        }
        break;
        
      case "LineString":
        var path = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
          var coord = geojsonGeometry.coordinates[i];
          var ll = new google.maps.LatLng(coord[1], coord[0]);
          bounds.extend(ll);
          path.push(ll);
        }
        opts.path = path;
        googleObj = new google.maps.Polyline(opts);
        googleObj.set('bounds', bounds);
        if (geojsonProperties) {
          googleObj.set("geojsonProperties", geojsonProperties);
        }
        break;
        
      case "MultiLineString":
        googleObj = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
          var path = [];
          for (var j = 0; j < geojsonGeometry.coordinates[i].length; j++){
            var coord = geojsonGeometry.coordinates[i][j];
            var ll = new google.maps.LatLng(coord[1], coord[0]);
            bounds.extend(ll);
            path.push(ll);
          }
          opts.path = path;
          googleObj.push(new google.maps.Polyline(opts));
        }
        if (geojsonProperties) {
          for (var k = 0; k < googleObj.length; k++){
            googleObj[k].set("geojsonProperties", geojsonProperties);
          }
        }
        for (var k = 0; k < googleObj.length; k++) {
          googleObj[k].set('bounds', bounds);
        }
        break;
        
      case "Polygon":
        var paths = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
          var path = [];
          for (var j = 0; j < geojsonGeometry.coordinates[i].length; j++){
            var ll = new google.maps.LatLng(geojsonGeometry.coordinates[i][j][1], geojsonGeometry.coordinates[i][j][0]);
            bounds.extend(ll);
            path.push(ll)
          }
          paths.push(path);
        }
        opts.paths = paths;
        googleObj = new google.maps.Polygon(opts);
        googleObj.set('bounds', bounds);
        if (geojsonProperties) {
          googleObj.set("geojsonProperties", geojsonProperties);
        }
        break;
        
      case "MultiPolygon":
        googleObj = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
          var paths = [];
          for (var j = 0; j < geojsonGeometry.coordinates[i].length; j++){
            var path = [];
            for (var k = 0; k < geojsonGeometry.coordinates[i][j].length; k++){
              var ll = new google.maps.LatLng(geojsonGeometry.coordinates[i][j][k][1], geojsonGeometry.coordinates[i][j][k][0]);
              bounds.extend(ll);
              path.push(ll);
            }
            paths.push(path);
          }
          opts.paths = paths;
          googleObj.push(new google.maps.Polygon(opts));
        }
        if (geojsonProperties) {
          for (var k = 0; k < googleObj.length; k++){
            googleObj[k].set("geojsonProperties", geojsonProperties);
          }
        }
        for (var k = 0; k < googleObj.length; k++) {
          googleObj[k].set('bounds', bounds);
        }
        break;
        
      case "GeometryCollection":
        googleObj = [];
        if (!geojsonGeometry.geometries){
          googleObj = _error("Invalid GeoJSON object: GeometryCollection object missing \"geometries\" member.");
        }else{
          for (var i = 0; i < geojsonGeometry.geometries.length; i++){
            googleObj.push(_geometryToGoogleMaps(geojsonGeometry.geometries[i], opts, geojsonProperties || null));
          }
        }
        break;
        
      default:
        googleObj = _error("Invalid GeoJSON object: Geometry object must be one of \"Point\", \"LineString\", \"Polygon\" or \"MultiPolygon\".");
    }
    
    return googleObj;
    
  };
  
  var _error = function( message ){
  
    return {
      type: "Error",
      message: message
    };
  
  };
    
  var obj;
  
  var opts = options || {};
  
  switch ( geojson.type ){
  
    case "FeatureCollection":
      if (!geojson.features){
        obj = _error("Invalid GeoJSON object: FeatureCollection object missing \"features\" member.");
      }else{
        obj = [];
        for (var i = 0; i < geojson.features.length; i++){
          obj.push(_geometryToGoogleMaps(geojson.features[i].geometry, opts, geojson.features[i].properties));
        }
      }
      break;
    
    case "GeometryCollection":
      if (!geojson.geometries){
        obj = _error("Invalid GeoJSON object: GeometryCollection object missing \"geometries\" member.");
      }else{
        obj = [];
        for (var i = 0; i < geojson.geometries.length; i++){
          obj.push(_geometryToGoogleMaps(geojson.geometries[i], opts, geojson.geometries[i].properties));
        }
      }
      break;
    
    case "Feature":
      if (!( geojson.properties && geojson.geometry )){
        obj = _error("Invalid GeoJSON object: Feature object missing \"properties\" or \"geometry\" member.");
      }else{
        obj = _geometryToGoogleMaps(geojson.geometry, opts, geojson.properties);
      }
      break;
    
    case "Point": case "MultiPoint": case "LineString": case "MultiLineString": case "Polygon": case "MultiPolygon":
      obj = geojson.coordinates
        ? obj = _geometryToGoogleMaps(geojson, opts, geojson.properties)
        : _error("Invalid GeoJSON object: Geometry object missing \"coordinates\" member.");
      break;
    
    default:
      obj = _error("Invalid GeoJSON object: GeoJSON object must be one of \"Point\", \"LineString\", \"Polygon\", \"MultiPolygon\", \"Feature\", \"FeatureCollection\" or \"GeometryCollection\".");
  
  }
  
  return obj;
};
;
(function ($) {
  Drupal.behaviors.geofieldMap = {
    attach: function(context, settings) {
      Drupal.geoField = Drupal.geoField || {};
      Drupal.geoField.maps = Drupal.geoField.maps || {};

      $('.geofieldMap', context).once('geofield-processed', function(index, element) {
        var data = undefined;
        var map_settings = [];
        var pointCount = 0;
        var resetZoom = true;
        var elemID = $(element).attr('id');

        if(settings.geofieldMap[elemID]) {
            data = settings.geofieldMap[elemID].data;
            map_settings = settings.geofieldMap[elemID].map_settings;
        }

        // Checking to see if google variable exists. We need this b/c views breaks this sometimes. Probably
        // an AJAX/external javascript bug in core or something.
        if (typeof google != 'undefined' && typeof google.maps.ZoomControlStyle != 'undefined' && data != undefined) {
          var features = GeoJSON(data);
          // controltype
          var controltype = map_settings.controltype;
          if (controltype == 'default') { controltype = google.maps.ZoomControlStyle.DEFAULT; }
          else if (controltype == 'small') { controltype = google.maps.ZoomControlStyle.SMALL; }
          else if (controltype == 'large') { controltype = google.maps.ZoomControlStyle.LARGE; }
          else { controltype = false }

          // map type
          var maptype = map_settings.maptype;
          if (maptype) {
            if (maptype == 'map' && map_settings.baselayers_map) { maptype = google.maps.MapTypeId.ROADMAP; }
            if (maptype == 'satellite' && map_settings.baselayers_satellite) { maptype = google.maps.MapTypeId.SATELLITE; }
            if (maptype == 'hybrid' && map_settings.baselayers_hybrid) { maptype = google.maps.MapTypeId.HYBRID; }
            if (maptype == 'physical' && map_settings.baselayers_physical) { maptype = google.maps.MapTypeId.TERRAIN; }
          }
          else { maptype = google.maps.MapTypeId.ROADMAP; }

          // menu type
          var mtc = map_settings.mtc;
          if (mtc == 'standard') { mtc = google.maps.MapTypeControlStyle.HORIZONTAL_BAR; }
          else if (mtc == 'menu' ) { mtc = google.maps.MapTypeControlStyle.DROPDOWN_MENU; }
          else { mtc = false; }

          var myOptions = {
            zoom: parseInt(map_settings.zoom),
            minZoom: parseInt(map_settings.min_zoom),
            maxZoom: parseInt(map_settings.max_zoom),
            mapTypeId: maptype,
            mapTypeControl: (mtc ? true : false),
            mapTypeControlOptions: {style: mtc},
            zoomControl: ((controltype !== false) ? true : false),
            zoomControlOptions: {style: controltype},
            panControl: (map_settings.pancontrol ? true : false),
            scrollwheel: (map_settings.scrollwheel ? true : false),
            draggable: (map_settings.draggable ? true : false),
            overviewMapControl: (map_settings.overview ? true : false),
            overviewMapControlOptions: {opened: (map_settings.overview_opened ? true : false)},
            streetViewControl: (map_settings.streetview_show ? true : false),
            scaleControl: (map_settings.scale ? true : false),
            scaleControlOptions: {style: google.maps.ScaleControlStyle.DEFAULT}
          };

          var map = new google.maps.Map($(element).get(0), myOptions);
          // Store a reference to the map object so other code can interact
          // with it.
          Drupal.geoField.maps[elemID] = map;

          var range = new google.maps.LatLngBounds();

          var infowindow = new google.maps.InfoWindow({
            content: ''
          });

          if (features.setMap) {
            placeFeature(features, map, range);
            // Don't move the default zoom if we're only displaying one point.
            if (features.getPosition) {
              resetZoom = false;
            }
          } else {
            for (var i in features) {
              if (features[i].setMap) {
                placeFeature(features[i], map, range);
              } else {
                for (var j in features[i]) {
                  if (features[i][j].setMap) {
                    placeFeature(features[i][j], map, range);
                  }
                }
              }
            }
          }

         for (first in features) break;
         if (first!='type') {
            if (resetZoom) {
              map.fitBounds(range);
            } else {
              map.setCenter(range.getCenter());
            }
          } else {
            var center = map_settings.center;
            map.setCenter(new google.maps.LatLng(center.lat, center.lon));
          }
        }
        
        function placeFeature(feature, map, range) {
          var properties = feature.get('geojsonProperties');
          if (feature.setTitle && properties && properties.title) {
            feature.setTitle(properties.title);
          }
          feature.setMap(map);
          if (feature.getPosition) {
            range.extend(feature.getPosition());
          } else {
            var path = feature.getPath();
            path.forEach(function(element) {
              range.extend(element);
            });
          }

          if (properties && properties.description) {
            var bounds = feature.get('bounds');
            google.maps.event.addListener(feature, 'click', function() {
              infowindow.setPosition(bounds.getCenter());
              infowindow.setContent(properties.description);
              infowindow.open(map);
            });
          }
        }
      });
    }
  }
})(jQuery);
;
