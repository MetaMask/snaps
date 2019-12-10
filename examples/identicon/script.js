const origin = 'https://mountainous-dentist.glitch.me/package.json'
const pluginOrigin = `wallet_plugin_${origin}`

const connectButton = document.querySelector('button.connect')

const setBlockieButton = document.querySelector('button.setBlockie')

connectButton.addEventListener('click', connect)

setBlockieButton.addEventListener('click', setBlockie)



async function connect () {
    await ethereum.send({
    method: 'wallet_requestPermissions',
    params: [{
        [pluginOrigin]: {}
    }]
    })
}

async function setBlockie () {
    const val = document.querySelector('input[name="identicon"]:checked').value

    try {
    const response = await ethereum.send({
        method: pluginOrigin,
        params: [{
        method: 'setUseBlockie',
        params: [JSON.parse(val)]
        }]
    })

    alert('couldnt change it ' + response.result)
    } catch (err) {
    console.error(err)
    console.log('houston we have a problem: ' + err.message || err)
    }
}