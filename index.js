'use strict'

const { Readable } = require('stream')

function toReadable (iterator, opts) {
  const readable = new Readable(opts)

  readable._read = function () {
    next().catch(onError)
  }

  function onError (err) {
    readable.destroy(err)
  }

  async function next () {
    const { value, done } = await iterator.next()
    if (done) {
      readable.push(null)
      return
    }

    if (readable.push(value)) {
      await next()
    }
  }

  return readable
}

function once (emitter, name) {
  return new Promise((resolve, reject) => {
    const mainListener = (...args) => {
      if (secondListener !== undefined) {
        emitter.removeListener('error', secondListener)
      }
      resolve(args)
    }
    let secondListener

    if (name !== 'error') {
      secondListener = (err) => {
        emitter.removeListener(name, mainListener)
        reject(err)
      }

      emitter.once('error', secondListener)
    }

    emitter.once(name, mainListener)
  })
}

module.exports = {
  toReadable,
  once
}
