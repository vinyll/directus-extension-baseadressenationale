import Interface from "./interface.vue";

export default {
  id: "municipality-info-interface",
  name: "Custom Municipality Info Interface",
  icon: "search",
  description:
    "A custom interface that will search for a municipality and save it's geographical data as a json object.",
  component: Interface,
  types: ["string"],
  options: null,
  group: "standard",
};
