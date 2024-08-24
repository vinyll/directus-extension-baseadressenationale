<template>
  <div class="custom-interface">
    <input
      type="text"
      v-model="searchQuery"
      @input="fetchSuggestions"
      placeholder="Enter municipality"
    />
    <ul v-if="suggestions.length" class="suggestions-list">
      <li
        v-for="(suggestion, index) in suggestions"
        :key="index"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  inject: ["api"],
  name: "CustomInputInterface",
  /*
  props: {

    value: {
      type: JSON,
      default: "",
    },
    field: String,
    primaryKey: {
      type: String,
      default: "",
    },

  },
  */
  emits: ["input"],
  setup(props, { emit }) {
    // console.log(props);
  },
  /*
  mounted() {
    console.log("Value: ", this.value);
  },
  */
  data() {
    return {
      searchQuery:
        "Veuillez entrer un nom de municipalité si vous voulez la changer.",
      suggestions: [],
      cities: [],
    };
  },
  methods: {
    async fetchSuggestions() {
      const cityNameRegex = /^[A-Za-z\s]+$/;
      const { searchQuery } = this;

      // quand on encode l'uri, les espaces devienent "%20" ce qui déclenche un call trop tot.
      const checkSearchQueryLength = (value) => {
        const length = value.length;
        const spaceEncodingAddedLength = (value.split(" ").length - 1) * 2;
        return length - spaceEncodingAddedLength;
      };
      if (
        checkSearchQueryLength(searchQuery) < 3 ||
        !cityNameRegex.test(searchQuery)
      ) {
        this.suggestions = [];
        return;
      }

      try {
        const requestUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          searchQuery
        )}&type=municipality&limit=5`;
        const response = await fetch(requestUrl);
        const data = await response.json();
        if (data.length < 1) {
          console.error("No data received, input: " + searchQuery);
          return;
        }
        if (data.features.length === 0) {
          console.error("No cities corresponding to input " + searchQuery);
          return;
        }
        const newData = data.features.map((item) => {
          return {
            cityName: item.properties.city,
            postcode: item.properties.postcode,
            latitude: item.geometry.coordinates[1],
            longitude: item.geometry.coordinates[0],
          };
        });
        this.suggestions = newData.map(
          (city) => city.cityName + ", " + city.postcode
        );
        this.cities = newData;
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    },
    async selectSuggestion(suggestion) {
      const city = suggestion.split([","])[0];
      const formattedSuggestion = this.cities.find(
        (item) => item.cityName === city
      );
      this.searchQuery = JSON.stringify(formattedSuggestion);
      this.suggestions = [];
      this.updateValue();
    },
    updateValue() {
      this.$emit("input", this.searchQuery);
    },
  },
};
</script>

<style scoped>
.custom-interface {
  position: relative;
}

input {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.suggestions-list {
  position: absolute;
  z-index: 1000;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 150px;
  overflow-y: auto;
}

.suggestions-list li {
  padding: 8px;
  cursor: pointer;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}
</style>
