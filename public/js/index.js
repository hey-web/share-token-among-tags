async function delay(n) {
  return new Promise(resolve => {
    setTimeout(() => resolve(),n)
  })
}

function updateTokenOnPage(token) {
  const span = document.querySelector('#token')
  span.innerHTML = token
}

function updateNodeType(type) {
  const nodeType = document.querySelector('#node_type')
  nodeType.textContent = type
}

function updateTitle(title) {
  document.title = title
}

const _state = {
  node: null,
  token: null,
  main: false
}

const state = new Proxy(_state, {
  set(target, prop, value) {
    if (!(prop in target)) {
      throw new Error(`rejected to assign additional property: ${prop}`)
    }
    switch(prop) {
      case 'token': updateTokenOnPage(value); break;
      case 'main': updateNodeType(value ? 'main' : 'other'); break;
      case 'node': updateTitle(value); break;
      default: null
    }
    Reflect.set(target, prop, value)
    return true
  }
})

async function getToken() {
  console.log('Fetching token...')
  await delay(200)
  const token = `${Math.random()}`.substring(2, 9)
  state.token = token
  localStorage.setItem('token', token)
  console.log(`Fetched token:${token}`)
}

(async () => {

  window.addEventListener('storage', (event) => {
    const {key, newValue, oldValue} = event
    if (key === 'token') {
      state.token = newValue
      console.log(`Received new token:${newValue}`)
    }
  });

  window.addEventListener('beforeunload', (event) => {
    const nodes = JSON.parse(localStorage.getItem('nodes') || `{}`)
    delete nodes[state.node]
    localStorage.setItem('nodes', JSON.stringify(nodes))
    const main = localStorage.getItem('main')
    if (parseFloat(main) === state.node) {
      localStorage.removeItem('main')
    }
  });

  state.node = Math.random()
  const nodes = JSON.parse(localStorage.getItem('nodes') || `{}`)
  localStorage.setItem('nodes', JSON.stringify({...nodes, [state.node]: null}))

  const main = localStorage.getItem('main')
  if (!main || state.node >= parseFloat(main)) {
    localStorage.setItem('main', state.node)
    state.main = true
  }

  setInterval(() => {
    const main = localStorage.getItem('main')
    if (!main || state.node >= parseFloat(main)) {
      localStorage.setItem('main', state.node)
      state.main = true
    } else {
      state.main = false
    }
  }, [200])

  setInterval(() => {
    if (state.main) {
      getToken()
    }
  }, [1000])

})()


