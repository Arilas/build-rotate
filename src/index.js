#!/usr/bin/env node
/** @flow */
import cli from 'cli'
import fs from 'fs'

type Params = {
  keep: number,
  build: number,
  folder: string,
  emulate: boolean
}

const params: Params = cli.parse({
  emulate: ['e', 'Emulate process without real execution', 'bool', false],
  keep: ['k', 'Max numbers of builds to keep', 'int', 4],
  build: ['b', 'Build number', 'int'],
  folder: ['f', 'PWD', 'string', process.env.PWD]
})

const { keep, build, folder, emulate } = params
const latestLink = folder + '/latest'
const buildsFoler = folder + '/builds'
const lastBuild = buildsFoler + '/' + build

if (!fs.statSync(buildsFoler).isDirectory() || !fs.statSync(lastBuild).isDirectory()) {
  throw new Error(
    `Script not found build #${build} inside ${buildsFolder}. Please check that it's exist.`
  )
}

if (emulate) {
  console.log('Emulating process to test that everything works well')
  console.log('PWD: ', folder)
  console.log('Build: ', build)
  console.log('Keep: ', keep)
}

const buildsContent = fs.readdirSync(buildsFoler)
if (buildsContent.length > keep) {
  console.log('Found old builds')
  const toRemove = buildsContent.sort().slice(0, buildsContent.length - keep)
  for (const build of toRemove) {
    console.log('Removing build: ' + build)
    !emulate && fs.rmdirSync(buildsFoler + '/' + build)
  }
}
const lastBuildInFolder = parseInt(buildsContent.sort().pop())
if (lastBuildInFolder !== build) {
  console.warn(`We found build #${lastBuildInFolder} in builds folder that in newer than requested #${build}. Please check that everything correct`)
}

try {
  if (fs.statSync(latestLink).isDirectory()) {
    console.log('Unlink old latest')
    !emulate && fs.unlinkSync(latestLink)
  }
} catch (e) {
  // There's no latest link
}
console.log('Making symlink to new build')
!emulate && fs.symlinkSync(lastBuild, latestLink)

console.log(`Latest in now pointed to ${build}`)
