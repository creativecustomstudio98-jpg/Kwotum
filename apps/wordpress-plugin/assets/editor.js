(function (blocks, blockEditor, components, element, apiFetch) {
  "use strict";

  const el = element.createElement;
  const useEffect = element.useEffect;
  const useState = element.useState;
  const InspectorControls = blockEditor.InspectorControls;
  const PanelBody = components.PanelBody;
  const SelectControl = components.SelectControl;
  const RangeControl = components.RangeControl;
  const Notice = components.Notice;

  blocks.registerBlockType("wyceno/flow", {
    edit: function (props) {
      const attributes = props.attributes;
      const setAttributes = props.setAttributes;
      const [flows, setFlows] = useState([]);
      const [error, setError] = useState(false);

      useEffect(function () {
        apiFetch({ path: "/wyceno-connector/v1/flows" })
          .then(function (response) {
            setFlows(Array.isArray(response.flows) ? response.flows : []);
          })
          .catch(function () {
            setError(true);
          });
      }, []);

      const selected = flows.find(function (flow) {
        return flow.publicId === attributes.flowId;
      });
      const options = [{ label: "Wybierz proces", value: "" }].concat(
        flows.map(function (flow) {
          return { label: flow.name + " (v" + flow.version + ")", value: flow.publicId };
        }),
      );

      return el(
        element.Fragment,
        {},
        el(
          InspectorControls,
          {},
          el(
            PanelBody,
            { title: "Ustawienia Kwotum" },
            el(SelectControl, {
              label: "Proces",
              onChange: function (value) {
                setAttributes({ flowId: value });
              },
              options: options,
              value: attributes.flowId,
            }),
            el(SelectControl, {
              label: "Tryb",
              onChange: function (value) {
                setAttributes({ mode: value });
              },
              options: [
                { label: "W treści", value: "inline" },
                { label: "Popup", value: "popup" },
                { label: "Pełny ekran", value: "fullscreen" },
              ],
              value: attributes.mode,
            }),
            el(RangeControl, {
              label: "Minimalna wysokość",
              max: 1600,
              min: 320,
              onChange: function (value) {
                setAttributes({ height: value });
              },
              value: attributes.height,
            }),
          ),
        ),
        error
          ? el(Notice, { status: "error" }, "Nie udało się pobrać procesów Kwotum.")
          : el(
              "div",
              {
                className: "wyceno-connector-editor-preview",
                style: {
                  border: "1px solid #dcdcde",
                  minHeight: Math.min(480, Math.max(180, attributes.height / 2)) + "px",
                  padding: "24px",
                },
              },
              selected
                ? el(
                    element.Fragment,
                    {},
                    el("strong", {}, selected.name),
                    el(
                      "p",
                      {},
                      "Podgląd osadzenia · " + attributes.mode + " · v" + selected.version,
                    ),
                  )
                : el("p", {}, "Wybierz opublikowany proces w ustawieniach bloku."),
            ),
      );
    },
    save: function () {
      return null;
    },
  });
})(
  window.wp.blocks,
  window.wp.blockEditor,
  window.wp.components,
  window.wp.element,
  window.wp.apiFetch,
);
