/**
 * @description An After Effects script that will allow you to batch replace media into precomps with media replacement essential properties enabled
 * @name km-batch-media-replace-from-selection
 * @version 1.0.0
 * 
 * @license This script is provided "as is," without warranty of any kind, expressed or implied. In
 * no event shall the author be held liable for any damages arising in any way from the use of this
 * script.
 * 
 */

(function() {
    try {
        app.beginUndoGroup("batch replace media replacement from selected layers and AV items");
 
        var mediaReplaceProps = getMediaReplacementProps();
        var avItems = getAVItems();

        batchReplaceMedia(mediaReplaceProps, avItems)


    } catch (error) {
        handleError(error);
    } finally {
        app.endUndoGroup();
    }

    function getProj() {
        var proj = app.project;
        if (!proj) {
            alert("Whoops!\rYou don't currently have a project open. Open a project or create a new one and try again.");
            return null;
        }
        return proj;
    }

    function getActiveComp() {
         var proj = getProj();
        if (!proj) return;
        var comp = proj.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Whoops!\rYou don't have a composition open. Open a composition or create a new one and try again.");
            return null;
        }
        return comp;
    }

    function getSelectedPrecompLayers() {
        var comp = getActiveComp();
        if (!comp) return;
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Whoops!\rYou don't have any layers selected. Select layers and try again.");
            return null;
        }

        var precompLayers = [];

        var found = false;
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            if (layer.source instanceof CompItem) {
                found = true;
                precompLayers.push(layer);
            }
        }

        if (!found) {
            alert("Whoops!\rYou don't have any precomps selected. Select at least 1 precomp layer and try again.");
            return null;
        }

        return precompLayers;
    }

    function handleError(error) {
        alert("An error occurred on line: " + error.line + "\nError message: " + error.message);
    }

    function getMediaReplacementProps(){
      var selectedLayers = getSelectedPrecompLayers();
      if (!selectedLayers) return;
      var props = [];
      var found = false;
      for(var i = 0; i< selectedLayers.length; i++){
        var layer = selectedLayers[i];
        var layerOverrides = layer.property("ADBE Layer Overrides");
        if(layerOverrides.numProperties > 0){
          checkProperties(layerOverrides, props);
          continue
        }
      }

      if(props.length === 0){
        alert("Whoops!\rNone of the properties on the selected precomps have media replacement essential properties enabled. Enable them in the source comp and try again.");
        return;
      }

      return props;
    }


    function checkProperties(propertyGroup, props){
      for(var b = 1; b<=propertyGroup.numProperties; b++){
        var essentialProps = propertyGroup.property(b);
        if(essentialProps.canSetAlternateSource){
          props.push(essentialProps);
          return true;
        } else if(essentialProps.numProperties > 0){
          if(checkProperties(essentialProps, props)){
            return true;
          }
        }
        }
        return false;
      }
    

    function getAVItems(){
      var proj = getProj();
      if (!proj) return;
      var items = proj.selection;
      if(items.length === 0){
        alert("Whoops! You don't have any items selected in the project panel. Select atleast 1 item and try again.");
        return
      }

      var selAVItems = [];
      var found = false;
      for(var i = 0; i< items.length; i++){
        var item = items[i];
        if(item instanceof FootageItem){
          found = true;
          selAVItems.push(item);
        }
      }

      if(!found){
        alert("Whoops! None of the selected items are footage items. Select atleast 1 footage item and try again.");
        return
      }

      return selAVItems

    }

    
    function batchReplaceMedia(props, newItems){
      if(!props || !newItems) return;

      for(var i = 0; i<props.length; i++){
        var prop = props[i];
        prop.setAlternateSource(newItems[i]);
      }

      return
    }



}());
