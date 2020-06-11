import { Suite } from 'benchmark'
const suite = new Suite()

import { Env } from '../src/Env'
const cachedInstance = new Env(true)
const nonCachedInstance = new Env()

cachedInstance.process('APP_KEY = 10')
nonCachedInstance.process('APP_KEY = 10')

// add tests
suite
  .add('With Cache', function () {
    cachedInstance.get('APP_KEY')
  })
  .add('Without Cache', function () {
    nonCachedInstance.get('APP_KEY')
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  // run async
  .run()
