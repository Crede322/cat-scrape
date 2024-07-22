<template>
  <div :class="style.wrapper">
    <h1>Web Scrapper</h1>
    <form @submit.prevent="scrapeCatalog" :class="[style.input__box, { increased: pictureShown }]">
      <button
        v-if="!pictureShown"
        @click="setTogglePicture"
        :class="style.button__screenshot_preview"
        type="button"
      >
        <img src="./assets//screenshotLabel.svg" alt="screenshot label" />
      </button>
      <button
        v-if="pictureShown"
        @click="setTogglePicture"
        :class="style.button__screenshot_shown"
        type="button"
      >
        <img :src="botScreenshotSrc" alt="bot screenshot" :class="style.bot__screenshot" />
      </button>
      <div>
        <button :class="style.selected_site" type="button" @click="showToggleOverlay">
          <h2 v-if="websiteName">Сайт : {{ websiteName }}</h2>
          <h2 v-if="!websiteName">Выбрать сайт</h2>
        </button>
        <div :class="style.input__wrapper">
          <input
            type="text"
            id="scrapeUrl"
            v-model="scrapeUrl"
            required
            autocomplete="off"
            placeholder="url"
          />
        </div>
        <div :class="style.input__wrapper">
          <h4>.</h4>
          <input
            type="text"
            id="scrapeClassname"
            v-model="scrapeClassname"
            required
            autocomplete="off"
            placeholder="classname"
          />
        </div>
        <div :class="style.input__wrapper">
          <input
            type="text"
            id="scrapeQuery"
            v-model="scrapeQuery"
            required
            autocomplete="off"
            placeholder="Поисковой запрос на сайте"
          />
        </div>
        <button type="submit" :class="style.button__submit">Scrape</button>
      </div>
    </form>
    <div v-if="toggleLoading" :class="style.loading_spinner"></div>
    <div v-if="response && response.data">
      <ul :class="style.result__list">
        <li :class="style.result__item" v-for="(item, index) in response.data.result" :key="index">
          <pre :class="style.result__text">{{ item[0] }}</pre>
        </li>
      </ul>
    </div>
    <div v-else>No data yet</div>
  </div>
  <!-- overlay -->
  <div v-if="websitesOverlayShown" :class="style.overlay">
    <div :class="style.overlay__buttons_wrapper">
      <div :class="style.overlay__buttons_container">
        <button @click="buttonWebsiteClick(sitename)" v-for="(sitename, key) in config" :key="key">
          {{ key }}
        </button>
      </div>
    </div>
  </div>
</template>

<!--------------------------------------------------- скрипт --------------------------------------------------->
<script setup>
import style from './App.module.css'
import axios from 'axios'
import { ref } from 'vue'
import config from '../config.json'

const scrapeUrl = ref('')
const scrapeClassname = ref('')
const scrapeQuery = ref('')
const inputClassname = ref('')
const websiteName = ref('')
const response = ref(null)
const toggleLoading = ref(false)
const pictureShown = ref(false)
const botScreenshotSrc = ref(null)
const websitesOverlayShown = ref(false)

async function scrapeCatalog() {
  toggleLoading.value = true
  try {
    response.value = await axios.get('http://localhost:3000/scrape', {
      params: {
        scrapeUrl: scrapeUrl.value,
        scrapeClassname: scrapeClassname.value,
        scrapeQuery: scrapeQuery.value,
        inputClassname: inputClassname.value
      }
    })
    botScreenshotSrc.value = 'data:image/png;base64,' + response.value.data.screenshot
    console.log('данные получены :', response.value.data.result[0])
    toggleLoading.value = false
  } catch (error) {
    console.log('ошибка пришедшяя с бэкенда :', error)
    toggleLoading.value = false
  }
}

function setTogglePicture() {
  pictureShown.value = !pictureShown.value
}

function showToggleOverlay() {
  websitesOverlayShown.value = true
}

function buttonWebsiteClick(sitename) {
  websitesOverlayShown.value = false
  websiteName.value = sitename.name
  scrapeUrl.value = sitename.url
  scrapeClassname.value = sitename.classname
  inputClassname.value = sitename.inputClassname
}
</script>

<!--------------------------------------------------- стили --------------------------------------------------->
<style scoped></style>
