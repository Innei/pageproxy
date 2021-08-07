import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { request } from '../utils/request'
export default defineComponent({
  setup() {
    const router = useRouter()
    const login = () => {
      request.post('/login').then(() => {
        router.push('/')
      })
    }
    return () => (
      <div>
        <button
          onClick={() => {
            login()
          }}
        >
          Login
        </button>
      </div>
    )
  },
})
