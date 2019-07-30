import { __ } from 'embark-i18n';

class Communication {
  constructor(embark, options){
    this.embark = embark;
    this.embarkConfig = embark.config.embarkConfig;
    this.events = this.embark.events;
    this.communicationConfig = embark.config.communicationConfig;
    this.plugins = options.plugins;

    let plugin = this.plugins.createPlugin('communicationplugin', {});
    plugin.registerActionForEvent("pipeline:generateAll:before", this.addArtifactFile.bind(this));

    this.communicationNodes = {};
    this.events.setCommandHandler("communication:node:register", (clientName, startCb) => {
      this.communicationNodes[clientName] = startCb
    });

    this.events.setCommandHandler("communication:node:start", (communicationConfig, cb) => {
      const clientName = communicationConfig.provider;
      const client = this.communicationNodes[clientName];
      if (!client) return cb("communication " + clientName + " not found");

      let onStart = () => {
        this.events.emit("communication:started", clientName);
        cb();
      }

      client.apply(client, [onStart]);
    });
  }

  addArtifactFile(_params, cb) {
    let config = {
      // TODO: for consistency we should change this to be dappConnection or connection
      connection: this.communicationConfig.connection
    }
    this.events.request("pipeline:register", {
      path: [this.embarkConfig.generationDir, 'config'],
      file: 'communication.json',
      format: 'json',
      content: config
    }, cb);
  }

}

module.exports = Communication;
