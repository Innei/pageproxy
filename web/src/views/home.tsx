import { defineComponent, onMounted, ref } from 'vue'
import { request } from '../utils/request'

export default defineComponent({
  setup() {
    const user = ref()
    onMounted(async () => {
      const { data } = await request.get('/master')
      user.value = data
    })
    return () => (
      <div>
        <p>Fetch data:</p>
        <pre>{JSON.stringify(user.value)}</pre>

        <p>user: </p>
        <pre>window.user = {JSON.stringify(window.user)}</pre>
      </div>
    )
  },
})
