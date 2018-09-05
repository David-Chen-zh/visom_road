// *******************************************
// Model Summary Extension
// *******************************************
function ModelSummaryExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
  this.panel = null; // create the panel variable
}

ModelSummaryExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ModelSummaryExtension.prototype.constructor = ModelSummaryExtension;

ModelSummaryExtension.prototype.load = function () {
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

ModelSummaryExtension.prototype.onToolbarCreated = function () {
  this.viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
  this.onToolbarCreatedBinded = null;
  this.createUI();
};

ModelSummaryExtension.prototype.createUI = function () {
  var _this = this;

  // prepare to execute the button action
  var modelSummaryToolbarButton = new Autodesk.Viewing.UI.Button('runModelSummaryCode');
  modelSummaryToolbarButton.onClick = function (e) {

      // **********************
      //
      //
      // Execute an action here
      
      //
      //
      // **********************

  };
  // modelSummaryToolbarButton CSS class should be defined on your .css file
  // you may include icons, below is a sample class:
  modelSummaryToolbarButton.addClass('modelSummaryToolbarButton');
  modelSummaryToolbarButton.setToolTip('Model Summary');

  // SubToolbar
  this.subToolbar = (this.viewer.toolbar.getControl("MyAppToolbar") ?
      this.viewer.toolbar.getControl("MyAppToolbar") :
      new Autodesk.Viewing.UI.ControlGroup('MyAppToolbar'));
  this.subToolbar.addControl(modelSummaryToolbarButton);

  this.viewer.toolbar.addControl(this.subToolbar);
};

ModelSummaryExtension.prototype.unload = function () {
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

ModelSummaryExtension.prototype.getAllLeafComponents = function (callback) {
  var cbCount = 0; // count pending callbacks
  var components = []; // store the results
  var tree; // the instance tree

  function getLeafComponentsRec(parent) {
      cbCount++;
      if (tree.getChildCount(parent) != 0) {
          tree.enumNodeChildren(parent, function (children) {
              getLeafComponentsRec(children);
          }, false);
      } else {
          components.push(parent);
      }
      if (--cbCount == 0) callback(components);
  }
  this.viewer.getObjectTree(function (objectTree) {
      tree = objectTree;
      var allLeafComponents = getLeafComponentsRec(tree.getRootId());
  });
};



Autodesk.Viewing.theExtensionManager.registerExtension('ModelSummaryExtension', ModelSummaryExtension);