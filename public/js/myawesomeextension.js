// *******************************************
// My Awesome Extension
// *******************************************
function MyAwesomeExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

MyAwesomeExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
MyAwesomeExtension.prototype.constructor = MyAwesomeExtension;

MyAwesomeExtension.prototype.load = function () {
  if (this.viewer.toolbar) {
    // Toolbar is already available, create the UI
    this.createUI();
  } else {
    // Toolbar hasn't been created yet, wait until we get notification of its creation
    this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
    this.viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
  }
  return true;
};

MyAwesomeExtension.prototype.onToolbarCreated = function () {
  this.viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
  this.onToolbarCreatedBinded = null;
  this.createUI();
};

MyAwesomeExtension.prototype.createUI = function () {
  var _this = this;

  // prepare to execute the button action
  var myAwesomeToolbarButton = new Autodesk.Viewing.UI.Button('runMyAwesomeCode');
  myAwesomeToolbarButton.onClick = function (e) {

    // **********************
    //
    //
    // Execute an action here
    /// get current selection
var selection = _this.viewer.getSelection();
_this.viewer.clearSelection();
// anything selected?
if (selection.length > 0) {
    // create an array to store dbIds to isolate
    var dbIdsToChange = [];

    // iterate through the list of selected dbIds
    selection.forEach(function (dbId) {
        // get properties of each dbId
        _this.viewer.getProperties(dbId, function (props) {
            // output on console, for fun...
            console.log(props);

            // ask if want to isolate
            if (confirm('Confirm ' + props.name + ' (' + props.externalId + ')?')) {
                dbIdsToChange.push(dbId);

                // at this point we know which elements to isolate
                if (dbIdsToChange.length > 0) {
                    // isolate selected (and confirmed) dbIds
                    _this.viewer.isolate(dbIdsToChange);
                }
            }
        })
    })

}
else {
    // if nothing selected, restore
    _this.viewer.isolate(0);
}
    //
    //
    // **********************

    alert('I am an extension');

  };
  // myAwesomeToolbarButton CSS class should be defined on your .css file
  // you may include icons, below is a sample class:
  myAwesomeToolbarButton.addClass('myAwesomeToolbarButton');
  myAwesomeToolbarButton.setToolTip('My Awesome extension');

  // SubToolbar
  this.subToolbar = (this.viewer.toolbar.getControl("MyAppToolbar") ?
    this.viewer.toolbar.getControl("MyAppToolbar") :
    new Autodesk.Viewing.UI.ControlGroup('MyAppToolbar'));
  this.subToolbar.addControl(myAwesomeToolbarButton);

  this.viewer.toolbar.addControl(this.subToolbar);
};

MyAwesomeExtension.prototype.unload = function () {
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('MyAwesomeExtension', MyAwesomeExtension);