/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'json-editor',
    'ajv'
], function (_, ContrailView, JSONEditor, Ajv) {
    var JSONEditorView = ContrailView.extend({
        render: function () {

            var self = this;
            var onError = false;
            var ajv = Ajv({ allErrors: true, verbose: true, removeAdditional: true  });
            var validate = ajv.compile(self.model.schema());

            var editorTempl = contrail.getTemplate4Id(cowc.TMPL_JSON_EDITOR_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                jsonData = {};

            this.$el.html(editorTempl({viewConfig: viewConfig, elementId: elId}));
            var jsonContainer = document.getElementById(cowc.ID_JSON_EDITOR);
            var jsonOptions = {
                schema : self.model.schema(),
                ajv : ajv,
                onChange: function () {
                    try{
                        var valid = validate(jsonEditor.get());
                        self.model.model().attributes = jsonEditor.get();

                        //if error button on UI is on, disable save button
                        var isValidJSON = validate(jsonEditor.get());
                        toggleSaveButton(isValidJSON);
                    } catch(e) {
                        toggleSaveButton(false);
                    }
                }
            };
            var jsonEditor = new JSONEditor(jsonContainer, jsonOptions);

            jsonEditor.setMode(cowc.JSON_EDITOR_MODE_CODE);

            if (contrail.checkIfExist(self.model.model()._originalAttributes.customJSON) && (self.model.model()._originalAttributes.customJSON !== {})) {
                jsonData = self.model.model()._originalAttributes.customJSON;
            } else {
                jsonData = self.model.model()._originalAttributes.json;
            }
            jsonEditor.set(jsonData);

            var isValidJSON = validate(jsonEditor.get());
            toggleSaveButton(isValidJSON);
        }
    });

    /*
     * @Params
     *   isValidJSON : Boolean
     * */
    function toggleSaveButton(isValidJSON) {
        if(!isValidJSON) {
            $(".btnSave").prop('disabled', true);
        } else {
            $(".btnSave").removeAttr('disabled');
        }
    };

    return JSONEditorView;
});