const {CompositeDisposable} = require("atom");

module.exports = new class Main {
  constructor() {
    this.active = false;
    this.decorations = [];
  }

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    require("atom-package-deps").install("minimap");
  }

  deactivate() {
    this.minimapPackage.unregisterPlugin('minimap-tree-sitter-syntax');
    this.minimapPackage = null;
  }

  // tree sitter syntax plugin methods
  consumeTreeSitterSyntaxBeta(ts) {
    ts.onMarkersCreated(({editor, markers}) => {
      if (!this.isActive()) return;

      const minimap = this.minimapPackage.minimapForEditor(editor);
      if (!minimap) return;

      const decorations = markers.map(marker => minimap.decorateMarker(
        marker,
        {
          type: "highlight",
          class: "tree-sitter-syntax"
        })
      );

      this.decorations.push(...decorations);
    });
  }

  // Minimap plugin methods
  isActive() {
    return this.active;
  }

  consumeMinimapServiceV1(minimap) {
    this.minimapPackage = minimap;
    this.minimapPackage.registerPlugin('minimap-tree-sitter-syntax', this);
  }

  activatePlugin() {
    if (this.active) return;

    this.active = true;
  }

  deactivatePlugin() {
    if (!this.active) return;

    this.active = false;
    this.subscriptions.dispose();
    this.decorations.forEach(decoration => decoration.destroy());
  }
};
