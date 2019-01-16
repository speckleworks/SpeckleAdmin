import * as THREE from 'three'
import OrbitControls from 'threejs-orbit-controls'

import Axios from 'axios'
import EE from 'event-emitter-es6'

import { Converter, SceneManager } from './SpeckleConverter.js'
// import TWEEN from 'tween.js'

export default class SpeckleRenderer extends EE {

  constructor( { domObject } ) {
    super( ) // event emitter init
    this.domObject = domObject
    this.renderer = null
    this.scene = null
    this.camera = null
    this.controls = null
    this.orbitControls = null
    this.hemiLight = null
    this.flashLight = null
    this.raycaster = null
    this.isInitialised = false
    this.objectIds = new Set( )

    this.initialise( )
  }

  initialise( ) {
    this.renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } )
    this.renderer.setSize( this.domObject.offsetWidth, this.domObject.offsetHeight )
    this.renderer.setClearColor( new THREE.Color( '#FFFFFF' ), 0 )
    this.domObject.appendChild( this.renderer.domElement )

    this.scene = new THREE.Scene( )

    let axesHelper = new THREE.AxesHelper( 50 )
    this.scene.add( axesHelper )

    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 )
    hemiLight.color = new THREE.Color( '#FFFFFF' )
    hemiLight.groundColor = new THREE.Color( '#959595' )
    hemiLight.position.set( 0, 500, 0 )
    hemiLight.isCurrent = true
    hemiLight.name = 'world lighting'
    this.scene.add( hemiLight )

    // let gridHelper = new THREE.GridHelper( 200, 20 );
    // this.scene.add( gridHelper )

    this.camera = new THREE.PerspectiveCamera( 75, this.domObject.offsetWidth / this.domObject.offsetHeight, 0.1, 100000 );
    this.camera.up.set( 0, 0, 1 )
    this.camera.position.z = 1000
    this.camera.isCurrent = true

    let flashlight = new THREE.PointLight( new THREE.Color( '#FFFFFF' ), 0.32, 0, 1 )
    flashlight.name = 'camera light'
    this.camera.add( flashlight )

    this.controls = new OrbitControls( this.camera, this.renderer.domElement )
    this.controls.enabled = true

    if ( webpackHotUpdate ) {
      console.log( 'In Dev Mode' );
    }

    window.scene = this.scene
    window.addEventListener( 'resize', this.resizeCanvas.bind( this ), false )
    this.render( )
  }

  animate( ) {
    requestAnimationFrame( this.animate.bind( this ) );
    this.render( )
    this.controls.update( )
  }

  render( ) {
    this.renderer.render( this.scene, this.camera );
  }

  resizeCanvas( ) {
    this.camera.aspect = this.domObject.offsetWidth / this.domObject.offsetHeight
    this.camera.updateProjectionMatrix( )
    this.renderer.setSize( this.domObject.offsetWidth, this.domObject.offsetHeight );
  }

  // add and remove objects
  loadObjects( { objs, zoomExtents } ) {
    objs.forEach( obj => {
      try {
        if ( Converter.hasOwnProperty( obj.type ) )
          Converter[ obj.type ]( { obj: obj }, ( err, threeObj ) => {
            threeObj._id = obj._id
            this.scene.add( threeObj )
          } )
      } catch ( e ) {}
    } )

  }

  unloadObjects( { objIds } ) {
    // this.scene.children = this.scene.children.filter( object => {
    //   // if ( !object.hasOwnProperty( '_id' ) ) return true
    //   console.log( object._id, objIds.indexOf( object._id ) )
    //   if ( objIds.indexOf( object._id ) !== -1 ) return false
    // } )
    //
    let toRemove = [ ]
    this.scene.traverse( obj => {
      if ( obj._id )
        if ( objIds.indexOf( obj._id ) !== -1 ) toRemove.push( obj )
    } )
    // let toRemove = this.scene.children.filter( obj => objIds.indexOf( obj._id ) !== -1 )
    // console.log( toRemove.map( o => o._id ) )
    toRemove.forEach( object => {
      this.scene.remove( object )
    })
  }

  ghostObjects( objIds ) {}
  unGhostObjects( objIds ) {}

  showObjects( objIds ) {}
  hideObjects( objIds ) {}

  highlightObjects( objIds ) {}
  unHighlightObjects( objIds ) {}

  zoomToObject( ) {}
  zoomExtents( ) {}

  computeSceneBoundingSphere( ) {}
  setFar( ) {}
  setCamera( ) {}
}
