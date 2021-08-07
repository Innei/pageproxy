import axios from 'axios'

const instance = axios.create({
  baseURL: window.context.apiUrl,
})
export const request = instance