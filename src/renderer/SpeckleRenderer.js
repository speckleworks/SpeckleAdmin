import * as THREE from 'three'
import OrbitControls from 'threejs-orbit-controls'
// import TWEEN from 'tween.js'

export default class SpeckleRenderer {

  constructor( { domObject } ) {
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

    this.camera = new THREE.PerspectiveCamera( 75, this.domObject.offsetWidth / this.domObject.offsetHeight, 0.1, 100000 );
    this.camera.up.set( 0, 0, 1 )
    this.camera.position.z = 1000
    this.camera.isCurrent = true
    this.camera.name = 'my super camera'

    this.controls = new OrbitControls( this.camera, this.renderer.domElement )
    this.controls.enabled = true

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
  loadObjects( { objIds, zoomExtents, } ) {}
  unloadObjects( { objIds, streamId } ) {}

  ghostObjects( objIds ) {}
  unGhostObjects( objIds ) {}
  showObjects( objIds ) {}
  hideObjects( objIds ) {}

  zoomToObject( ) {}
  zoomExtents( ) {}

  computeSceneBoundingSphere( ) {}
  setFar( ) {}
  setCamera( ) {}


  // material helpers
  getMeshMaterial( color ) {}
  getLineMaterial( color ) {}
  getPointsMaterial( color ) {}
}
