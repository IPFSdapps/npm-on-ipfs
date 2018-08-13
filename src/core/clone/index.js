'use strict'

require('dnscache')({ enable: true })

const follow = require('follow-registry')
const once = require('once')
const ipfsBlobStore = require('ipfs-blob-store')
const add = require('./add')

const createRegistryUpdateHandler = (options, blobStore) => {
  return function onRegistryUpdate (data, callback) {
    if (!data.json.name) {
      return callback() // Bail, something is wrong with this change
    }

    callback = once(callback)

    add(options, data, blobStore)
      .then(() => {
        console.log(`🐙 [${data.seq}] processed ${data.json.name}`)
      })
      .catch((error) => {
        console.error(`💥 [${data.seq}] error processing ${data.json.name} - ${error}`)
      })
      .then(() => {
        setTimeout(() => callback(), options.clone.delay)
      })
  }
}

module.exports = (options, blobStore) => {
  console.info('🌈 Cloning registry...')

  if (options.clone.downloadTarballs) {
    console.info('🍭 Downloading tarballs')
  }

  follow({
    ua: options.clone.userAgent,
    skim: options.clone.skim,
    // registry: options.clone.registry,
    handler: createRegistryUpdateHandler(options, blobStore || ipfsBlobStore(options.ipfs))
  })
}
